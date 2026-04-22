"use server";

import { revalidatePath } from "next/cache";
import {
  type ReviewOverride,
  type ReviewRecord,
  type ReviewStatus,
  type ReviewVisibility,
} from "@/lib/data/changelog-review";
import {
  loadReviewStore,
  saveReviewStore,
} from "@/lib/data/changelog-review-store";
import { CHANGELOG } from "@/lib/data/changelog.generated";

const CHANGELOG_PATH = "/dashboard/changelog";

function nowIso(): string {
  return new Date().toISOString();
}

async function updateRecord(
  id: string,
  patch: (current: ReviewRecord) => ReviewRecord,
): Promise<void> {
  const store = await loadReviewStore();
  const current: ReviewRecord = store.entries[id] ?? {
    status: "pending",
    override: null,
  };
  store.entries[id] = patch(current);
  await saveReviewStore(store);
  revalidatePath(CHANGELOG_PATH);
}

/**
 * Ajusta status manual. Quando `status === "approved"`, obriga escolher a
 * visibilidade (público, interno ou ambos). Em rejected/pending, visibility
 * é descartada.
 */
export async function setEntryStatus(
  id: string,
  status: ReviewStatus,
  visibility?: ReviewVisibility,
): Promise<void> {
  await updateRecord(id, (curr) => {
    if (status === "approved") {
      return {
        ...curr,
        status,
        visibility: visibility ?? curr.visibility ?? "both",
        reviewedAt: nowIso(),
      };
    }
    return {
      ...curr,
      status,
      visibility: undefined,
      reviewedAt: nowIso(),
    };
  });
}

export async function saveOverride(
  id: string,
  override: ReviewOverride,
): Promise<void> {
  const normalized: ReviewOverride = {
    title: override.title?.trim() || undefined,
    description: override.description?.trim() || undefined,
    impact: override.impact?.trim() || undefined,
  };
  const empty =
    !normalized.title && !normalized.description && !normalized.impact;

  await updateRecord(id, (curr) => ({
    ...curr,
    override: empty ? null : normalized,
    reviewedAt: nowIso(),
  }));
}

export async function resetEntry(id: string): Promise<void> {
  const store = await loadReviewStore();
  delete store.entries[id];
  await saveReviewStore(store);
  revalidatePath(CHANGELOG_PATH);
}

export async function approveAllPending(
  visibility: ReviewVisibility = "both",
): Promise<{ approved: number }> {
  const store = await loadReviewStore();
  let approved = 0;
  const iso = nowIso();
  for (const entry of CHANGELOG) {
    const curr = store.entries[entry.id];
    if (!curr || curr.status === "pending") {
      store.entries[entry.id] = {
        status: "approved",
        visibility,
        override: curr?.override ?? null,
        note: curr?.note,
        reviewedAt: iso,
      };
      approved++;
    }
  }
  await saveReviewStore(store);
  revalidatePath(CHANGELOG_PATH);
  return { approved };
}
