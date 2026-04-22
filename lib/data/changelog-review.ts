import type { ChangelogEntry } from "./changelog.generated";

export type ReviewStatus = "pending" | "approved" | "rejected";

/**
 * Onde uma entrada aprovada aparece:
 * - "public": só no changelog público (clientes/usuários finais)
 * - "internal": só no changelog interno (time da ZapSign)
 * - "both": aparece nos dois
 *
 * Só faz sentido quando `status === "approved"`. Se `status !== "approved"`,
 * o campo é ignorado.
 */
export type ReviewVisibility = "public" | "internal" | "both";

export type ChangelogAudience = "public" | "internal";

export interface ReviewOverride {
  title?: string;
  description?: string;
  impact?: string;
}

export interface ReviewRecord {
  status: ReviewStatus;
  /** Só relevante quando status === "approved". Default de compat: "both". */
  visibility?: ReviewVisibility;
  override?: ReviewOverride | null;
  note?: string;
  reviewedAt?: string;
}

export interface ReviewStore {
  version: 1;
  entries: Record<string, ReviewRecord>;
}

export interface DecoratedEntry extends ChangelogEntry {
  review: ReviewRecord;
  /** Título final exibido (override > ai.title > rawTitle). */
  displayTitle: string;
  /** Descrição final exibida (override > ai.description). */
  displayDescription: string;
  /** Impacto final exibido (override > ai.impact). */
  displayImpact: string;
  /** true se houver edição manual. */
  hasOverride: boolean;
}

/** Default quando uma entrada foi aprovada mas não tem visibility setada (dado legado). */
export const DEFAULT_VISIBILITY: ReviewVisibility = "both";

export const DEFAULT_RECORD: ReviewRecord = {
  status: "pending",
  override: null,
};

/** Retorna a visibilidade efetiva de um record aprovado. */
export function effectiveVisibility(
  record: ReviewRecord,
): ReviewVisibility | null {
  if (record.status !== "approved") return null;
  return record.visibility ?? DEFAULT_VISIBILITY;
}

/** `true` se a entrada aparece no feed `audience`. */
export function isVisibleIn(
  record: ReviewRecord,
  audience: ChangelogAudience,
): boolean {
  const vis = effectiveVisibility(record);
  if (!vis) return false;
  return vis === audience || vis === "both";
}

export function getRecord(store: ReviewStore, id: string): ReviewRecord {
  return store.entries[id] ?? DEFAULT_RECORD;
}

function cleanTitle(raw: string | undefined): string {
  const t = (raw ?? "").trim();
  return t.charAt(0).toUpperCase() + t.slice(1);
}

export function decorate(
  entry: ChangelogEntry,
  record: ReviewRecord,
): DecoratedEntry {
  const ov = record.override ?? {};
  const aiTitle = entry.ai?.title?.trim() ?? "";
  const aiDesc = entry.ai?.description?.trim() ?? "";
  const aiImpact = entry.ai?.impact?.trim() ?? "";

  const ovTitle = ov.title?.trim() ?? "";
  const ovDesc = ov.description?.trim() ?? "";
  const ovImpact = ov.impact?.trim() ?? "";

  const displayTitle = ovTitle || aiTitle || cleanTitle(entry.rawTitle);
  const displayDescription = ovDesc || aiDesc;
  const displayImpact = ovImpact || aiImpact;

  const hasOverride = Boolean(ovTitle || ovDesc || ovImpact);

  return {
    ...entry,
    review: record,
    displayTitle,
    displayDescription,
    displayImpact,
    hasOverride,
  };
}

export function decorateAll(
  entries: ChangelogEntry[],
  store: ReviewStore,
): DecoratedEntry[] {
  return entries.map((e) => decorate(e, getRecord(store, e.id)));
}
