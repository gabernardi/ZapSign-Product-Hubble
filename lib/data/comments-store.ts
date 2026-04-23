import {
  emptyStore,
  normalizeCommentsStore,
  type CommentsStore,
} from "./comments";
import { loadJsonBlob, saveJsonBlob } from "./json-blob-store";

const FILENAME = "comments.json";

export async function loadCommentsStore(): Promise<CommentsStore> {
  const store = await loadJsonBlob<CommentsStore>(FILENAME, emptyStore());
  if (!store || typeof store !== "object" || !store.pages) {
    return emptyStore();
  }
  return normalizeCommentsStore(store);
}

export async function saveCommentsStore(store: CommentsStore): Promise<void> {
  await saveJsonBlob(FILENAME, normalizeCommentsStore(store));
}
