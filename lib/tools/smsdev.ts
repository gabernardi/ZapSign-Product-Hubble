const API_URL = "https://api.smsdev.com.br/v1/balance";
const TIMEOUT_MS = 15_000;

export const SMSDEV_DEFAULT_THRESHOLD = 500;

type SmsDevApiResponse = {
  situacao?: string;
  descricao?: string;
  saldo_sms?: string | number;
  [k: string]: unknown;
};

export type SmsDevCheckResult =
  | {
      status: "ok" | "low";
      saldo: number;
      threshold: number;
      descricao: string;
    }
  | {
      status: "error";
      descricao: string;
      hint?:
        | "missing-key"
        | "auth"
        | "upstream"
        | "timeout"
        | "network"
        | "api"
        | "parse";
      httpStatus?: number;
    };

export interface CheckBalanceOptions {
  threshold?: number;
  apiKey?: string;
}

export async function checkSmsDevBalance(
  options: CheckBalanceOptions = {},
): Promise<SmsDevCheckResult> {
  const threshold =
    typeof options.threshold === "number" && Number.isFinite(options.threshold)
      ? Math.max(1, Math.floor(options.threshold))
      : SMSDEV_DEFAULT_THRESHOLD;

  const apiKey =
    (options.apiKey ?? process.env.SMSDEV_API_KEY ?? "").trim();

  if (!apiKey) {
    return {
      status: "error",
      descricao:
        "SMSDEV_API_KEY não está configurada no servidor. Adicione a env var no painel de deploy e tente novamente.",
      hint: "missing-key",
    };
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
    return {
      status: "error",
      descricao: isAbort
        ? "A API do SMS Dev demorou demais para responder."
        : "Falha de rede ao chamar a API do SMS Dev.",
      hint: isAbort ? "timeout" : "network",
    };
  }
  clearTimeout(timer);

  if (!resp.ok) {
    const reason = resp.statusText || "erro";
    let hint: "auth" | "upstream" | undefined;
    if (resp.status === 401 || resp.status === 403) hint = "auth";
    else if (resp.status >= 500) hint = "upstream";
    return {
      status: "error",
      descricao: `HTTP ${resp.status} ao consultar SMS Dev: ${reason}.`,
      httpStatus: resp.status,
      hint,
    };
  }

  let data: SmsDevApiResponse;
  try {
    data = (await resp.json()) as SmsDevApiResponse;
  } catch {
    return {
      status: "error",
      descricao: "Resposta inválida da API SMS Dev (não é JSON).",
      hint: "parse",
    };
  }

  const situacao = String(data.situacao ?? "").toUpperCase();
  if (situacao !== "OK") {
    return {
      status: "error",
      descricao:
        (typeof data.descricao === "string" && data.descricao) ||
        "Erro retornado pela API SMS Dev.",
      hint: "api",
    };
  }

  const rawSaldo = data.saldo_sms;
  const parsed =
    typeof rawSaldo === "number"
      ? rawSaldo
      : parseInt(String(rawSaldo ?? "0").trim(), 10);

  if (!Number.isFinite(parsed)) {
    return {
      status: "error",
      descricao: `Saldo inesperado na resposta: ${JSON.stringify(rawSaldo)}.`,
      hint: "parse",
    };
  }

  const saldo = Math.trunc(parsed);
  const status: "ok" | "low" = saldo < threshold ? "low" : "ok";

  return {
    status,
    saldo,
    threshold,
    descricao:
      (typeof data.descricao === "string" && data.descricao) || "",
  };
}
