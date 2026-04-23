"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { useSession } from "next-auth/react";
import {
  markAllThreadsRead as markAllThreadsReadAction,
  markThreadRead as markThreadReadAction,
} from "@/app/actions/comments";
import type {
  CommentInboxItem,
  CommentInboxSummary,
} from "@/lib/comments/types";
import { pageMeta } from "@/lib/comments/page-meta";
import { useCommentsRealtime } from "./CommentsRealtimeProvider";

interface CommentsInboxContextValue {
  items: CommentInboxItem[];
  summary: CommentInboxSummary;
  loading: boolean;
  currentUserEmail: string | null;
  /** No-op no modo real-time. Mantido por compatibilidade. */
  refresh: () => Promise<void>;
  markThreadRead: (pageId: string, threadId: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  isThreadUnread: (pageId: string, threadId: string) => boolean;
}

const CommentsInboxContext = createContext<CommentsInboxContextValue | null>(
  null,
);

/**
 * Deriva items/summary da inbox a partir do estado global do realtime
 * provider. Mutations (markRead, markAllRead) são otimistas: aplicam no
 * estado local imediatamente e em seguida chamam o server action.
 * O broadcast via Pusher reconcilia outras abas do mesmo usuário.
 */
export function CommentsInboxProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const {
    threads,
    loading: realtimeLoading,
    markReadLocal,
    markAllReadLocal,
  } = useCommentsRealtime();

  const currentUserEmail = session?.user?.email?.toLowerCase() ?? null;
  const loading = status === "loading" || realtimeLoading;

  const items = useMemo<CommentInboxItem[]>(() => {
    if (!currentUserEmail) return [];
    const list: CommentInboxItem[] = [];
    for (const thread of threads) {
      const last = thread.comments[thread.comments.length - 1];
      if (!last) continue;
      const meta = pageMeta(thread.pageId);
      const readAt = thread.readAtForCurrentUser;
      const lastActivityMs = new Date(thread.lastActivityAt).getTime();
      const unread = readAt
        ? lastActivityMs > new Date(readAt).getTime()
        : thread.lastActivityBy.email.toLowerCase() !== currentUserEmail;
      list.push({
        pageId: thread.pageId,
        pageLabel: meta.label,
        pageSection: meta.section,
        thread,
        unread,
        lastComment: last,
      });
    }
    list.sort(
      (a, b) =>
        new Date(b.thread.lastActivityAt).getTime() -
        new Date(a.thread.lastActivityAt).getTime(),
    );
    return list;
  }, [threads, currentUserEmail]);

  const summary = useMemo<CommentInboxSummary>(
    () => ({
      totalCount: items.length,
      openCount: items.filter((it) => it.thread.status === "open").length,
      unreadCount: items.filter((it) => it.unread).length,
    }),
    [items],
  );

  const refresh = useCallback(async () => {
    /* no-op */
  }, []);

  const markThreadRead = useCallback(
    async (pageId: string, threadId: string) => {
      const readAt = new Date().toISOString();
      markReadLocal(threadId, readAt);
      try {
        await markThreadReadAction(pageId, threadId);
      } catch (err) {
        console.error("markThreadRead failed", err);
      }
    },
    [markReadLocal],
  );

  const markAllRead = useCallback(async () => {
    const readAt = new Date().toISOString();
    markAllReadLocal(readAt);
    try {
      await markAllThreadsReadAction();
    } catch (err) {
      console.error("markAllRead failed", err);
    }
  }, [markAllReadLocal]);

  const isThreadUnread = useCallback(
    (pageId: string, threadId: string) => {
      const item = items.find(
        (it) => it.pageId === pageId && it.thread.id === threadId,
      );
      return item ? item.unread : false;
    },
    [items],
  );

  const value = useMemo<CommentsInboxContextValue>(
    () => ({
      items,
      summary,
      loading,
      currentUserEmail,
      refresh,
      markThreadRead,
      markAllRead,
      isThreadUnread,
    }),
    [
      items,
      summary,
      loading,
      currentUserEmail,
      refresh,
      markThreadRead,
      markAllRead,
      isThreadUnread,
    ],
  );

  return (
    <CommentsInboxContext.Provider value={value}>
      {children}
    </CommentsInboxContext.Provider>
  );
}

export function useCommentsInbox(): CommentsInboxContextValue {
  const context = useContext(CommentsInboxContext);
  if (!context) {
    throw new Error(
      "useCommentsInbox deve ser usado dentro de <CommentsInboxProvider>.",
    );
  }
  return context;
}
