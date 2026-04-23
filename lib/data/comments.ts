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
  participantEmails: string[];
  lastActivityAt: string;
  lastActivityBy: Author;
  readStateByUser: Record<string, string>;
  lastNotifiedAtByUser?: Record<string, string>;
}

export interface PageThreads {
  threads: Thread[];
}

export interface CommentsStore {
  version: 1;
  pages: Record<string, PageThreads>;
}

export interface CommentInboxItem {
  pageId: string;
  pageLabel: string;
  pageSection: string;
  thread: Thread;
  unread: boolean;
  lastComment: Comment;
}

export interface CommentInboxSummary {
  totalCount: number;
  openCount: number;
  unreadCount: number;
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

const COMMENT_PAGE_META: Record<
  string,
  { label: string; section: string }
> = {
  "/dashboard": { label: "Dashboard", section: "Workspace" },
  "/dashboard/upstream": { label: "Upstream", section: "Guidelines" },
  "/dashboard/downstream": { label: "Downstream", section: "Guidelines" },
  "/dashboard/papeis": {
    label: "Papéis & Responsabilidades",
    section: "Guidelines",
  },
  "/dashboard/roadmap": { label: "Roadmap", section: "Roadmap" },
  "/dashboard/contribuir": {
    label: "Laboratório",
    section: "Laboratório",
  },
  "/dashboard/changelog": { label: "Changelog", section: "Laboratório" },
  "/dashboard/management-tips": {
    label: "Liderança",
    section: "Processo",
  },
};

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

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function normalizeAuthor(author: Author): Author {
  return {
    ...author,
    email: normalizeEmail(author.email),
  };
}

function uniqueEmails(emails: string[]): string[] {
  return Array.from(
    new Set(
      emails
        .map((email) => email.trim())
        .filter(Boolean)
        .map(normalizeEmail),
    ),
  );
}

function latestComment(thread: Thread): Comment {
  return thread.comments[thread.comments.length - 1];
}

function deriveLastActivity(thread: {
  createdAt: string;
  createdBy: Author;
  comments: Comment[];
}): { at: string; by: Author } {
  const last = thread.comments[thread.comments.length - 1];
  if (last) {
    return { at: last.createdAt, by: normalizeAuthor(last.createdBy) };
  }
  return { at: thread.createdAt, by: normalizeAuthor(thread.createdBy) };
}

function deriveParticipantEmails(thread: {
  createdBy: Author;
  comments: Comment[];
  participantEmails?: string[];
}): string[] {
  return uniqueEmails([
    thread.createdBy.email,
    ...(thread.participantEmails ?? []),
    ...thread.comments.map((comment) => comment.createdBy.email),
  ]);
}

function normalizeThread(thread: Thread): Thread {
  const createdBy = normalizeAuthor(thread.createdBy);
  const comments = thread.comments.map((comment) => ({
    ...comment,
    createdBy: normalizeAuthor(comment.createdBy),
  }));
  const activity = deriveLastActivity({
    createdAt: thread.createdAt,
    createdBy,
    comments,
  });
  const participantEmails = deriveParticipantEmails({
    createdBy,
    comments,
    participantEmails: thread.participantEmails,
  });

  const hadReadState =
    thread.readStateByUser && typeof thread.readStateByUser === "object";
  const readStateByUser = hadReadState
    ? Object.fromEntries(
        Object.entries(thread.readStateByUser).map(([email, iso]) => [
          normalizeEmail(email),
          iso,
        ]),
      )
    : Object.fromEntries(
        participantEmails.map((email) => [email, activity.at]),
      );

  const lastNotifiedAtByUser =
    thread.lastNotifiedAtByUser &&
    typeof thread.lastNotifiedAtByUser === "object"
      ? Object.fromEntries(
          Object.entries(thread.lastNotifiedAtByUser).map(([email, iso]) => [
            normalizeEmail(email),
            iso,
          ]),
        )
      : {};

  return {
    ...thread,
    createdBy,
    comments,
    participantEmails,
    lastActivityAt: thread.lastActivityAt ?? activity.at,
    lastActivityBy: thread.lastActivityBy
      ? normalizeAuthor(thread.lastActivityBy)
      : activity.by,
    readStateByUser,
    lastNotifiedAtByUser,
  };
}

function refreshThreadMetadata(thread: Thread): Thread {
  const activity = deriveLastActivity(thread);
  thread.participantEmails = deriveParticipantEmails(thread);
  thread.lastActivityAt = activity.at;
  thread.lastActivityBy = activity.by;
  return thread;
}

function pageMeta(pageId: string): { label: string; section: string } {
  if (pageId.startsWith("/dashboard/roadmap/")) {
    const quarter = pageId.split("/").pop()?.toUpperCase() ?? "Roadmap";
    return {
      label: `Roadmap ${quarter}`,
      section: "Roadmap",
    };
  }
  return (
    COMMENT_PAGE_META[pageId] ?? {
      label: pageId.replace("/dashboard/", "").replaceAll("-", " "),
      section: "Outras páginas",
    }
  );
}

function unreadForUser(thread: Thread, email: string): boolean {
  const key = normalizeEmail(email);
  const readAt = thread.readStateByUser[key];
  if (!readAt) {
    return thread.lastActivityBy.email !== key;
  }
  return new Date(thread.lastActivityAt).getTime() > new Date(readAt).getTime();
}

export function normalizeCommentsStore(store: CommentsStore): CommentsStore {
  const next = store && typeof store === "object" ? store : emptyStore();
  if (!next.pages || typeof next.pages !== "object") {
    next.pages = {};
  }
  for (const [pageId, page] of Object.entries(next.pages)) {
    if (!page || !Array.isArray(page.threads)) {
      next.pages[pageId] = { threads: [] };
      continue;
    }
    next.pages[pageId].threads = page.threads.map(normalizeThread);
  }
  return next;
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
  const normalizedAuthor = normalizeAuthor(author);
  const thread: Thread = {
    id: generateId("t"),
    anchor,
    status: "open",
    createdAt: now,
    createdBy: normalizedAuthor,
    comments: [
      {
        id: generateId("c"),
        body: body.trim(),
        createdAt: now,
        createdBy: normalizedAuthor,
        reactions: {},
      },
    ],
    participantEmails: [normalizedAuthor.email],
    lastActivityAt: now,
    lastActivityBy: normalizedAuthor,
    readStateByUser: {
      [normalizedAuthor.email]: now,
    },
    lastNotifiedAtByUser: {},
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
  const normalizedAuthor = normalizeAuthor(author);
  const comment: Comment = {
    id: generateId("c"),
    body: body.trim(),
    createdAt: now,
    createdBy: normalizedAuthor,
    reactions: {},
  };
  thread.comments.push(comment);
  thread.lastActivityAt = now;
  thread.lastActivityBy = normalizedAuthor;
  thread.participantEmails = uniqueEmails([
    ...thread.participantEmails,
    normalizedAuthor.email,
  ]);
  thread.readStateByUser[normalizedAuthor.email] = now;
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
  refreshThreadMetadata(thread);
  return { ok: true, threadRemoved: false };
}

export function markThreadRead(
  store: CommentsStore,
  pageId: string,
  threadId: string,
  email: string,
  now: string = new Date().toISOString(),
): boolean {
  const thread = store.pages[pageId]?.threads.find((item) => item.id === threadId);
  if (!thread) return false;
  thread.readStateByUser[normalizeEmail(email)] = now;
  return true;
}

export function markAllThreadsRead(
  store: CommentsStore,
  email: string,
  now: string = new Date().toISOString(),
): number {
  const key = normalizeEmail(email);
  let updated = 0;
  for (const page of Object.values(store.pages)) {
    for (const thread of page.threads) {
      if (unreadForUser(thread, key)) {
        thread.readStateByUser[key] = now;
        updated += 1;
      }
    }
  }
  return updated;
}

export function getInboxItems(
  store: CommentsStore,
  email: string,
): CommentInboxItem[] {
  const key = normalizeEmail(email);
  const items: CommentInboxItem[] = [];
  for (const [pageId, page] of Object.entries(store.pages)) {
    const meta = pageMeta(pageId);
    for (const thread of page.threads) {
      const lastComment = latestComment(thread);
      if (!lastComment) continue;
      items.push({
        pageId,
        pageLabel: meta.label,
        pageSection: meta.section,
        thread,
        unread: unreadForUser(thread, key),
        lastComment,
      });
    }
  }
  items.sort(
    (a, b) =>
      new Date(b.thread.lastActivityAt).getTime() -
      new Date(a.thread.lastActivityAt).getTime(),
  );
  return items;
}

export function getInboxSummary(
  store: CommentsStore,
  email: string,
): CommentInboxSummary {
  const items = getInboxItems(store, email);
  return {
    totalCount: items.length,
    openCount: items.filter((item) => item.thread.status === "open").length,
    unreadCount: items.filter((item) => item.unread).length,
  };
}

export function getThreadById(
  store: CommentsStore,
  pageId: string,
  threadId: string,
): Thread | null {
  return store.pages[pageId]?.threads.find((thread) => thread.id === threadId) ?? null;
}

export function markThreadNotified(
  store: CommentsStore,
  pageId: string,
  threadId: string,
  email: string,
  now: string = new Date().toISOString(),
): boolean {
  const thread = getThreadById(store, pageId, threadId);
  if (!thread) return false;
  if (!thread.lastNotifiedAtByUser) {
    thread.lastNotifiedAtByUser = {};
  }
  thread.lastNotifiedAtByUser[normalizeEmail(email)] = now;
  return true;
}
