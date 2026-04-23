"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useSession } from "next-auth/react";
import {
  addComment as addCommentAction,
  createThread as createThreadAction,
  deleteComment as deleteCommentAction,
  setThreadStatus as setThreadStatusAction,
  toggleReaction as toggleReactionAction,
} from "@/app/actions/comments";
import type {
  Author,
  CommentAnchor,
  Thread,
  ThreadStatus,
} from "@/lib/data/comments";
import { useCommentsInbox } from "./CommentsInboxProvider";

const POLL_INTERVAL_MS = 3_000;
const OPTIMISTIC_GRACE_MS = 30_000;

/**
 * Combina threads locais (otimistas) com a resposta do servidor. Se o local
 * tem `lastActivityAt` mais novo, mantemos o local — evita flashes de "sumiu
 * e voltou" enquanto o Blob termina de propagar. Threads recém-criadas ou
 * deletadas localmente continuam refletindo a intenção do usuário por até
 * `OPTIMISTIC_GRACE_MS`.
 */
function mergeThreads(
  local: Thread[],
  server: Thread[],
  removedIds: ReadonlySet<string>,
): Thread[] {
  const localById = new Map(local.map((t) => [t.id, t]));
  const serverById = new Map(server.map((t) => [t.id, t]));
  const now = Date.now();
  const result: Thread[] = [];
  const used = new Set<string>();

  for (const serverThread of server) {
    if (removedIds.has(serverThread.id)) continue;
    const localThread = localById.get(serverThread.id);
    if (
      localThread &&
      new Date(localThread.lastActivityAt).getTime() >
        new Date(serverThread.lastActivityAt).getTime()
    ) {
      result.push(localThread);
    } else {
      result.push(serverThread);
    }
    used.add(serverThread.id);
  }

  for (const localThread of local) {
    if (used.has(localThread.id)) continue;
    if (serverById.has(localThread.id)) continue;
    const age = now - new Date(localThread.lastActivityAt).getTime();
    if (age < OPTIMISTIC_GRACE_MS) {
      result.push(localThread);
    }
  }

  return result;
}

export interface CommentContextValue {
  pageId: string;
  threads: Thread[];
  activeThreadId: string | null;
  panelOpen: boolean;
  pendingThreadId: string | null;
  composeAnchor: CommentAnchor | null;
  currentUserEmail: string | null;
  openPanel: (threadId?: string | null) => void;
  closePanel: () => void;
  setActiveThread: (threadId: string | null) => void;
  beginCompose: (anchor: CommentAnchor) => void;
  cancelCompose: () => void;
  createThread: (anchor: CommentAnchor, body: string) => Promise<Thread | null>;
  replyToThread: (threadId: string, body: string) => Promise<void>;
  reactToComment: (
    threadId: string,
    commentId: string,
    emoji: string,
  ) => Promise<void>;
  resolveThread: (
    threadId: string,
    status: ThreadStatus,
  ) => Promise<void>;
  removeComment: (threadId: string, commentId: string) => Promise<void>;
  refresh: () => Promise<void>;
  isThreadUnread: (threadId: string) => boolean;
}

const CommentContext = createContext<CommentContextValue | null>(null);

export function useComments(): CommentContextValue {
  const ctx = useContext(CommentContext);
  if (!ctx) {
    throw new Error("useComments deve ser usado dentro de <CommentProvider>.");
  }
  return ctx;
}

interface CommentProviderProps {
  pageId: string;
  initialThreads: Thread[];
  /**
   * Quando true, dispara um fetch via API logo após o mount. Útil quando a
   * página é client component e não carregou threads server-side.
   */
  refreshOnMount?: boolean;
  children: ReactNode;
}

export function CommentProvider({
  pageId,
  initialThreads,
  refreshOnMount,
  children,
}: CommentProviderProps) {
  const { data: session } = useSession();
  const {
    refresh: refreshInbox,
    markThreadRead: markInboxThreadRead,
    isThreadUnread: isInboxThreadUnread,
    upsertThread: upsertInboxThread,
    removeThread: removeInboxThread,
  } = useCommentsInbox();
  const [threads, setThreads] = useState<Thread[]>(initialThreads);
  const [panelOpen, setPanelOpen] = useState(false);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [pendingThreadId, setPendingThreadId] = useState<string | null>(null);
  const [composeAnchor, setComposeAnchor] = useState<CommentAnchor | null>(
    null,
  );
  const [requestedThreadId, setRequestedThreadId] = useState<string | null>(null);
  const removedThreadIdsRef = useRef<Map<string, number>>(new Map());

  const markThreadRemovedLocally = useCallback((threadId: string) => {
    removedThreadIdsRef.current.set(threadId, Date.now());
  }, []);

  const getActiveRemovedThreadIds = useCallback((): Set<string> => {
    const now = Date.now();
    const active = new Set<string>();
    for (const [id, at] of removedThreadIdsRef.current) {
      if (now - at < OPTIMISTIC_GRACE_MS) active.add(id);
      else removedThreadIdsRef.current.delete(id);
    }
    return active;
  }, []);

  const sessionEmail = session?.user?.email ?? null;
  const sessionName = session?.user?.name ?? null;
  const sessionImage = session?.user?.image ?? null;
  const currentUserEmail = sessionEmail;
  const panelOpenRef = useRef(panelOpen);
  useEffect(() => {
    panelOpenRef.current = panelOpen;
  }, [panelOpen]);

  const localAuthor: Author | null = useMemo(() => {
    if (!sessionEmail) return null;
    return {
      email: sessionEmail,
      name: sessionName ?? undefined,
      image: sessionImage ?? undefined,
    };
  }, [sessionEmail, sessionImage, sessionName]);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/comments?pageId=${encodeURIComponent(pageId)}`,
        { cache: "no-store" },
      );
      if (!res.ok) return;
      const data = (await res.json()) as { threads: Thread[] };
      if (Array.isArray(data.threads)) {
        const removed = getActiveRemovedThreadIds();
        setThreads((prev) => mergeThreads(prev, data.threads, removed));
      }
    } catch {
      // silencioso — o usuário verá o estado otimista até o próximo ciclo
    }
  }, [getActiveRemovedThreadIds, pageId]);

  const isThreadUnread = useCallback(
    (threadId: string) => isInboxThreadUnread(pageId, threadId),
    [isInboxThreadUnread, pageId],
  );

  const openPanel = useCallback((threadId?: string | null) => {
    setPanelOpen(true);
    if (typeof threadId !== "undefined") {
      setActiveThreadId(threadId);
    }
  }, []);

  const closePanel = useCallback(() => {
    setPanelOpen(false);
    setActiveThreadId(null);
    setPendingThreadId(null);
    setComposeAnchor(null);
  }, []);

  const setActiveThread = useCallback((threadId: string | null) => {
    setActiveThreadId(threadId);
  }, []);

  const beginCompose = useCallback((anchor: CommentAnchor) => {
    setComposeAnchor(anchor);
    setActiveThreadId(null);
    setPanelOpen(true);
  }, []);

  const cancelCompose = useCallback(() => {
    setComposeAnchor(null);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const syncFromLocation = () => {
      const params = new URLSearchParams(window.location.search);
      setRequestedThreadId(params.get("thread"));
    };
    syncFromLocation();
    window.addEventListener("popstate", syncFromLocation);
    return () => window.removeEventListener("popstate", syncFromLocation);
  }, []);

  useEffect(() => {
    if (!panelOpen) return;
    const id = window.setInterval(() => {
      if (panelOpenRef.current) {
        void refresh();
      }
    }, POLL_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [panelOpen, refresh]);

  useEffect(() => {
    if (refreshOnMount) {
      const id = window.setTimeout(() => {
        void refresh();
      }, 0);
      return () => window.clearTimeout(id);
    }
  }, [refreshOnMount, refresh]);

  useEffect(() => {
    if (!requestedThreadId) return;
    if (!threads.some((thread) => thread.id === requestedThreadId)) return;
    const id = window.setTimeout(() => {
      openPanel(requestedThreadId);
    }, 0);
    return () => window.clearTimeout(id);
  }, [openPanel, requestedThreadId, threads]);

  useEffect(() => {
    if (!panelOpen || !activeThreadId || !currentUserEmail) return;
    if (!isThreadUnread(activeThreadId)) return;
    void markInboxThreadRead(pageId, activeThreadId);
  }, [
    activeThreadId,
    currentUserEmail,
    isThreadUnread,
    markInboxThreadRead,
    pageId,
    panelOpen,
  ]);

  const createThread = useCallback(
    async (anchor: CommentAnchor, body: string): Promise<Thread | null> => {
      if (!localAuthor) return null;
      const trimmed = body.trim();
      if (!trimmed) return null;
      try {
        const created = await createThreadAction(pageId, anchor, trimmed);
        setThreads((prev) => [...prev, created]);
        setPendingThreadId(created.id);
        setActiveThreadId(created.id);
        setComposeAnchor(null);
        setPanelOpen(true);
        upsertInboxThread(pageId, created);
        // Não refetch aqui: o CDN do Blob pode servir stale por alguns segundos
        // e sobrescrever nosso otimismo. O polling regular reconcilia.
        return created;
      } catch (err) {
        console.error("createThread failed", err);
        return null;
      }
    },
    [localAuthor, pageId, upsertInboxThread],
  );

  const replyToThread = useCallback(
    async (threadId: string, body: string) => {
      if (!localAuthor) return;
      const trimmed = body.trim();
      if (!trimmed) return;
      const now = new Date().toISOString();
      const optimisticId = `c_optim_${Math.random().toString(36).slice(2, 8)}`;
      let optimisticThread: Thread | null = null;
      setThreads((prev) => {
        const next = prev.map((t) =>
          t.id === threadId
            ? {
                ...t,
                comments: [
                  ...t.comments,
                  {
                    id: optimisticId,
                    body: trimmed,
                    createdAt: now,
                    createdBy: localAuthor,
                    reactions: {},
                  },
                ],
                lastActivityAt: now,
                lastActivityBy: localAuthor,
                participantEmails: t.participantEmails.includes(localAuthor.email)
                  ? t.participantEmails
                  : [...t.participantEmails, localAuthor.email],
              }
            : t,
        );
        optimisticThread = next.find((t) => t.id === threadId) ?? null;
        return next;
      });
      if (optimisticThread) {
        upsertInboxThread(pageId, optimisticThread);
      }
      try {
        await addCommentAction(pageId, threadId, trimmed);
        // Estado otimista é autoritativo; polling reconcilia depois.
      } catch (err) {
        console.error("replyToThread failed", err);
        setThreads((prev) =>
          prev.map((t) =>
            t.id === threadId
              ? {
                  ...t,
                  comments: t.comments.filter((c) => c.id !== optimisticId),
                }
              : t,
          ),
        );
      }
    },
    [localAuthor, pageId, upsertInboxThread],
  );

  const reactToComment = useCallback(
    async (threadId: string, commentId: string, emoji: string) => {
      if (!localAuthor) return;
      const email = localAuthor.email;
      setThreads((prev) =>
        prev.map((t) => {
          if (t.id !== threadId) return t;
          return {
            ...t,
            comments: t.comments.map((c) => {
              if (c.id !== commentId) return c;
              const list = c.reactions[emoji] ?? [];
              const has = list.includes(email);
              const nextList = has
                ? list.filter((e) => e !== email)
                : [...list, email];
              const nextReactions = { ...c.reactions };
              if (nextList.length === 0) {
                delete nextReactions[emoji];
              } else {
                nextReactions[emoji] = nextList;
              }
              return { ...c, reactions: nextReactions };
            }),
          };
        }),
      );
      try {
        await toggleReactionAction(pageId, threadId, commentId, emoji);
      } catch (err) {
        console.error("toggleReaction failed", err);
        await refresh();
      }
    },
    [localAuthor, pageId, refresh],
  );

  const resolveThread = useCallback(
    async (threadId: string, status: ThreadStatus) => {
      setThreads((prev) => {
        const next = prev.map((t) =>
          t.id === threadId ? { ...t, status } : t,
        );
        const updated = next.find((t) => t.id === threadId);
        if (updated) upsertInboxThread(pageId, updated);
        return next;
      });
      try {
        await setThreadStatusAction(pageId, threadId, status);
      } catch (err) {
        console.error("setThreadStatus failed", err);
        await refresh();
      }
    },
    [pageId, refresh, upsertInboxThread],
  );

  const removeComment = useCallback(
    async (threadId: string, commentId: string) => {
      // Otimismo primeiro — UI reage na hora, mesmo antes do fetch.
      const previousThreads = threads;
      setThreads((prev) => {
        const target = prev.find((t) => t.id === threadId);
        if (!target) return prev;
        const remainingComments = target.comments.filter(
          (c) => c.id !== commentId,
        );
        if (remainingComments.length === 0) {
          return prev.filter((t) => t.id !== threadId);
        }
        return prev.map((t) =>
          t.id === threadId ? { ...t, comments: remainingComments } : t,
        );
      });
      const target = previousThreads.find((t) => t.id === threadId);
      const wouldRemoveThread =
        target && target.comments.filter((c) => c.id !== commentId).length === 0;
      if (wouldRemoveThread) {
        setActiveThreadId((curr) => (curr === threadId ? null : curr));
        markThreadRemovedLocally(threadId);
        removeInboxThread(pageId, threadId);
      } else if (target) {
        upsertInboxThread(pageId, {
          ...target,
          comments: target.comments.filter((c) => c.id !== commentId),
        });
      }

      try {
        await deleteCommentAction(pageId, threadId, commentId);
      } catch (err) {
        console.error("deleteComment failed", err);
        // Rollback: volta pro estado anterior e refaz do servidor.
        setThreads(previousThreads);
        await refresh();
      }
    },
    [
      markThreadRemovedLocally,
      pageId,
      refresh,
      removeInboxThread,
      threads,
      upsertInboxThread,
    ],
  );

  const value = useMemo<CommentContextValue>(
    () => ({
      pageId,
      threads,
      activeThreadId,
      panelOpen,
      pendingThreadId,
      composeAnchor,
      currentUserEmail,
      openPanel,
      closePanel,
      setActiveThread,
      beginCompose,
      cancelCompose,
      createThread,
      replyToThread,
      reactToComment,
      resolveThread,
      removeComment,
      refresh,
      isThreadUnread,
    }),
    [
      pageId,
      threads,
      activeThreadId,
      panelOpen,
      pendingThreadId,
      composeAnchor,
      currentUserEmail,
      openPanel,
      closePanel,
      setActiveThread,
      beginCompose,
      cancelCompose,
      createThread,
      replyToThread,
      reactToComment,
      resolveThread,
      removeComment,
      refresh,
      isThreadUnread,
    ],
  );

  return (
    <CommentContext.Provider value={value}>{children}</CommentContext.Provider>
  );
}
