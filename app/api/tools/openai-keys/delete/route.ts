import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  deleteProjectApiKeys,
  OPENAI_KEYS_MAX_DELETE,
  type DeleteTarget,
} from "@/lib/tools/openai-keys";

const ALLOWED_DOMAINS = ["zapsign.com.br", "truora.com"] as const;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function ensureAuthorized(): Promise<NextResponse | null> {
  const session = await auth();
  const email = session?.user?.email ?? null;
  const domain = email?.split("@")[1]?.toLowerCase();
  if (
    !email ||
    !domain ||
    !(ALLOWED_DOMAINS as readonly string[]).includes(domain)
  ) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return null;
}

function parseTargets(body: unknown): DeleteTarget[] | null {
  if (!body || typeof body !== "object") return null;
  const raw = (body as { targets?: unknown }).targets;
  if (!Array.isArray(raw)) return null;
  const out: DeleteTarget[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") return null;
    const projectId = (item as { projectId?: unknown }).projectId;
    const keyId = (item as { keyId?: unknown }).keyId;
    if (typeof projectId !== "string" || typeof keyId !== "string") return null;
    if (!projectId || !keyId) return null;
    out.push({ projectId, keyId });
  }
  return out;
}

export async function POST(req: Request) {
  const unauthorized = await ensureAuthorized();
  if (unauthorized) return unauthorized;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { status: "error", descricao: "Body inválido (JSON esperado)." },
      { status: 400 },
    );
  }

  const targets = parseTargets(body);
  if (!targets) {
    return NextResponse.json(
      {
        status: "error",
        descricao:
          "Formato esperado: { targets: [{ projectId: string, keyId: string }] }.",
      },
      { status: 400 },
    );
  }

  if (targets.length === 0) {
    return NextResponse.json({
      status: "ok",
      results: [],
      deleted: 0,
      failed: 0,
    });
  }

  if (targets.length > OPENAI_KEYS_MAX_DELETE) {
    return NextResponse.json(
      {
        status: "error",
        descricao: `Máximo de ${OPENAI_KEYS_MAX_DELETE} keys por requisição.`,
      },
      { status: 400 },
    );
  }

  const result = await deleteProjectApiKeys(targets);
  return NextResponse.json(result);
}
