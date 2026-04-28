"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./page.module.css";

const STORAGE_KEY = "smsdev_api_key_v1";
const STORAGE_THRESHOLD = "smsdev_threshold_v1";

type CheckResponse =
  | {
      status: "ok" | "low";
      saldo: number;
      threshold: number;
      descricao?: string;
      keySource?: "env" | "request";
    }
  | {
      status: "error";
      descricao: string;
      hint?: string;
      httpStatus?: number;
    };

interface SmsDevToolProps {
  hasEnvKey: boolean;
}

export function SmsDevTool({ hasEnvKey }: SmsDevToolProps) {
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [remember, setRemember] = useState(true);
  const [threshold, setThreshold] = useState(500);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckResponse | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setApiKey(saved);
        setRemember(true);
      }
      const t = localStorage.getItem(STORAGE_THRESHOLD);
      if (t) {
        const parsed = parseInt(t, 10);
        if (Number.isFinite(parsed) && parsed > 0) setThreshold(parsed);
      }
    } catch {
      /* ignore */
    } finally {
      setHydrated(true);
    }
  }, []);

  const canSubmit = useMemo(() => {
    if (loading) return false;
    if (apiKey.trim()) return true;
    return hasEnvKey;
  }, [loading, apiKey, hasEnvKey]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    try {
      if (apiKey.trim() && remember) {
        localStorage.setItem(STORAGE_KEY, apiKey.trim());
      } else if (!remember) {
        localStorage.removeItem(STORAGE_KEY);
      }
      localStorage.setItem(STORAGE_THRESHOLD, String(threshold));
    } catch {
      /* ignore */
    }

    setLoading(true);
    setResult(null);
    try {
      const resp = await fetch("/api/tools/smsdev-balance", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          apiKey: apiKey.trim() || undefined,
          threshold,
        }),
      });
      const data = (await resp.json()) as CheckResponse;
      setResult(data);
    } catch {
      setResult({
        status: "error",
        descricao: "Falha de rede ao chamar o servidor do Hubble.",
      });
    } finally {
      setLoading(false);
    }
  }

  function handleClearKey() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setApiKey("");
  }

  return (
    <div className={styles.toolWrap}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGrid}>
          <div className={styles.field}>
            <label className={styles.fieldLabel} htmlFor="apiKey">
              Chave da API
              {hasEnvKey && (
                <span className={styles.fieldHint}>
                  · opcional — chave do servidor disponível
                </span>
              )}
            </label>
            <div className={styles.inputWrap}>
              <input
                id="apiKey"
                type={showKey ? "text" : "password"}
                className={`${styles.input} ${styles.inputMono} ${styles.inputWithToggle}`}
                placeholder={
                  hasEnvKey
                    ? "deixe vazio para usar a chave do servidor"
                    : "cole sua chave SMS Dev"
                }
                autoComplete="off"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <button
                type="button"
                className={styles.inputToggle}
                onClick={() => setShowKey((s) => !s)}
                aria-label={showKey ? "Ocultar chave" : "Mostrar chave"}
              >
                {showKey ? "Ocultar" : "Mostrar"}
              </button>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel} htmlFor="threshold">
              Limite de alerta
            </label>
            <input
              id="threshold"
              type="number"
              min={1}
              step={1}
              className={styles.input}
              value={threshold}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10);
                setThreshold(Number.isFinite(v) && v > 0 ? v : 1);
              }}
            />
          </div>
        </div>

        {hydrated && apiKey.trim().length > 0 && (
          <label className={styles.check}>
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            <span>Salvar chave neste navegador</span>
            <span className={styles.checkHint}>
              · localStorage local, nunca enviada para terceiros
            </span>
          </label>
        )}

        <div className={styles.actions}>
          <button
            type="submit"
            className={`${styles.btn} ${styles.btnPrimary}`}
            disabled={!canSubmit}
          >
            {loading ? (
              <>
                <span className={styles.spinner} aria-hidden="true" />
                <span>Consultando…</span>
              </>
            ) : (
              <span>Verificar saldo</span>
            )}
          </button>
          {apiKey.trim().length > 0 && (
            <button
              type="button"
              className={`${styles.btn} ${styles.btnGhost}`}
              onClick={handleClearKey}
            >
              Limpar chave salva
            </button>
          )}
        </div>

        {!hasEnvKey && !apiKey.trim() && hydrated && (
          <p className={styles.helper}>
            Cole sua chave da API SMS Dev acima ou peça ao admin para definir{" "}
            <code>SMSDEV_API_KEY</code> no servidor.
          </p>
        )}
      </form>

      {result && <ResultCard result={result} />}
    </div>
  );
}

function ResultCard({ result }: { result: CheckResponse }) {
  if (result.status === "error") {
    return (
      <div className={`${styles.result} ${styles.resultErr}`} role="status">
        <div className={styles.resultIco} aria-hidden="true">
          <ErrorIcon />
        </div>
        <div className={styles.resultBody}>
          <div className={styles.resultTitle}>
            Não consegui consultar o saldo
          </div>
          <p className={styles.resultMeta}>{result.descricao}</p>
          {hintFor(result) && (
            <p className={styles.resultHint}>{hintFor(result)}</p>
          )}
        </div>
      </div>
    );
  }

  const low = result.status === "low";
  const cls = low ? styles.resultLow : styles.resultOk;
  const title = low ? "Atenção: saldo baixo" : "Saldo OK";
  return (
    <div className={`${styles.result} ${cls}`} role="status">
      <div className={styles.resultIco} aria-hidden="true">
        {low ? <WarnIcon /> : <CheckIcon />}
      </div>
      <div className={styles.resultBody}>
        <div className={styles.resultTitle}>{title}</div>
        <div className={styles.resultSaldo}>
          {result.saldo.toLocaleString("pt-BR")}
          <span className={styles.resultUnit}>SMS</span>
        </div>
        <p className={styles.resultMeta}>
          {low ? (
            <>
              Está <strong>abaixo</strong> do seu limite de alerta (
              {result.threshold} SMS). Considere recarregar antes que acabe.
            </>
          ) : (
            <>
              Está acima do seu limite de alerta ({result.threshold} SMS).
            </>
          )}
        </p>
        {result.descricao && (
          <p className={styles.resultDescricao}>{result.descricao}</p>
        )}
        {result.keySource === "request" && (
          <p className={styles.resultHint}>
            Consultado com a chave deste navegador.
          </p>
        )}
        {result.keySource === "env" && (
          <p className={styles.resultHint}>
            Consultado com a chave configurada no servidor.
          </p>
        )}
      </div>
    </div>
  );
}

function hintFor(result: Extract<CheckResponse, { status: "error" }>) {
  switch (result.hint) {
    case "missing-key":
      return "Cole sua chave da API ou peça ao admin para definir SMSDEV_API_KEY.";
    case "auth":
      return "A chave está inválida ou foi revogada — gere uma nova no painel SMS Dev.";
    case "upstream":
      return "API do SMS Dev fora do ar. Tente novamente em alguns minutos.";
    case "timeout":
      return "Tente novamente em alguns segundos.";
    case "network":
      return "Verifique a conectividade do servidor com api.smsdev.com.br.";
    case "api":
      return "A API recusou a consulta — confira a chave no painel SMS Dev.";
    default:
      return null;
  }
}

function CheckIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function WarnIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}
