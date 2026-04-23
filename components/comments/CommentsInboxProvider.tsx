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
  markAllThreadsRead as markAllThreadsReadAction,
  markThreadRead as markThreadReadAction,
} from "@/app/actions/comments";
import type {
  CommentInboxItem,
  CommentInboxSummary,
} from "@/lib/data/comments";

const POLL_INTERVAL_MS = 30_000;

interface CommentsInboxContextValue {
  items: CommentInboxItem[];
  summary: CommentInboxSummary;
  loading: boolean;
  currentUserEmail: string | null;
  refresh: () => Promise<void>;
  markThreadRead: (pageId: string, threadId: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  isThreadUnread: (pageId: string, threadId: string) => boolean;
}

const CommentsInboxContext = createContext<CommentsInboxContextValue | null>(
  null,
);

function applyThreadRead(
  items: CommentInboxItem[],
  pageId: string,
  threadId: string,
): CommentInboxItem[] {
  return items.map((item) =>
    item.pageId === pageId && item.thread.id === threadId
      ? { ...item, unread: false }
      : item,
  );
}

function recomputeSummary(items: CommentInboxItem[]): CommentInboxSummary {
  return {
    totalCount: items.length,
    openCount: items.filter((item) => item.thread.status === "open").length,
    unreadCount: items.filter((item) => item.unread).length,
  };
}

export function CommentsInboxProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [items, setItems] = useState<CommentInboxItem[]>([]);
  const [loading, setLoading] = useState(true);

  const currentUserEmail = session?.user?.email ?? null;

  const refresh = useCallback(async () => {
    if (!currentUserEmail) {
      setItems([]);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/comments/inbox", { cache: "no-store" });
      if (!response.ok) return;
      const data = (await response.json()) as {
        items: CommentInboxItem[];
        summary: CommentInboxSummary;
      };
      setItems(Array.isArray(data.items) ? data.items : []);
    } catch {
      // Silencioso: polling eventual corrige.
    } finally {
      setLoading(false);
    }
  }, [currentUserEmail]);

  const summary = useMemo(
    () => recomputeSummary(items),
    [items],
  );

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (status !== "authenticated") return;
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void refresh();
      }
    }, POLL_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [refresh, status]);

  const markThreadRead = useCallback(
    async (pageId: string, threadId: string) => {
      setItems((prev) => applyThreadRead(prev, pageId, threadId));
      try {
        await markThreadReadAction(pageId, threadId);
      } catch {
        await refresh();
      }
    },
    [refresh],
  );

  const markAllRead = useCallback(async () => {
    setItems((prev) => prev.map((item) => ({ ...item, unread: false })));
    try {
      await markAllThreadsReadAction();
    } catch {
      await refresh();
    }
  }, [refresh]);

  const isThreadUnread = useCallback(
    (pageId: string, threadId: string) =>
      items.some(
        (item) =>
          item.pageId === pageId && item.thread.id === threadId && item.unread,
      ),
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
