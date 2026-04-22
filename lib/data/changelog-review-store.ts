import { promises as fs } from "node:fs";
import path from "node:path";
import type { ReviewStore } from "./changelog-review";

const REVIEW_PATH = path.join(
  process.cwd(),
  "lib/data/changelog-review.json",
);

function emptyStore(): ReviewStore {
  return { version: 1, entries: {} };
}

export async function loadReviewStore(): Promise<ReviewStore> {
  try {
    const raw = await fs.readFile(REVIEW_PATH, "utf8");
    const parsed = JSON.parse(raw) as ReviewStore;
    if (!parsed || typeof parsed !== "object" || !parsed.entries) {
      return emptyStore();
    }
    return parsed;
  } catch {
    return emptyStore();
  }
}

export async function saveReviewStore(store: ReviewStore): Promise<void> {
  await fs.writeFile(
    REVIEW_PATH,
    JSON.stringify(store, null, 2) + "\n",
    "utf8",
  );
}
