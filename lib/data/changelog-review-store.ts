import type { ReviewStore } from "./changelog-review";
import { loadJsonBlob, saveJsonBlob } from "./json-blob-store";

const FILENAME = "changelog-review.json";

function emptyStore(): ReviewStore {
  return { version: 1, entries: {} };
}

export async function loadReviewStore(): Promise<ReviewStore> {
  const store = await loadJsonBlob<ReviewStore>(FILENAME, emptyStore());
  if (!store || typeof store !== "object" || !store.entries) {
    return emptyStore();
  }
  return store;
}

export async function saveReviewStore(store: ReviewStore): Promise<void> {
  await saveJsonBlob(FILENAME, store);
}
