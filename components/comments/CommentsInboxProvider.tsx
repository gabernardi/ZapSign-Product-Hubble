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
  Thread,
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
  /**
   * Atualiza (ou insere) uma thread no cache local da inbox. Chamado pelo
   * `CommentProvider` após ações locais para refletir a mudança na UI global
   * antes da resposta do servidor chegar.
   */
  upsertThread: (pageId: string, thread: Thread) => void;
  /**
   * Remove uma thread do cache local da inbox (ex.: delete do último
   * comentário que resulta em remoção da thread inteira).
   */
  removeThread: (pageId: string, threadId: string) => void;
}

const CommentsInboxContext = createContext<CommentsInboxContextValue | null>(
  null,
);

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
  "/dashboard/contribuir": { label: "Laboratório", section: "Laboratório" },
  "/dashboard/changelog": { label: "Changelog", section: "Laboratório" },
  "/dashboard/management-tips": { label: "Liderança", section: "Processo" },
};

function pageMeta(pageId: string): { label: string; section: string } {
  if (pageId.startsWith("/dashboard/roadmap/")) {
    const quarter = pageId.split("/").pop()?.toUpperCase() ?? "Roadmap";
    return { label: `Roadmap ${quarter}`, section: "Roadmap" };
  }
  return (
    COMMENT_PAGE_META[pageId] ?? {
      label: pageId.replace("/dashboard/", "").replaceAll("-", " "),
      section: "Outras páginas",
    }
  );
}

function sortByActivity(items: CommentInboxItem[]): CommentInboxItem[] {
  return [...items].sort(
    (a, b) =>
      new Date(b.thread.lastActivityAt).getTime() -
      new Date(a.thread.lastActivityAt).getTime(),
  );
}

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

  const upsertThread = useCallback(
    (pageId: string, thread: Thread) => {
      const lastComment = thread.comments[thread.comments.length - 1];
      if (!lastComment) {
        setItems((prev) =>
          prev.filter(
            (item) => !(item.pageId === pageId && item.thread.id === thread.id),
          ),
        );
        return;
      }
      setItems((prev) => {
        const meta = pageMeta(pageId);
        const existing = prev.find(
          (item) => item.pageId === pageId && item.thread.id === thread.id,
        );
        const nextItem: CommentInboxItem = existing
          ? {
              ...existing,
              thread,
              lastComment,
              // Mantém estado de unread otimista: ação do próprio usuário
              // marca como lido; atividade de outros só vira "unread" via
              // refresh do servidor.
              unread:
                currentUserEmail &&
                lastComment.createdBy.email.toLowerCase() ===
                  currentUserEmail.toLowerCase()
                  ? false
                  : existing.unread,
            }
          : {
              pageId,
              pageLabel: meta.label,
              pageSection: meta.section,
              thread,
              lastComment,
              unread: false,
            };
        const without = prev.filter(
          (item) => !(item.pageId === pageId && item.thread.id === thread.id),
        );
        return sortByActivity([...without, nextItem]);
      });
    },
    [currentUserEmail],
  );

  const removeThread = useCallback((pageId: string, threadId: string) => {
    setItems((prev) =>
      prev.filter(
        (item) => !(item.pageId === pageId && item.thread.id === threadId),
      ),
    );
  }, []);

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
      upsertThread,
      removeThread,
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
      upsertThread,
      removeThread,
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
