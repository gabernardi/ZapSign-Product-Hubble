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
import { useCommentsStream } from "./CommentsStreamProvider";

/**
 * Mescla threads do stream com overrides otimistas e remoções locais.
 *
 * Reconciliação é puramente lógica (baseada em `lastActivityAt` e presença
 * no servidor) — sem timestamps arbitrários. Um `useEffect` separado cuida
 * de limpar overrides/removes que o servidor já refletiu.
 */
function applyOverrides(
  serverThreads: Thread[],
  overridesById: ReadonlyMap<string, Thread>,
  removedIds: ReadonlySet<string>,
): Thread[] {
  const byId = new Map<string, Thread>(
    serverThreads.map((t) => [t.id, t]),
  );

  for (const id of removedIds) {
    byId.delete(id);
  }

  for (const [id, override] of overridesById) {
    const existing = byId.get(id);
    if (!existing) {
      byId.set(id, override);
      continue;
    }
    const localTs = new Date(override.lastActivityAt).getTime();
    const serverTs = new Date(existing.lastActivityAt).getTime();
    if (localTs > serverTs) {
      byId.set(id, override);
    }
  }

  return [...byId.values()];
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
  /** Reconciliação manual — no modo stream é no-op. */
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
  /** No modo stream, o hint inicial não importa mais; mantido por compatibilidade. */
  refreshOnMount?: boolean;
  children: ReactNode;
}

export function CommentProvider({
  pageId,
  initialThreads,
  children,
}: CommentProviderProps) {
  const { data: session } = useSession();
  const { store, lastEventAt } = useCommentsStream();
  const {
    markThreadRead: markInboxThreadRead,
    isThreadUnread: isInboxThreadUnread,
    upsertThread: upsertInboxThread,
    removeThread: removeInboxThread,
  } = useCommentsInbox();

  const [overrides, setOverrides] = useState<Map<string, Thread>>(
    () => new Map(),
  );
  const [removedIds, setRemovedIds] = useState<Set<string>>(() => new Set());

  const [panelOpen, setPanelOpen] = useState(false);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [pendingThreadId, setPendingThreadId] = useState<string | null>(null);
  const [composeAnchor, setComposeAnchor] = useState<CommentAnchor | null>(
    null,
  );
  const [requestedThreadId, setRequestedThreadId] = useState<string | null>(
    null,
  );

  const sessionEmail = session?.user?.email ?? null;
  const sessionName = session?.user?.name ?? null;
  const sessionImage = session?.user?.image ?? null;
  const currentUserEmail = sessionEmail;

  const localAuthor: Author | null = useMemo(() => {
    if (!sessionEmail) return null;
    return {
      email: sessionEmail,
      name: sessionName ?? undefined,
      image: sessionImage ?? undefined,
    };
  }, [sessionEmail, sessionImage, sessionName]);

  /** Threads base vindas do stream; fallback para initialThreads antes do 1º evento. */
  const serverThreads = useMemo<Thread[]>(() => {
    if (lastEventAt === 0) return initialThreads;
    return store.pages[pageId]?.threads ?? [];
  }, [store, pageId, initialThreads, lastEventAt]);

  const threads = useMemo<Thread[]>(
    () => applyOverrides(serverThreads, overrides, removedIds),
    [serverThreads, overrides, removedIds],
  );

  /**
   * Remove overrides que já estão refletidos no snapshot mais recente do
   * servidor. Chamado inline dentro das próprias ações do usuário (não em
   * effect) para evitar cascading renders.
   */
  const pruneReconciled = useCallback(
    (prevOverrides: Map<string, Thread>, prevRemoved: Set<string>) => {
      const serverById = new Map(serverThreads.map((t) => [t.id, t]));
      const nextOv = new Map(prevOverrides);
      for (const [id, override] of prevOverrides) {
        const srv = serverById.get(id);
        if (!srv) continue;
        const localTs = new Date(override.lastActivityAt).getTime();
        const serverTs = new Date(srv.lastActivityAt).getTime();
        if (serverTs >= localTs) nextOv.delete(id);
      }
      const serverIds = new Set(serverThreads.map((t) => t.id));
      const nextRm = new Set(prevRemoved);
      for (const id of prevRemoved) {
        if (!serverIds.has(id)) nextRm.delete(id);
      }
      return { nextOv, nextRm };
    },
    [serverThreads],
  );

  const upsertLocalOverride = useCallback(
    (thread: Thread) => {
      setOverrides((prev) => {
        const { nextOv } = pruneReconciled(prev, new Set());
        nextOv.set(thread.id, thread);
        return nextOv;
      });
      setRemovedIds((prev) => {
        if (!prev.has(thread.id)) return prev;
        const next = new Set(prev);
        next.delete(thread.id);
        return next;
      });
    },
    [pruneReconciled],
  );

  const markLocalRemoved = useCallback(
    (threadId: string) => {
      setRemovedIds((prev) => {
        const { nextRm } = pruneReconciled(new Map(), prev);
        nextRm.add(threadId);
        return nextRm;
      });
      setOverrides((prev) => {
        if (!prev.has(threadId)) return prev;
        const next = new Map(prev);
        next.delete(threadId);
        return next;
      });
    },
    [pruneReconciled],
  );

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

  const requestedThreadExists = useMemo(
    () => Boolean(requestedThreadId && threads.some((t) => t.id === requestedThreadId)),
    [requestedThreadId, threads],
  );

  useEffect(() => {
    if (!requestedThreadId || !requestedThreadExists) return;
    const id = window.setTimeout(() => {
      openPanel(requestedThreadId);
    }, 0);
    return () => window.clearTimeout(id);
  }, [openPanel, requestedThreadId, requestedThreadExists]);

  const markReadRef = useRef(markInboxThreadRead);
  useEffect(() => {
    markReadRef.current = markInboxThreadRead;
  }, [markInboxThreadRead]);

  useEffect(() => {
    if (!panelOpen || !activeThreadId || !currentUserEmail) return;
    if (!isThreadUnread(activeThreadId)) return;
    void markReadRef.current(pageId, activeThreadId);
  }, [
    activeThreadId,
    currentUserEmail,
    isThreadUnread,
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
        upsertLocalOverride(created);
        setPendingThreadId(created.id);
        setActiveThreadId(created.id);
        setComposeAnchor(null);
        setPanelOpen(true);
        upsertInboxThread(pageId, created);
        return created;
      } catch (err) {
        console.error("createThread failed", err);
        return null;
      }
    },
    [localAuthor, pageId, upsertInboxThread, upsertLocalOverride],
  );

  const replyToThread = useCallback(
    async (threadId: string, body: string) => {
      if (!localAuthor) return;
      const trimmed = body.trim();
      if (!trimmed) return;
      const now = new Date().toISOString();
      const optimisticId = `c_optim_${Math.random().toString(36).slice(2, 8)}`;
      const current = threads.find((t) => t.id === threadId);
      if (!current) return;
      const optimistic: Thread = {
        ...current,
        comments: [
          ...current.comments,
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
        participantEmails: current.participantEmails.includes(localAuthor.email)
          ? current.participantEmails
          : [...current.participantEmails, localAuthor.email],
      };
      upsertLocalOverride(optimistic);
      upsertInboxThread(pageId, optimistic);
      try {
        await addCommentAction(pageId, threadId, trimmed);
        // O servidor vai emitir o snapshot real pelo stream; o override expira
        // assim que o server refletir o mesmo `lastActivityAt` ou mais novo.
      } catch (err) {
        console.error("replyToThread failed", err);
        // Remove o override otimista para deixar o servidor ganhar.
        setOverrides((prev) => {
          const next = new Map(prev);
          next.delete(threadId);
          return next;
        });
      }
    },
    [localAuthor, pageId, threads, upsertInboxThread, upsertLocalOverride],
  );

  const reactToComment = useCallback(
    async (threadId: string, commentId: string, emoji: string) => {
      if (!localAuthor) return;
      const email = localAuthor.email;
      const current = threads.find((t) => t.id === threadId);
      if (!current) return;
      const optimistic: Thread = {
        ...current,
        comments: current.comments.map((c) => {
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
        lastActivityAt: new Date().toISOString(),
      };
      upsertLocalOverride(optimistic);
      try {
        await toggleReactionAction(pageId, threadId, commentId, emoji);
      } catch (err) {
        console.error("toggleReaction failed", err);
        setOverrides((prev) => {
          const next = new Map(prev);
          next.delete(threadId);
          return next;
        });
      }
    },
    [localAuthor, pageId, threads, upsertLocalOverride],
  );

  const resolveThread = useCallback(
    async (threadId: string, status: ThreadStatus) => {
      const current = threads.find((t) => t.id === threadId);
      if (!current) return;
      const optimistic: Thread = {
        ...current,
        status,
        lastActivityAt: new Date().toISOString(),
      };
      upsertLocalOverride(optimistic);
      upsertInboxThread(pageId, optimistic);
      try {
        await setThreadStatusAction(pageId, threadId, status);
      } catch (err) {
        console.error("setThreadStatus failed", err);
        setOverrides((prev) => {
          const next = new Map(prev);
          next.delete(threadId);
          return next;
        });
      }
    },
    [pageId, threads, upsertInboxThread, upsertLocalOverride],
  );

  const removeComment = useCallback(
    async (threadId: string, commentId: string) => {
      const current = threads.find((t) => t.id === threadId);
      if (!current) return;
      const remainingComments = current.comments.filter(
        (c) => c.id !== commentId,
      );
      const wouldRemoveThread = remainingComments.length === 0;

      if (wouldRemoveThread) {
        markLocalRemoved(threadId);
        setActiveThreadId((curr) => (curr === threadId ? null : curr));
        removeInboxThread(pageId, threadId);
      } else {
        const optimistic: Thread = {
          ...current,
          comments: remainingComments,
          lastActivityAt: new Date().toISOString(),
        };
        upsertLocalOverride(optimistic);
        upsertInboxThread(pageId, optimistic);
      }

      try {
        await deleteCommentAction(pageId, threadId, commentId);
      } catch (err) {
        console.error("deleteComment failed", err);
        // Rollback: limpa overrides/remoções locais; stream traz a verdade.
        setOverrides((prev) => {
          const next = new Map(prev);
          next.delete(threadId);
          return next;
        });
        setRemovedIds((prev) => {
          if (!prev.has(threadId)) return prev;
          const next = new Set(prev);
          next.delete(threadId);
          return next;
        });
      }
    },
    [
      markLocalRemoved,
      pageId,
      removeInboxThread,
      threads,
      upsertInboxThread,
      upsertLocalOverride,
    ],
  );

  const refresh = useCallback(async () => {
    // No modo stream, não há polling a disparar. Mantido por compatibilidade.
  }, []);

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
