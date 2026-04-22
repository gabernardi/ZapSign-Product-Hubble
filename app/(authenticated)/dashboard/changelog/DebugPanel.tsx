"use client";

import { useMemo, useState, useTransition } from "react";
import {
  effectiveVisibility,
  type DecoratedEntry,
  type ReviewStatus,
  type ReviewVisibility,
} from "@/lib/data/changelog-review";
import {
  approveAllPending,
  resetEntry,
  saveOverride,
  setEntryStatus,
} from "./actions";
import styles from "./page.module.css";

type StatusFilter =
  | "pending"
  | "approved"
  | "public"
  | "internal"
  | "rejected"
  | "all";
type RepoFilter = "all" | "web" | "api";

const DATE_FMT = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const DEBUG_PAGE_SIZE = 15;

export function DebugPanel({
  entries,
  stats,
}: {
  entries: DecoratedEntry[];
  stats: {
    approved: number;
    rejected: number;
    pending: number;
    publicCount: number;
    internalCount: number;
    total: number;
  };
}) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");
  const [repoFilter, setRepoFilter] = useState<RepoFilter>("all");
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(DEBUG_PAGE_SIZE);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter((e) => {
      const vis = effectiveVisibility(e.review);
      if (statusFilter === "approved" && e.review.status !== "approved") {
        return false;
      }
      if (
        statusFilter === "public" &&
        !(e.review.status === "approved" && (vis === "public" || vis === "both"))
      ) {
        return false;
      }
      if (
        statusFilter === "internal" &&
        !(
          e.review.status === "approved" &&
          (vis === "internal" || vis === "both")
        )
      ) {
        return false;
      }
      if (statusFilter === "pending" && e.review.status !== "pending") {
        return false;
      }
      if (statusFilter === "rejected" && e.review.status !== "rejected") {
        return false;
      }
      if (repoFilter !== "all" && e.repoShort !== repoFilter) return false;
      if (q) {
        const hay = [
          e.rawTitle,
          e.displayTitle,
          e.displayDescription,
          e.displayImpact,
          e.ai?.reason,
          e.id,
        ]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [entries, statusFilter, repoFilter, query]);

  const shown = filtered.slice(0, visible);
  const remaining = filtered.length - shown.length;

  return (
    <div className={styles.debug}>
      <section className={styles.debugToolbar}>
        <div className={styles.debugFilters}>
          <FilterGroup
            label="Status"
            value={statusFilter}
            onChange={(v) => {
              setStatusFilter(v as StatusFilter);
              setVisible(DEBUG_PAGE_SIZE);
            }}
            options={[
              { v: "pending", l: `Pendentes (${stats.pending})` },
              { v: "public", l: `Públicas (${stats.publicCount})` },
              { v: "internal", l: `Internas (${stats.internalCount})` },
              { v: "rejected", l: `Rejeitadas (${stats.rejected})` },
              { v: "all", l: `Todas (${stats.total})` },
            ]}
          />
          <FilterGroup
            label="Repo"
            value={repoFilter}
            onChange={(v) => {
              setRepoFilter(v as RepoFilter);
              setVisible(DEBUG_PAGE_SIZE);
            }}
            options={[
              { v: "all", l: "Ambos" },
              { v: "web", l: "web" },
              { v: "api", l: "api" },
            ]}
          />
        </div>
        <input
          type="search"
          className={styles.debugSearch}
          placeholder="Buscar por título, descrição, PR, ticket…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setVisible(DEBUG_PAGE_SIZE);
          }}
        />
        {stats.pending > 0 && <ApproveAllCluster pending={stats.pending} />}
      </section>

      {filtered.length === 0 ? (
        <p className={styles.empty}>
          Nada aqui com esses filtros. Experimente outro status ou limpe a
          busca.
        </p>
      ) : (
        <div className={styles.debugList}>
          {shown.map((entry) => (
            <DebugCard key={entry.id} entry={entry} />
          ))}
          {remaining > 0 && (
            <div className={styles.loadMoreRow}>
              <button
                type="button"
                className={styles.loadMore}
                onClick={() => setVisible((v) => v + DEBUG_PAGE_SIZE)}
              >
                Carregar mais
                <span className={styles.loadMoreMeta}>
                  {remaining} restantes com esses filtros
                </span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FilterGroup<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: { v: T; l: string }[];
}) {
  return (
    <div className={styles.filterGroup}>
      <span className={styles.filterLabel}>{label}</span>
      <div className={styles.filterPills} role="group" aria-label={label}>
        {options.map((o) => (
          <button
            key={o.v}
            type="button"
            className={`${styles.filterPill} ${value === o.v ? styles.filterPillActive : ""}`}
            onClick={() => onChange(o.v)}
          >
            {o.l}
          </button>
        ))}
      </div>
    </div>
  );
}

function ApproveAllCluster({ pending }: { pending: number }) {
  const [isPending, start] = useTransition();
  const [done, setDone] = useState(false);

  function approveAs(visibility: ReviewVisibility, label: string) {
    if (
      !confirm(
        `Aprovar as ${pending} entradas pendentes como "${label}"? Use como baseline inicial e refine individualmente depois.`,
      )
    ) {
      return;
    }
    start(async () => {
      await approveAllPending(visibility);
      setDone(true);
    });
  }

  if (done) {
    return (
      <span className={styles.approveAllDone}>
        Aprovadas
      </span>
    );
  }

  return (
    <div className={styles.approveAllCluster} role="group" aria-label="Aprovar todos os pendentes">
      <span className={styles.approveAllLabel}>
        Aprovar {pending} pendentes como
      </span>
      <button
        type="button"
        className={styles.approveAllBtn}
        disabled={isPending}
        onClick={() => approveAs("public", "Público")}
      >
        {isPending ? "…" : "Público"}
      </button>
      <button
        type="button"
        className={styles.approveAllBtn}
        disabled={isPending}
        onClick={() => approveAs("internal", "Interno")}
      >
        {isPending ? "…" : "Interno"}
      </button>
      <button
        type="button"
        className={styles.approveAllBtn}
        disabled={isPending}
        onClick={() => approveAs("both", "Ambos")}
      >
        {isPending ? "…" : "Ambos"}
      </button>
    </div>
  );
}

function DebugCard({ entry }: { entry: DecoratedEntry }) {
  const [editing, setEditing] = useState(false);
  const [pendingAction, startAction] = useTransition();

  const [title, setTitle] = useState(
    entry.review.override?.title ?? entry.ai?.title ?? "",
  );
  const [description, setDescription] = useState(
    entry.review.override?.description ?? entry.ai?.description ?? "",
  );
  const [impact, setImpact] = useState(
    entry.review.override?.impact ?? entry.ai?.impact ?? "",
  );

  const status = entry.review.status;
  const visibility = effectiveVisibility(entry.review);

  const statusLabel =
    status === "approved"
      ? visibility === "both"
        ? "Publicada · público + interno"
        : visibility === "internal"
          ? "Publicada · interno"
          : "Publicada · público"
      : status === "rejected"
        ? "Rejeitada"
        : "Pendente";

  function act(fn: () => Promise<unknown>) {
    startAction(async () => {
      await fn();
    });
  }

  function handleVisibilityClick(target: ReviewVisibility) {
    act(async () => {
      if (status === "approved" && visibility === target) {
        await setEntryStatus(entry.id, "pending");
      } else {
        await setEntryStatus(entry.id, "approved", target);
      }
    });
  }

  return (
    <article className={styles.debugCard}>
      <header className={styles.debugCardHead}>
        <div className={styles.debugMeta}>
          <span className={styles.statusLabel} data-status={status}>
            {statusLabel}
          </span>
          <span className={styles.debugMetaSep}>·</span>
          <span className={styles.debugRepo}>{entry.repo}</span>
          <span className={styles.debugMetaSep}>·</span>
          <a
            href={entry.prUrl}
            target="_blank"
            rel="noreferrer"
            className={styles.debugPrLink}
          >
            #{entry.prNumber}
          </a>
          <span className={styles.debugMetaSep}>·</span>
          <time dateTime={entry.date} className={styles.debugDate}>
            {DATE_FMT.format(new Date(entry.date))}
          </time>
          {entry.hasOverride && (
            <>
              <span className={styles.debugMetaSep}>·</span>
              <span className={styles.debugTag}>editada manualmente</span>
            </>
          )}
        </div>
      </header>

      <div className={styles.debugBody}>
        <section className={styles.debugCol}>
          <h3 className={styles.debugColTitle}>Pull request original</h3>
          <p className={styles.debugRawTitle}>{entry.rawTitle}</p>
          {entry.ai?.reason && entry.ai?.userFacing === false && (
            <p className={styles.debugReason}>
              <strong>IA descartou:</strong> {entry.ai.reason}
            </p>
          )}
          <a
            href={entry.prUrl}
            target="_blank"
            rel="noreferrer"
            className={styles.debugOpenPr}
          >
            Abrir PR no Bitbucket
          </a>
        </section>

        <section className={styles.debugCol}>
          <h3 className={styles.debugColTitle}>Versão publicada</h3>

          {editing ? (
            <div className={styles.debugForm}>
              <label className={styles.debugField}>
                <span className={styles.debugFieldLabel}>Título</span>
                <input
                  className={styles.debugInput}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={120}
                />
              </label>
              <label className={styles.debugField}>
                <span className={styles.debugFieldLabel}>Descrição</span>
                <textarea
                  className={styles.debugTextarea}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  maxLength={400}
                />
              </label>
              <label className={styles.debugField}>
                <span className={styles.debugFieldLabel}>
                  Impacto (opcional)
                </span>
                <textarea
                  className={styles.debugTextarea}
                  value={impact}
                  onChange={(e) => setImpact(e.target.value)}
                  rows={2}
                  maxLength={300}
                />
              </label>
              <div className={styles.debugFormActions}>
                <button
                  type="button"
                  className={styles.btnActive}
                  disabled={pendingAction}
                  onClick={() =>
                    act(async () => {
                      await saveOverride(entry.id, {
                        title,
                        description,
                        impact,
                      });
                      setEditing(false);
                    })
                  }
                >
                  Salvar edição
                </button>
                <button
                  type="button"
                  className={styles.btnMuted}
                  disabled={pendingAction}
                  onClick={() => {
                    setTitle(
                      entry.review.override?.title ?? entry.ai?.title ?? "",
                    );
                    setDescription(
                      entry.review.override?.description ??
                        entry.ai?.description ??
                        "",
                    );
                    setImpact(
                      entry.review.override?.impact ?? entry.ai?.impact ?? "",
                    );
                    setEditing(false);
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.debugPreview}>
              <p className={styles.debugPreviewTitle}>
                {entry.displayTitle || (
                  <em className={styles.debugPlaceholder}>
                    sem título (IA descartou)
                  </em>
                )}
              </p>
              {entry.displayDescription && (
                <p className={styles.debugPreviewText}>
                  {entry.displayDescription}
                </p>
              )}
              {entry.displayImpact && (
                <p className={styles.debugPreviewText}>
                  <strong>O que muda pra você:</strong> {entry.displayImpact}
                </p>
              )}
            </div>
          )}
        </section>
      </div>

      {!editing && (
        <footer className={styles.debugActions}>
          <div className={styles.visibilityGroup} role="group" aria-label="Publicar em">
            <span className={styles.visibilityLabel}>Publicar em</span>
            <VisibilityButton
              label="Público"
              active={status === "approved" && visibility === "public"}
              disabled={pendingAction}
              onClick={() => handleVisibilityClick("public")}
            />
            <VisibilityButton
              label="Interno"
              active={status === "approved" && visibility === "internal"}
              disabled={pendingAction}
              onClick={() => handleVisibilityClick("internal")}
            />
            <VisibilityButton
              label="Ambos"
              active={status === "approved" && visibility === "both"}
              disabled={pendingAction}
              onClick={() => handleVisibilityClick("both")}
            />
          </div>

          <div className={styles.actionsDivider} aria-hidden="true" />

          <ActionButton
            active={status === "rejected"}
            disabled={pendingAction}
            onClick={() =>
              act(async () => {
                await setEntryStatus(
                  entry.id,
                  status === "rejected" ? "pending" : "rejected",
                );
              })
            }
          >
            {status === "rejected" ? "Remover rejeição" : "Rejeitar"}
          </ActionButton>
          <ActionButton
            disabled={pendingAction}
            onClick={() => setEditing(true)}
          >
            {entry.hasOverride ? "Editar texto" : "Editar manualmente"}
          </ActionButton>
          {(entry.hasOverride || status !== "pending") && (
            <ActionButton
              muted
              disabled={pendingAction}
              onClick={() =>
                act(async () => {
                  if (
                    confirm(
                      "Resetar essa entrada? Isso apaga edição manual e volta pro estado 'pendente'.",
                    )
                  ) {
                    await resetEntry(entry.id);
                  }
                })
              }
            >
              Resetar
            </ActionButton>
          )}
        </footer>
      )}
    </article>
  );
}

function VisibilityButton({
  label,
  active,
  disabled,
  onClick,
}: {
  label: string;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={active ? styles.btnActive : styles.btnGhost}
      disabled={disabled}
      onClick={onClick}
      aria-pressed={active}
    >
      {label}
    </button>
  );
}

function ActionButton({
  active = false,
  muted = false,
  disabled,
  onClick,
  children,
}: {
  active?: boolean;
  muted?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  const cls = muted
    ? styles.btnMuted
    : active
      ? styles.btnActive
      : styles.btnGhost;
  return (
    <button type="button" className={cls} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
}

export function _statusLabel(status: ReviewStatus): string {
  return status === "approved"
    ? "Aprovada"
    : status === "rejected"
      ? "Rejeitada"
      : "Pendente";
}
