"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./page.module.css";

const STORAGE_THRESHOLD = "openai_keys_threshold_v1";
const STORAGE_INCLUDE_NEVER = "openai_keys_include_never_v1";
const CONFIRM_PHRASE = "EXCLUIR";

type KeyEntry = {
  keyId: string;
  name: string | null;
  createdAt: number | null;
  lastUsedAt: number | null;
  ownerEmail: string | null;
  ownerName: string | null;
  projectId: string;
  projectName: string;
  redactedValue: string | null;
};

type ScanResponse =
  | {
      status: "ok";
      keys: KeyEntry[];
      totals: { projects: number; keys: number };
    }
  | {
      status: "error";
      descricao: string;
      hint?: string;
      httpStatus?: number;
    };

type DeleteItemResult = {
  projectId: string;
  keyId: string;
  ok: boolean;
  httpStatus?: number;
  error?: string;
};

type DeleteResponse =
  | {
      status: "ok";
      results: DeleteItemResult[];
      deleted: number;
      failed: number;
    }
  | {
      status: "error";
      descricao: string;
      hint?: string;
    };

type FilterMode = "all" | "idle" | "never" | "active";

function daysSince(unixSeconds: number | null | undefined): number | null {
  if (typeof unixSeconds !== "number" || !Number.isFinite(unixSeconds)) {
    return null;
  }
  const now = Date.now() / 1000;
  return (now - unixSeconds) / 86400;
}

function formatDate(unixSeconds: number | null | undefined): string {
  if (typeof unixSeconds !== "number" || !Number.isFinite(unixSeconds)) {
    return "—";
  }
  const d = new Date(unixSeconds * 1000);
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDays(d: number | null): string {
  if (d == null) return "—";
  if (d < 1) return "hoje";
  const rounded = Math.floor(d);
  return `há ${rounded}d`;
}

type KeyStatus = "idle" | "never" | "active";

function classifyKey(
  key: KeyEntry,
  thresholdDays: number,
  includeNeverUsed: boolean,
): { status: KeyStatus; flagged: boolean; days: number | null } {
  const days = daysSince(key.lastUsedAt);
  if (key.lastUsedAt == null) {
    return { status: "never", flagged: includeNeverUsed, days: null };
  }
  if (days != null && days > thresholdDays) {
    return { status: "idle", flagged: true, days };
  }
  return { status: "active", flagged: false, days };
}

export interface OpenAIKeysToolProps {
  canDelete: boolean;
}

export function OpenAIKeysTool({ canDelete }: OpenAIKeysToolProps) {
  const [thresholdDays, setThresholdDays] = useState(60);
  const [includeNeverUsed, setIncludeNeverUsed] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [keys, setKeys] = useState<KeyEntry[] | null>(null);
  const [totals, setTotals] = useState<{ projects: number; keys: number } | null>(
    null,
  );
  const [error, setError] = useState<Extract<ScanResponse, { status: "error" }> | null>(
    null,
  );
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<FilterMode>("all");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteSummary, setDeleteSummary] = useState<{
    deleted: number;
    failed: number;
    failures: DeleteItemResult[];
  } | null>(null);

  useEffect(() => {
    try {
      const t = localStorage.getItem(STORAGE_THRESHOLD);
      if (t) {
        const parsed = parseInt(t, 10);
        if (Number.isFinite(parsed) && parsed > 0) setThresholdDays(parsed);
      }
      const inc = localStorage.getItem(STORAGE_INCLUDE_NEVER);
      if (inc != null) setIncludeNeverUsed(inc === "1");
    } catch {
      /* ignore */
    }
  }, []);

  const classifications = useMemo(() => {
    if (!keys) return new Map<string, ReturnType<typeof classifyKey>>();
    const map = new Map<string, ReturnType<typeof classifyKey>>();
    for (const k of keys) {
      map.set(rowKey(k), classifyKey(k, thresholdDays, includeNeverUsed));
    }
    return map;
  }, [keys, thresholdDays, includeNeverUsed]);

  const counts = useMemo(() => {
    let idle = 0;
    let never = 0;
    let active = 0;
    if (keys) {
      for (const k of keys) {
        const c = classifications.get(rowKey(k));
        if (!c) continue;
        if (c.status === "idle") idle++;
        else if (c.status === "never") never++;
        else active++;
      }
    }
    return { idle, never, active, total: keys?.length ?? 0 };
  }, [keys, classifications]);

  const filteredKeys = useMemo(() => {
    if (!keys) return [];
    return keys.filter((k) => {
      const c = classifications.get(rowKey(k));
      if (!c) return false;
      if (filter === "all") return true;
      if (filter === "idle") return c.status === "idle";
      if (filter === "never") return c.status === "never";
      if (filter === "active") return c.status === "active";
      return true;
    });
  }, [keys, classifications, filter]);

  function persistConfig(next: { thresholdDays?: number; includeNeverUsed?: boolean }) {
    try {
      if (next.thresholdDays != null) {
        localStorage.setItem(STORAGE_THRESHOLD, String(next.thresholdDays));
      }
      if (next.includeNeverUsed != null) {
        localStorage.setItem(
          STORAGE_INCLUDE_NEVER,
          next.includeNeverUsed ? "1" : "0",
        );
      }
    } catch {
      /* ignore */
    }
  }

  async function runScan() {
    if (scanning) return;
    persistConfig({ thresholdDays, includeNeverUsed });
    setScanning(true);
    setError(null);
    setDeleteSummary(null);
    try {
      const resp = await fetch("/api/tools/openai-keys/scan", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = (await resp.json()) as ScanResponse;
      if (data.status === "ok") {
        setKeys(data.keys);
        setTotals(data.totals);
        setSelected(new Set());
      } else {
        setError(data);
        setKeys(null);
        setTotals(null);
      }
    } catch {
      setError({
        status: "error",
        descricao: "Falha de rede ao chamar o servidor.",
        hint: "network",
      });
    } finally {
      setScanning(false);
    }
  }

  function toggleRow(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAllVisible() {
    const visibleIds = filteredKeys.map(rowKey);
    setSelected((prev) => {
      const next = new Set(prev);
      const allSelected = visibleIds.every((id) => next.has(id));
      if (allSelected) {
        for (const id of visibleIds) next.delete(id);
      } else {
        for (const id of visibleIds) next.add(id);
      }
      return next;
    });
  }

  function selectAllFlagged() {
    if (!keys) return;
    const next = new Set(selected);
    for (const k of keys) {
      const c = classifications.get(rowKey(k));
      if (c?.flagged) next.add(rowKey(k));
    }
    setSelected(next);
  }

  function clearSelection() {
    setSelected(new Set());
  }

  function openConfirm() {
    setConfirmText("");
    setConfirmOpen(true);
  }

  function closeConfirm() {
    if (deleting) return;
    setConfirmOpen(false);
    setConfirmText("");
  }

  async function runDelete() {
    if (deleting || !keys) return;
    const targets: { projectId: string; keyId: string }[] = [];
    for (const id of selected) {
      const k = keys.find((x) => rowKey(x) === id);
      if (k) targets.push({ projectId: k.projectId, keyId: k.keyId });
    }
    if (targets.length === 0) {
      setConfirmOpen(false);
      return;
    }

    setDeleting(true);
    try {
      const resp = await fetch("/api/tools/openai-keys/delete", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ targets }),
      });
      const data = (await resp.json()) as DeleteResponse;
      if (data.status === "ok") {
        const failures = data.results.filter((r) => !r.ok);
        setDeleteSummary({
          deleted: data.deleted,
          failed: data.failed,
          failures,
        });
        setConfirmOpen(false);
        setConfirmText("");
        setSelected(new Set());
        await runScan();
      } else {
        setError({
          status: "error",
          descricao: data.descricao,
          hint: data.hint,
        });
        setConfirmOpen(false);
      }
    } catch {
      setError({
        status: "error",
        descricao: "Falha de rede ao chamar o servidor.",
        hint: "network",
      });
      setConfirmOpen(false);
    } finally {
      setDeleting(false);
    }
  }

  const visibleIds = filteredKeys.map(rowKey);
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selected.has(id));
  const someVisibleSelected =
    !allVisibleSelected && visibleIds.some((id) => selected.has(id));

  return (
    <div className={styles.toolWrap}>
      <form
        className={styles.form}
        onSubmit={(e) => {
          e.preventDefault();
          runScan();
        }}
      >
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Inativas há mais de</span>
          <input
            type="number"
            min={1}
            step={1}
            className={styles.input}
            value={thresholdDays}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10);
              setThresholdDays(Number.isFinite(v) && v > 0 ? v : 1);
            }}
          />
          <span className={styles.fieldHint}>dias sem uso</span>
        </label>

        <label className={styles.checkboxField}>
          <input
            type="checkbox"
            checked={includeNeverUsed}
            onChange={(e) => setIncludeNeverUsed(e.target.checked)}
          />
          <span>Incluir keys nunca usadas no critério</span>
        </label>

        <button type="submit" className={styles.btn} disabled={scanning}>
          {scanning ? (
            <>
              <span className={styles.spinner} aria-hidden="true" />
              <span>Escaneando…</span>
            </>
          ) : (
            <span>{keys ? "Re-escanear" : "Escanear"}</span>
          )}
        </button>
      </form>

      {!canDelete && <ReadOnlyNotice />}

      {error && <ErrorCard error={error} />}

      {deleteSummary && !error && (
        <DeleteBanner summary={deleteSummary} onDismiss={() => setDeleteSummary(null)} />
      )}

      {scanning && !keys && (
        <div className={styles.loadingState}>
          <span className={styles.loadingDot} aria-hidden="true" />
          <span>Buscando projetos e API keys da OpenAI…</span>
        </div>
      )}

      {!scanning && !keys && !error && (
        <div className={styles.emptyState}>
          Configure o limite de inatividade e rode o scan para listar as API keys.
        </div>
      )}

      {keys && totals && !error && (
        <>
          <div className={styles.summary} role="status">
            <span className={styles.summaryStat}>
              <strong>{totals.projects}</strong> projetos
            </span>
            <span className={styles.summarySep} aria-hidden="true" />
            <span className={styles.summaryStat}>
              <strong>{totals.keys}</strong> API keys
            </span>
            <span className={styles.summarySep} aria-hidden="true" />
            <span className={styles.summaryStat}>
              <strong>{counts.idle}</strong> ociosas
            </span>
            <span className={styles.summarySep} aria-hidden="true" />
            <span className={styles.summaryStat}>
              <strong>{counts.never}</strong> nunca usadas
            </span>
          </div>

          <div className={styles.filters}>
            <FilterButton
              label="Todas"
              count={counts.total}
              active={filter === "all"}
              onClick={() => setFilter("all")}
            />
            <FilterButton
              label="Ociosas"
              count={counts.idle}
              active={filter === "idle"}
              onClick={() => setFilter("idle")}
            />
            <FilterButton
              label="Nunca usadas"
              count={counts.never}
              active={filter === "never"}
              onClick={() => setFilter("never")}
            />
            <FilterButton
              label="Ativas"
              count={counts.active}
              active={filter === "active"}
              onClick={() => setFilter("active")}
            />
            <span className={styles.filterSpacer} />
            {canDelete && (
              <button
                type="button"
                className={`${styles.btn} ${styles.btnGhost}`}
                onClick={selectAllFlagged}
                disabled={counts.idle + (includeNeverUsed ? counts.never : 0) === 0}
              >
                Selecionar todas as ociosas
                {includeNeverUsed ? " + nunca usadas" : ""}
              </button>
            )}
          </div>

          {filteredKeys.length === 0 ? (
            <div className={styles.emptyState}>
              Nenhuma key bate nesse filtro.
            </div>
          ) : (
            <div className={styles.tableWrap}>
              <div className={styles.tableScroll}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      {canDelete && (
                        <th className={styles.cellCheckbox}>
                          <input
                            type="checkbox"
                            aria-label="Selecionar todas visíveis"
                            checked={allVisibleSelected}
                            ref={(el) => {
                              if (el) el.indeterminate = someVisibleSelected;
                            }}
                            onChange={toggleAllVisible}
                          />
                        </th>
                      )}
                      <th>Projeto</th>
                      <th>Key</th>
                      <th>Owner</th>
                      <th>Criada</th>
                      <th>Última atividade</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredKeys.map((k) => {
                      const id = rowKey(k);
                      const c = classifications.get(id);
                      const isSelected = selected.has(id);
                      const rowClass = [
                        isSelected ? styles.rowSelected : "",
                        !isSelected && c?.status === "idle"
                          ? styles.rowFlagged
                          : "",
                        !isSelected && c?.status === "never" && includeNeverUsed
                          ? styles.rowNeverUsed
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" ");
                      return (
                        <tr key={id} className={rowClass}>
                          {canDelete && (
                            <td className={styles.cellCheckbox}>
                              <input
                                type="checkbox"
                                aria-label={`Selecionar ${k.name ?? k.keyId}`}
                                checked={isSelected}
                                onChange={() => toggleRow(id)}
                              />
                            </td>
                          )}
                          <td className={styles.cellProject} title={k.projectName}>
                            {k.projectName}
                          </td>
                          <td className={styles.cellName} title={k.name ?? k.keyId}>
                            {k.name ?? <em>(sem nome)</em>}
                            {k.redactedValue && (
                              <div className={styles.cellSub}>
                                {k.redactedValue}
                              </div>
                            )}
                          </td>
                          <td
                            className={styles.cellOwner}
                            title={k.ownerEmail ?? k.ownerName ?? "—"}
                          >
                            {k.ownerEmail ?? k.ownerName ?? "—"}
                          </td>
                          <td className={styles.cellDate}>
                            {formatDate(k.createdAt)}
                          </td>
                          <td className={styles.cellDate}>
                            {k.lastUsedAt == null ? (
                              <span className={styles.cellNever}>nunca</span>
                            ) : (
                              <>
                                {formatDate(k.lastUsedAt)}
                                <div className={styles.cellSub}>
                                  {formatDays(c?.days ?? null)}
                                </div>
                              </>
                            )}
                          </td>
                          <td>
                            <StatusBadge status={c?.status ?? "active"} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {canDelete && selected.size > 0 && (
            <div className={styles.selectionBar} role="region" aria-label="Seleção">
              <span className={styles.selectionCount}>
                <strong>{selected.size}</strong>{" "}
                {selected.size === 1 ? "key selecionada" : "keys selecionadas"}
              </span>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnGhost}`}
                onClick={clearSelection}
                disabled={deleting}
              >
                Limpar seleção
              </button>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnDanger}`}
                onClick={openConfirm}
                disabled={deleting}
              >
                Excluir {selected.size}{" "}
                {selected.size === 1 ? "selecionada" : "selecionadas"}
              </button>
            </div>
          )}
        </>
      )}

      {canDelete && confirmOpen && (
        <ConfirmModal
          count={selected.size}
          confirmText={confirmText}
          onConfirmTextChange={setConfirmText}
          onCancel={closeConfirm}
          onConfirm={runDelete}
          deleting={deleting}
        />
      )}
    </div>
  );
}

function rowKey(k: KeyEntry): string {
  return `${k.projectId}::${k.keyId}`;
}

function FilterButton({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`${styles.filterBtn} ${active ? styles.filterBtnActive : ""}`}
      onClick={onClick}
    >
      <span>{label}</span>
      <span className={styles.filterCount}>{count}</span>
    </button>
  );
}

function StatusBadge({ status }: { status: KeyStatus }) {
  if (status === "idle") {
    return (
      <span className={`${styles.badge} ${styles.badgeIdle}`}>
        <span className={styles.badgeDot} aria-hidden="true" />
        Ociosa
      </span>
    );
  }
  if (status === "never") {
    return (
      <span className={`${styles.badge} ${styles.badgeNever}`}>
        <span className={styles.badgeDot} aria-hidden="true" />
        Nunca usada
      </span>
    );
  }
  return (
    <span className={`${styles.badge} ${styles.badgeActive}`}>
      <span className={styles.badgeDot} aria-hidden="true" />
      Ativa
    </span>
  );
}

function ConfirmModal({
  count,
  confirmText,
  onConfirmTextChange,
  onCancel,
  onConfirm,
  deleting,
}: {
  count: number;
  confirmText: string;
  onConfirmTextChange: (v: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
  deleting: boolean;
}) {
  const canConfirm = confirmText.trim() === CONFIRM_PHRASE;
  return (
    <div className={styles.modalBackdrop} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <h2 className={styles.modalTitle}>Confirmar exclusão</h2>
        <p className={styles.modalBody}>
          Você está prestes a excluir <strong>{count}</strong>{" "}
          {count === 1 ? "API key" : "API keys"} da OpenAI. Esta ação é{" "}
          <strong>definitiva</strong> — qualquer aplicação que ainda use essas
          keys vai parar de funcionar.
        </p>
        <div className={styles.modalConfirmField}>
          <label className={styles.modalConfirmLabel} htmlFor="confirm-input">
            Digite <code>{CONFIRM_PHRASE}</code> para confirmar:
          </label>
          <input
            id="confirm-input"
            type="text"
            className={styles.input}
            autoComplete="off"
            value={confirmText}
            onChange={(e) => onConfirmTextChange(e.target.value)}
            disabled={deleting}
            autoFocus
          />
        </div>
        <div className={styles.modalActions}>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnGhost}`}
            onClick={onCancel}
            disabled={deleting}
          >
            Cancelar
          </button>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnDanger}`}
            onClick={onConfirm}
            disabled={!canConfirm || deleting}
          >
            {deleting ? (
              <>
                <span className={styles.spinner} aria-hidden="true" />
                <span>Excluindo…</span>
              </>
            ) : (
              <span>Excluir {count}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteBanner({
  summary,
  onDismiss,
}: {
  summary: { deleted: number; failed: number; failures: DeleteItemResult[] };
  onDismiss: () => void;
}) {
  const cls =
    summary.failed === 0
      ? styles.deleteBannerOk
      : summary.deleted === 0
        ? styles.deleteBannerErr
        : styles.deleteBannerPartial;
  return (
    <div className={`${styles.deleteBanner} ${cls}`} role="status">
      <div style={{ flex: 1 }}>
        <strong>
          {summary.deleted} {summary.deleted === 1 ? "key excluída" : "keys excluídas"}
        </strong>
        {summary.failed > 0 && (
          <>
            {" · "}
            <strong>
              {summary.failed} {summary.failed === 1 ? "falha" : "falhas"}
            </strong>
          </>
        )}
        {summary.failures.length > 0 && (
          <ul style={{ marginTop: 6, paddingLeft: 18, fontSize: 12.5 }}>
            {summary.failures.slice(0, 5).map((f) => (
              <li key={`${f.projectId}::${f.keyId}`}>
                <code style={{ fontFamily: "var(--gw-font-mono)" }}>
                  {f.keyId}
                </code>{" "}
                — {f.error || (f.httpStatus ? `HTTP ${f.httpStatus}` : "erro")}
              </li>
            ))}
            {summary.failures.length > 5 && (
              <li>… e mais {summary.failures.length - 5}</li>
            )}
          </ul>
        )}
      </div>
      <button
        type="button"
        className={`${styles.btn} ${styles.btnGhost}`}
        onClick={onDismiss}
      >
        Fechar
      </button>
    </div>
  );
}

function ReadOnlyNotice() {
  return (
    <div className={styles.readonlyNotice} role="status">
      <span className={styles.readonlyDot} aria-hidden="true" />
      <div>
        <strong>Modo somente-consulta.</strong>{" "}
        <span>
          Você consegue listar e revisar as API keys, mas a exclusão está
          restrita ao admin do Hubble. Fale com ele se precisar remover alguma
          key.
        </span>
      </div>
    </div>
  );
}

function ErrorCard({
  error,
}: {
  error: Extract<ScanResponse, { status: "error" }>;
}) {
  return (
    <div className={styles.errorCard} role="alert">
      <div className={styles.errorIco} aria-hidden="true">
        <ErrorIcon />
      </div>
      <div className={styles.errorBody}>
        <div className={styles.errorTitle}>Não consegui consultar a OpenAI</div>
        <p className={styles.errorMeta}>{error.descricao}</p>
        {hintFor(error.hint) && (
          <p className={styles.errorHint}>{hintFor(error.hint)}</p>
        )}
      </div>
    </div>
  );
}

function hintFor(hint: string | undefined): string | null {
  switch (hint) {
    case "missing-key":
      return "Peça ao admin para configurar OPENAI_ADMIN_KEY no painel da Vercel.";
    case "auth":
      return "A admin key está inválida ou sem permissão de gestão (api.management.read/write).";
    case "upstream":
      return "API da OpenAI fora do ar. Tente novamente em alguns minutos.";
    case "timeout":
      return "Tente novamente em alguns segundos.";
    case "network":
      return "Verifique a conectividade do servidor com api.openai.com.";
    case "api":
      return "A API recusou a consulta — confira a admin key no painel da OpenAI.";
    default:
      return null;
  }
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
