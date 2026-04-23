"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
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
} from "@/lib/comments/types";
import { useCommentsRealtime } from "./CommentsRealtimeProvider";
import { useCommentsInbox } from "./CommentsInboxProvider";

/**
 * Provider por página. Lê threads do provider de realtime (filtrando por
 * `pageId`), expõe UI state (panel aberto, thread ativa, composer) e
 * encaminha ações para server actions — aplicando otimismo via helpers
 * do provider de realtime quando faz sentido.
 *
 * `initialThreads` vem do server component (SSR em cima do Postgres) e
 * serve de fallback enquanto o fetch do realtime provider ainda não
 * terminou — garante que reload nunca mostra página em branco.
 */

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
  resolveThread: (threadId: string, status: ThreadStatus) => Promise<void>;
  removeComment: (threadId: string, commentId: string) => Promise<void>;
  /** No-op no modo real-time. Mantido por compatibilidade. */
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
  /** Ignorado no modo realtime. Mantido por compat. */
  refreshOnMount?: boolean;
  children: ReactNode;
}

function genTempId(prefix: "t" | "c"): string {
  return `${prefix}_pending_${Math.random().toString(36).slice(2, 10)}`;
}

export function CommentProvider({
  pageId,
  initialThreads,
  children,
}: CommentProviderProps) {
  const { data: session } = useSession();
  const {
    threads: allThreads,
    loading,
    applyLocal,
    removeLocal,
    replaceLocal,
  } = useCommentsRealtime();
  const { markThreadRead, isThreadUnread: isInboxThreadUnread } =
    useCommentsInbox();

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

  const [panelOpen, setPanelOpen] = useState(false);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [pendingThreadId, setPendingThreadId] = useState<string | null>(null);
  const [composeAnchor, setComposeAnchor] = useState<CommentAnchor | null>(
    null,
  );
  const [requestedThreadId, setRequestedThreadId] = useState<string | null>(
    null,
  );

  /**
   * Threads relevantes pra esta página.
   *
   * Fallback para initialThreads (SSR):
   *   - enquanto o fetch inicial global ainda está carregando, OU
   *   - o fetch já terminou mas este pageId não tem thread no estado
   *     (caso de uma página que o usuário abriu direto sem passar pela inbox)
   */
  const threads = useMemo<Thread[]>(() => {
    const filtered = allThreads.filter((t) => t.pageId === pageId);
    if (loading && filtered.length === 0) return initialThreads;
    // Merge initialThreads in caso o realtime ainda não conheça alguma.
    // Isso cobre threads que foram criadas entre o SSR e o fetch do client,
    // ou quando a página carrega sem o usuário ainda ter navegado.
    if (filtered.length === 0 && initialThreads.length > 0 && loading) {
      return initialThreads;
    }
    return filtered;
  }, [allThreads, pageId, loading, initialThreads]);

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

  // Abre a thread indicada via ?thread=ID quando ela existir no estado.
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
    () =>
      Boolean(
        requestedThreadId && threads.some((t) => t.id === requestedThreadId),
      ),
    [requestedThreadId, threads],
  );

  useEffect(() => {
    if (!requestedThreadId || !requestedThreadExists) return;
    const id = window.setTimeout(() => {
      openPanel(requestedThreadId);
    }, 0);
    return () => window.clearTimeout(id);
  }, [openPanel, requestedThreadId, requestedThreadExists]);

  // Auto-mark read quando a thread ativa entra em foco.
  useEffect(() => {
    if (!panelOpen || !activeThreadId || !currentUserEmail) return;
    if (!isThreadUnread(activeThreadId)) return;
    void markThreadRead(pageId, activeThreadId);
  }, [
    activeThreadId,
    currentUserEmail,
    isThreadUnread,
    markThreadRead,
    pageId,
    panelOpen,
  ]);

  const createThread = useCallback(
    async (anchor: CommentAnchor, body: string): Promise<Thread | null> => {
      if (!localAuthor) return null;
      const trimmed = body.trim();
      if (!trimmed) return null;

      const tempId = genTempId("t");
      const now = new Date().toISOString();
      const optimistic: Thread = {
        id: tempId,
        pageId,
        anchor,
        status: "open",
        createdAt: now,
        createdBy: localAuthor,
        comments: [
          {
            id: genTempId("c"),
            body: trimmed,
            createdAt: now,
            createdBy: localAuthor,
            reactions: {},
          },
        ],
        participantEmails: [localAuthor.email.toLowerCase()],
        lastActivityAt: now,
        lastActivityBy: localAuthor,
        readAtForCurrentUser: now,
      };

      applyLocal(optimistic);
      setPendingThreadId(tempId);
      setActiveThreadId(tempId);
      setComposeAnchor(null);
      setPanelOpen(true);

      try {
        const real = await createThreadAction(pageId, anchor, trimmed);
        replaceLocal(tempId, real);
        setActiveThreadId((curr) => (curr === tempId ? real.id : curr));
        setPendingThreadId(real.id);
        return real;
      } catch (err) {
        console.error("createThread failed", err);
        removeLocal(tempId);
        setActiveThreadId((curr) => (curr === tempId ? null : curr));
        setPendingThreadId((curr) => (curr === tempId ? null : curr));
        return null;
      }
    },
    [applyLocal, localAuthor, pageId, removeLocal, replaceLocal],
  );

  const replyToThread = useCallback(
    async (threadId: string, body: string) => {
      if (!localAuthor) return;
      const trimmed = body.trim();
      if (!trimmed) return;
      const current = threads.find((t) => t.id === threadId);
      if (!current) return;

      const now = new Date().toISOString();
      const optimisticComment = {
        id: genTempId("c"),
        body: trimmed,
        createdAt: now,
        createdBy: localAuthor,
        reactions: {},
      };
      const optimistic: Thread = {
        ...current,
        comments: [...current.comments, optimisticComment],
        lastActivityAt: now,
        lastActivityBy: localAuthor,
        participantEmails: current.participantEmails.includes(
          localAuthor.email.toLowerCase(),
        )
          ? current.participantEmails
          : [...current.participantEmails, localAuthor.email.toLowerCase()],
        readAtForCurrentUser: now,
      };
      applyLocal(optimistic);

      try {
        await addCommentAction(pageId, threadId, trimmed);
        // Pusher vai entregar `thread.upserted` com o estado canônico,
        // incluindo o ID real do comentário — `applyLocal` por id de thread
        // faz o merge certo.
      } catch (err) {
        console.error("replyToThread failed", err);
        // Rollback: volta ao estado sem o comentário otimista.
        applyLocal(current);
      }
    },
    [applyLocal, localAuthor, pageId, threads],
  );

  const reactToComment = useCallback(
    async (threadId: string, commentId: string, emoji: string) => {
      if (!localAuthor) return;
      const email = localAuthor.email.toLowerCase();
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
          const next = { ...c.reactions };
          if (nextList.length === 0) delete next[emoji];
          else next[emoji] = nextList;
          return { ...c, reactions: next };
        }),
      };
      applyLocal(optimistic);
      try {
        await toggleReactionAction(pageId, threadId, commentId, emoji);
      } catch (err) {
        console.error("toggleReaction failed", err);
        applyLocal(current);
      }
    },
    [applyLocal, localAuthor, pageId, threads],
  );

  const resolveThread = useCallback(
    async (threadId: string, status: ThreadStatus) => {
      const current = threads.find((t) => t.id === threadId);
      if (!current) return;
      const optimistic: Thread = { ...current, status };
      applyLocal(optimistic);
      try {
        await setThreadStatusAction(pageId, threadId, status);
      } catch (err) {
        console.error("setThreadStatus failed", err);
        applyLocal(current);
      }
    },
    [applyLocal, pageId, threads],
  );

  const removeComment = useCallback(
    async (threadId: string, commentId: string) => {
      const current = threads.find((t) => t.id === threadId);
      if (!current) return;
      const remaining = current.comments.filter((c) => c.id !== commentId);
      const wouldRemoveThread = remaining.length === 0;

      if (wouldRemoveThread) {
        removeLocal(threadId);
        setActiveThreadId((curr) => (curr === threadId ? null : curr));
      } else {
        const optimistic: Thread = {
          ...current,
          comments: remaining,
        };
        applyLocal(optimistic);
      }

      try {
        await deleteCommentAction(pageId, threadId, commentId);
      } catch (err) {
        console.error("deleteComment failed", err);
        applyLocal(current);
      }
    },
    [applyLocal, pageId, removeLocal, threads],
  );

  const refresh = useCallback(async () => {
    /* no-op */
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
