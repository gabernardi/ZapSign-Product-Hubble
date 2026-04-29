const BASE_URL = "https://api.openai.com/v1";
const TIMEOUT_MS = 20_000;
const PAGE_LIMIT = 100;
const DELETE_CONCURRENCY = 5;

export const OPENAI_KEYS_DEFAULT_THRESHOLD_DAYS = 60;
export const OPENAI_KEYS_MAX_DELETE = 200;

/**
 * Emails autorizados a EXCLUIR API keys da OpenAI.
 * Qualquer outro usuário (mesmo do domínio zapsign.com.br) consegue
 * apenas visualizar a listagem.
 */
export const OPENAI_KEYS_DELETE_ALLOWLIST: readonly string[] = [
  "gabriel@zapsign.com.br",
];

export function canDeleteOpenAIKeys(
  email: string | null | undefined,
): boolean {
  if (!email) return false;
  return OPENAI_KEYS_DELETE_ALLOWLIST.includes(email.toLowerCase());
}

export type ScanErrorHint =
  | "missing-key"
  | "auth"
  | "upstream"
  | "timeout"
  | "network"
  | "api"
  | "parse";

export interface ProjectKey {
  keyId: string;
  name: string | null;
  createdAt: number | null;
  lastUsedAt: number | null;
  ownerEmail: string | null;
  ownerName: string | null;
  projectId: string;
  projectName: string;
  redactedValue: string | null;
}

export type ScanResult =
  | {
      status: "ok";
      keys: ProjectKey[];
      totals: { projects: number; keys: number };
    }
  | {
      status: "error";
      descricao: string;
      hint?: ScanErrorHint;
      httpStatus?: number;
    };

export interface DeleteTarget {
  projectId: string;
  keyId: string;
}

export interface DeleteItemResult {
  projectId: string;
  keyId: string;
  ok: boolean;
  httpStatus?: number;
  error?: string;
}

export type DeleteResult =
  | {
      status: "ok";
      results: DeleteItemResult[];
      deleted: number;
      failed: number;
    }
  | {
      status: "error";
      descricao: string;
      hint?: ScanErrorHint;
    };

function getAdminKey(): string {
  return (process.env.OPENAI_ADMIN_KEY ?? "").trim();
}

function authHeaders(adminKey: string): HeadersInit {
  return {
    Authorization: `Bearer ${adminKey}`,
    "Content-Type": "application/json",
  };
}

function daysSinceSeconds(unixSeconds: number | null | undefined): number | null {
  if (typeof unixSeconds !== "number" || !Number.isFinite(unixSeconds)) {
    return null;
  }
  const now = Date.now() / 1000;
  return (now - unixSeconds) / 86400;
}

export function daysSince(unixSeconds: number | null | undefined): number | null {
  return daysSinceSeconds(unixSeconds);
}

interface PaginatedResponse<T> {
  data: T[];
  has_more?: boolean;
  last_id?: string;
}

async function fetchJson(
  url: string,
  adminKey: string,
  signal?: AbortSignal,
): Promise<{ ok: true; data: unknown } | { ok: false; status: number; statusText: string }> {
  const resp = await fetch(url, {
    method: "GET",
    headers: authHeaders(adminKey),
    signal,
    cache: "no-store",
  });
  if (!resp.ok) {
    return { ok: false, status: resp.status, statusText: resp.statusText };
  }
  const data = (await resp.json()) as unknown;
  return { ok: true, data };
}

async function paginate<T extends { id: string }>(
  baseUrl: string,
  adminKey: string,
  signal: AbortSignal,
): Promise<{ ok: true; items: T[] } | { ok: false; status: number; statusText: string }> {
  const items: T[] = [];
  let after: string | undefined;
  while (true) {
    const url = new URL(baseUrl);
    url.searchParams.set("limit", String(PAGE_LIMIT));
    if (after) url.searchParams.set("after", after);

    const result = await fetchJson(url.toString(), adminKey, signal);
    if (!result.ok) return result;

    const payload = result.data as PaginatedResponse<T> | undefined;
    const batch = Array.isArray(payload?.data) ? (payload!.data as T[]) : [];
    items.push(...batch);

    if (!payload?.has_more || batch.length === 0) break;

    const lastId = batch[batch.length - 1]?.id;
    if (!lastId || lastId === after) break;
    after = lastId;
  }
  return { ok: true, items };
}

interface RawProject {
  id: string;
  name?: string;
  status?: string;
}

interface RawProjectApiKey {
  id: string;
  name?: string | null;
  created_at?: number | null;
  last_used_at?: number | null;
  redacted_value?: string | null;
  owner?: {
    type?: string;
    user?: {
      id?: string;
      name?: string | null;
      email?: string | null;
    } | null;
    service_account?: {
      id?: string;
      name?: string | null;
    } | null;
  } | null;
}

function makeAbortError(): { status: "error"; descricao: string; hint: ScanErrorHint } {
  return {
    status: "error",
    descricao: "A API da OpenAI demorou demais para responder.",
    hint: "timeout",
  };
}

function describeUpstream(
  status: number,
  statusText: string,
): { hint: ScanErrorHint; descricao: string } {
  let hint: ScanErrorHint = "upstream";
  if (status === 401 || status === 403) hint = "auth";
  else if (status >= 500) hint = "upstream";
  else hint = "api";
  const reason = statusText || "erro";
  return {
    hint,
    descricao: `HTTP ${status} ao consultar OpenAI: ${reason}.`,
  };
}

export async function listProjectsWithKeys(): Promise<ScanResult> {
  const adminKey = getAdminKey();
  if (!adminKey) {
    return {
      status: "error",
      descricao:
        "OPENAI_ADMIN_KEY não está configurada no servidor. Adicione a env var no painel da Vercel e tente novamente.",
      hint: "missing-key",
    };
  }

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);

  try {
    const projectsRes = await paginate<RawProject>(
      `${BASE_URL}/organization/projects`,
      adminKey,
      ctrl.signal,
    );
    if (!projectsRes.ok) {
      const upstream = describeUpstream(projectsRes.status, projectsRes.statusText);
      return {
        status: "error",
        descricao: upstream.descricao,
        hint: upstream.hint,
        httpStatus: projectsRes.status,
      };
    }

    const projects = projectsRes.items.filter((p) => p.status !== "archived");
    const keys: ProjectKey[] = [];

    for (const project of projects) {
      const keysRes = await paginate<RawProjectApiKey>(
        `${BASE_URL}/organization/projects/${encodeURIComponent(project.id)}/api_keys`,
        adminKey,
        ctrl.signal,
      );
      if (!keysRes.ok) {
        // Skip project keys that failed (likely 404 archived / permission); continue.
        continue;
      }
      for (const key of keysRes.items) {
        const owner = key.owner ?? null;
        const ownerEmail = owner?.user?.email ?? null;
        const ownerName =
          owner?.user?.name ??
          owner?.service_account?.name ??
          null;
        keys.push({
          keyId: key.id,
          name: key.name ?? null,
          createdAt: typeof key.created_at === "number" ? key.created_at : null,
          lastUsedAt: typeof key.last_used_at === "number" ? key.last_used_at : null,
          ownerEmail,
          ownerName,
          projectId: project.id,
          projectName: project.name ?? project.id,
          redactedValue: key.redacted_value ?? null,
        });
      }
    }

    return {
      status: "ok",
      keys,
      totals: { projects: projects.length, keys: keys.length },
    };
  } catch (err) {
    const isAbort = err instanceof DOMException && err.name === "AbortError";
    if (isAbort) return makeAbortError();
    return {
      status: "error",
      descricao: "Falha de rede ao chamar a API da OpenAI.",
      hint: "network",
    };
  } finally {
    clearTimeout(timer);
  }
}

export async function deleteProjectApiKey(
  projectId: string,
  keyId: string,
): Promise<DeleteItemResult> {
  const adminKey = getAdminKey();
  if (!adminKey) {
    return {
      projectId,
      keyId,
      ok: false,
      error: "OPENAI_ADMIN_KEY ausente.",
    };
  }

  const url = `${BASE_URL}/organization/projects/${encodeURIComponent(
    projectId,
  )}/api_keys/${encodeURIComponent(keyId)}`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);

  try {
    const resp = await fetch(url, {
      method: "DELETE",
      headers: authHeaders(adminKey),
      signal: ctrl.signal,
      cache: "no-store",
    });
    if (resp.status === 200 || resp.status === 204) {
      return { projectId, keyId, ok: true, httpStatus: resp.status };
    }
    let body: string | undefined;
    try {
      const text = await resp.text();
      body = text.slice(0, 240);
    } catch {
      /* ignore */
    }
    return {
      projectId,
      keyId,
      ok: false,
      httpStatus: resp.status,
      error: body || resp.statusText || "erro",
    };
  } catch (err) {
    const isAbort = err instanceof DOMException && err.name === "AbortError";
    return {
      projectId,
      keyId,
      ok: false,
      error: isAbort ? "timeout" : "network",
    };
  } finally {
    clearTimeout(timer);
  }
}

export async function deleteProjectApiKeys(
  targets: DeleteTarget[],
): Promise<DeleteResult> {
  const adminKey = getAdminKey();
  if (!adminKey) {
    return {
      status: "error",
      descricao:
        "OPENAI_ADMIN_KEY não está configurada no servidor. Adicione a env var no painel da Vercel e tente novamente.",
      hint: "missing-key",
    };
  }

  const queue = [...targets];
  const results: DeleteItemResult[] = [];

  async function worker() {
    while (queue.length > 0) {
      const next = queue.shift();
      if (!next) break;
      const r = await deleteProjectApiKey(next.projectId, next.keyId);
      results.push(r);
    }
  }

  const workers = Array.from(
    { length: Math.min(DELETE_CONCURRENCY, targets.length) },
    () => worker(),
  );
  await Promise.all(workers);

  const deleted = results.filter((r) => r.ok).length;
  return {
    status: "ok",
    results,
    deleted,
    failed: results.length - deleted,
  };
}
