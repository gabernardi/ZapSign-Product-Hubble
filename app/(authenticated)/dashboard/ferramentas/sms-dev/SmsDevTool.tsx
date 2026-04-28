"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";

const STORAGE_THRESHOLD = "smsdev_threshold_v1";

type CheckResponse =
  | {
      status: "ok" | "low";
      saldo: number;
      threshold: number;
      descricao?: string;
    }
  | {
      status: "error";
      descricao: string;
      hint?: string;
      httpStatus?: number;
    };

export function SmsDevTool() {
  const [threshold, setThreshold] = useState(500);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckResponse | null>(null);

  useEffect(() => {
    try {
      const t = localStorage.getItem(STORAGE_THRESHOLD);
      if (t) {
        const parsed = parseInt(t, 10);
        if (Number.isFinite(parsed) && parsed > 0) setThreshold(parsed);
      }
    } catch {
      /* ignore */
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    try {
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
        body: JSON.stringify({ threshold }),
      });
      const data = (await resp.json()) as CheckResponse;
      setResult(data);
    } catch {
      setResult({
        status: "error",
        descricao: "Falha de rede ao chamar o servidor.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.toolWrap}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formRow}>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Limite de alerta</span>
            <input
              type="number"
              min={1}
              step={1}
              className={styles.input}
              value={threshold}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10);
                setThreshold(Number.isFinite(v) && v > 0 ? v : 1);
              }}
              aria-describedby="threshold-hint"
            />
            <span id="threshold-hint" className={styles.fieldHint}>
              SMS — alerta dispara abaixo desse valor
            </span>
          </label>

          <button
            type="submit"
            className={styles.btn}
            disabled={loading}
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
        </div>
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
  const title = low ? "Saldo baixo" : "Saldo OK";
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
              Abaixo do limite de alerta ({result.threshold.toLocaleString("pt-BR")}{" "}
              SMS). Considere recarregar antes que acabe.
            </>
          ) : (
            <>
              Acima do limite de alerta ({result.threshold.toLocaleString("pt-BR")}{" "}
              SMS).
            </>
          )}
        </p>
      </div>
    </div>
  );
}

function hintFor(result: Extract<CheckResponse, { status: "error" }>) {
  switch (result.hint) {
    case "missing-key":
      return "Peça ao admin para configurar SMSDEV_API_KEY no painel da Vercel.";
    case "auth":
      return "A chave do servidor está inválida ou foi revogada — gere uma nova no painel SMS Dev.";
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
