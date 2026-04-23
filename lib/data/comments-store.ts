import { promises as fs } from "node:fs";
import path from "node:path";
import { emptyStore, type CommentsStore } from "./comments";

const COMMENTS_PATH = path.join(process.cwd(), "lib/data/comments.json");

export async function loadCommentsStore(): Promise<CommentsStore> {
  try {
    const raw = await fs.readFile(COMMENTS_PATH, "utf8");
    const parsed = JSON.parse(raw) as CommentsStore;
    if (!parsed || typeof parsed !== "object" || !parsed.pages) {
      return emptyStore();
    }
    return parsed;
  } catch {
    return emptyStore();
  }
}

export async function saveCommentsStore(store: CommentsStore): Promise<void> {
  await fs.writeFile(
    COMMENTS_PATH,
    JSON.stringify(store, null, 2) + "\n",
    "utf8",
  );
}
