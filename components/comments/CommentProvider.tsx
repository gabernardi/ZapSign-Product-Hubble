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

const POLL_INTERVAL_MS = 15_000;

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
  } = useCommentsInbox();
  const [threads, setThreads] = useState<Thread[]>(initialThreads);
  const [panelOpen, setPanelOpen] = useState(false);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [pendingThreadId, setPendingThreadId] = useState<string | null>(null);
  const [composeAnchor, setComposeAnchor] = useState<CommentAnchor | null>(
    null,
  );
  const [requestedThreadId, setRequestedThreadId] = useState<string | null>(null);

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
        setThreads(data.threads);
      }
    } catch {
      // silencioso — o usuário verá o estado otimista até o próximo ciclo
    }
  }, [pageId]);

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
        await refreshInbox();
        return created;
      } catch (err) {
        console.error("createThread failed", err);
        return null;
      }
    },
    [localAuthor, pageId, refreshInbox],
  );

  const replyToThread = useCallback(
    async (threadId: string, body: string) => {
      if (!localAuthor) return;
      const trimmed = body.trim();
      if (!trimmed) return;
      const now = new Date().toISOString();
      const optimisticId = `c_optim_${Math.random().toString(36).slice(2, 8)}`;
      setThreads((prev) =>
        prev.map((t) =>
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
              }
            : t,
        ),
      );
      try {
        await addCommentAction(pageId, threadId, trimmed);
        await refresh();
        await refreshInbox();
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
    [localAuthor, pageId, refresh, refreshInbox],
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
      setThreads((prev) =>
        prev.map((t) => (t.id === threadId ? { ...t, status } : t)),
      );
      try {
        await setThreadStatusAction(pageId, threadId, status);
        await refreshInbox();
      } catch (err) {
        console.error("setThreadStatus failed", err);
        await refresh();
      }
    },
    [pageId, refresh, refreshInbox],
  );

  const removeComment = useCallback(
    async (threadId: string, commentId: string) => {
      try {
        const result = await deleteCommentAction(pageId, threadId, commentId);
        if (result.threadRemoved) {
          setThreads((prev) => prev.filter((t) => t.id !== threadId));
          setActiveThreadId((curr) => (curr === threadId ? null : curr));
        } else {
          setThreads((prev) =>
            prev.map((t) =>
              t.id === threadId
                ? {
                    ...t,
                    comments: t.comments.filter((c) => c.id !== commentId),
                  }
                : t,
            ),
          );
        }
        await refreshInbox();
      } catch (err) {
        console.error("deleteComment failed", err);
        await refresh();
      }
    },
    [pageId, refresh, refreshInbox],
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
