export type ThreadStatus = "open" | "resolved";

export interface Author {
  email: string;
  name?: string;
  image?: string;
}

export interface CommentAnchor {
  blockId: string;
  startOffset: number;
  endOffset: number;
  quote: string;
}

export interface CommentReactions {
  [emoji: string]: string[];
}

export interface Comment {
  id: string;
  body: string;
  createdAt: string;
  createdBy: Author;
  reactions: CommentReactions;
}

export interface Thread {
  id: string;
  anchor: CommentAnchor;
  status: ThreadStatus;
  createdAt: string;
  createdBy: Author;
  comments: Comment[];
}

export interface PageThreads {
  threads: Thread[];
}

export interface CommentsStore {
  version: 1;
  pages: Record<string, PageThreads>;
}

export const REACTION_EMOJIS: readonly string[] = [
  "👍",
  "❤️",
  "🎉",
  "🤔",
  "👀",
] as const;

export function emptyStore(): CommentsStore {
  return { version: 1, pages: {} };
}

/**
 * Gera um id curto no formato `<prefix>_<base36>` — suficientemente único para
 * conteúdo interno (não é segurança). Usa crypto.randomUUID quando disponível
 * e cai para Math.random em ambientes antigos.
 */
export function generateId(prefix: "t" | "c"): string {
  try {
    const uuid =
      typeof globalThis !== "undefined" &&
      typeof globalThis.crypto?.randomUUID === "function"
        ? globalThis.crypto.randomUUID()
        : "";
    if (uuid) {
      return `${prefix}_${uuid.replace(/-/g, "").slice(0, 12)}`;
    }
  } catch {
    // ignore and fall back
  }
  const rand = Math.random().toString(36).slice(2, 10);
  const time = Date.now().toString(36).slice(-4);
  return `${prefix}_${time}${rand}`;
}

export function getPageThreads(
  store: CommentsStore,
  pageId: string,
): Thread[] {
  return store.pages[pageId]?.threads ?? [];
}

function ensurePage(store: CommentsStore, pageId: string): PageThreads {
  if (!store.pages[pageId]) {
    store.pages[pageId] = { threads: [] };
  }
  return store.pages[pageId];
}

export function addThread(
  store: CommentsStore,
  pageId: string,
  anchor: CommentAnchor,
  body: string,
  author: Author,
  now: string = new Date().toISOString(),
): Thread {
  const page = ensurePage(store, pageId);
  const thread: Thread = {
    id: generateId("t"),
    anchor,
    status: "open",
    createdAt: now,
    createdBy: author,
    comments: [
      {
        id: generateId("c"),
        body: body.trim(),
        createdAt: now,
        createdBy: author,
        reactions: {},
      },
    ],
  };
  page.threads.push(thread);
  return thread;
}

export function addComment(
  store: CommentsStore,
  pageId: string,
  threadId: string,
  body: string,
  author: Author,
  now: string = new Date().toISOString(),
): Comment | null {
  const thread = store.pages[pageId]?.threads.find((t) => t.id === threadId);
  if (!thread) return null;
  const comment: Comment = {
    id: generateId("c"),
    body: body.trim(),
    createdAt: now,
    createdBy: author,
    reactions: {},
  };
  thread.comments.push(comment);
  return comment;
}

export function toggleReaction(
  store: CommentsStore,
  pageId: string,
  threadId: string,
  commentId: string,
  emoji: string,
  email: string,
): boolean {
  const thread = store.pages[pageId]?.threads.find((t) => t.id === threadId);
  if (!thread) return false;
  const comment = thread.comments.find((c) => c.id === commentId);
  if (!comment) return false;
  const list = comment.reactions[emoji] ?? [];
  const has = list.includes(email);
  const next = has ? list.filter((e) => e !== email) : [...list, email];
  if (next.length === 0) {
    delete comment.reactions[emoji];
  } else {
    comment.reactions[emoji] = next;
  }
  return true;
}

export function setThreadStatus(
  store: CommentsStore,
  pageId: string,
  threadId: string,
  status: ThreadStatus,
): boolean {
  const thread = store.pages[pageId]?.threads.find((t) => t.id === threadId);
  if (!thread) return false;
  thread.status = status;
  return true;
}

export function deleteComment(
  store: CommentsStore,
  pageId: string,
  threadId: string,
  commentId: string,
  requesterEmail: string,
): { ok: boolean; threadRemoved: boolean } {
  const page = store.pages[pageId];
  if (!page) return { ok: false, threadRemoved: false };
  const threadIdx = page.threads.findIndex((t) => t.id === threadId);
  if (threadIdx === -1) return { ok: false, threadRemoved: false };
  const thread = page.threads[threadIdx];
  const commentIdx = thread.comments.findIndex((c) => c.id === commentId);
  if (commentIdx === -1) return { ok: false, threadRemoved: false };
  const comment = thread.comments[commentIdx];
  if (comment.createdBy.email !== requesterEmail) {
    return { ok: false, threadRemoved: false };
  }
  thread.comments.splice(commentIdx, 1);
  // Se não sobrou nenhum comentário, remove a thread inteira.
  if (thread.comments.length === 0) {
    page.threads.splice(threadIdx, 1);
    return { ok: true, threadRemoved: true };
  }
  return { ok: true, threadRemoved: false };
}
