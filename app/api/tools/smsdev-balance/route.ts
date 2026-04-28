import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const ALLOWED_DOMAINS = ["zapsign.com.br", "truora.com"] as const;
const API_URL = "https://api.smsdev.com.br/v1/balance";
const TIMEOUT_MS = 15_000;
const DEFAULT_THRESHOLD = 500;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SmsDevApiResponse = {
  situacao?: string;
  descricao?: string;
  saldo_sms?: string | number;
  [k: string]: unknown;
};

type CheckResult =
  | {
      status: "ok" | "low";
      saldo: number;
      threshold: number;
      descricao: string;
    }
  | {
      status: "error";
      descricao: string;
      hint?: string;
      httpStatus?: number;
    };

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

export async function POST(req: Request) {
  const unauthorized = await ensureAuthorized();
  if (unauthorized) return unauthorized;

  let body: { threshold?: number } = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const threshold =
    typeof body.threshold === "number" && Number.isFinite(body.threshold)
      ? Math.max(1, Math.floor(body.threshold))
      : DEFAULT_THRESHOLD;

  const apiKey = process.env.SMSDEV_API_KEY?.trim() ?? "";
  if (!apiKey) {
    return NextResponse.json<CheckResult>({
      status: "error",
      descricao:
        "SMSDEV_API_KEY não está configurada no servidor. Adicione a env var no painel de deploy e tente novamente.",
      hint: "missing-key",
    });
  }

  const url = `${API_URL}?key=${encodeURIComponent(apiKey)}`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);

  let resp: Response;
  try {
    resp = await fetch(url, { method: "GET", signal: ctrl.signal });
  } catch (err) {
    clearTimeout(timer);
    const isAbort = err instanceof DOMException && err.name === "AbortError";
    return NextResponse.json<CheckResult>({
      status: "error",
      descricao: isAbort
        ? "A API do SMS Dev demorou demais para responder."
        : "Falha de rede ao chamar a API do SMS Dev.",
      hint: isAbort ? "timeout" : "network",
    });
  }
  clearTimeout(timer);

  if (!resp.ok) {
    const reason = resp.statusText || "erro";
    let hint: string | undefined;
    if (resp.status === 401 || resp.status === 403) hint = "auth";
    else if (resp.status >= 500) hint = "upstream";
    return NextResponse.json<CheckResult>({
      status: "error",
      descricao: `HTTP ${resp.status} ao consultar SMS Dev: ${reason}.`,
      httpStatus: resp.status,
      hint,
    });
  }

  let data: SmsDevApiResponse;
  try {
    data = (await resp.json()) as SmsDevApiResponse;
  } catch {
    return NextResponse.json<CheckResult>({
      status: "error",
      descricao: "Resposta inválida da API SMS Dev (não é JSON).",
    });
  }

  const situacao = String(data.situacao ?? "").toUpperCase();
  if (situacao !== "OK") {
    return NextResponse.json<CheckResult>({
      status: "error",
      descricao:
        (typeof data.descricao === "string" && data.descricao) ||
        "Erro retornado pela API SMS Dev.",
      hint: "api",
    });
  }

  const rawSaldo = data.saldo_sms;
  const parsed =
    typeof rawSaldo === "number"
      ? rawSaldo
      : parseInt(String(rawSaldo ?? "0").trim(), 10);

  if (!Number.isFinite(parsed)) {
    return NextResponse.json<CheckResult>({
      status: "error",
      descricao: `Saldo inesperado na resposta: ${JSON.stringify(rawSaldo)}.`,
    });
  }

  const saldo = Math.trunc(parsed);
  const status: "ok" | "low" = saldo < threshold ? "low" : "ok";

  return NextResponse.json<CheckResult>({
    status,
    saldo,
    threshold,
    descricao:
      (typeof data.descricao === "string" && data.descricao) || "",
  });
}
