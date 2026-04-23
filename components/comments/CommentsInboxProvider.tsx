"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useSession } from "next-auth/react";
import {
  markAllThreadsRead as markAllThreadsReadAction,
  markThreadRead as markThreadReadAction,
} from "@/app/actions/comments";
import {
  getInboxItems,
  getInboxSummary,
  type CommentInboxItem,
  type CommentInboxSummary,
  type Thread,
} from "@/lib/data/comments";
import { useCommentsStream } from "./CommentsStreamProvider";

interface CommentsInboxContextValue {
  items: CommentInboxItem[];
  summary: CommentInboxSummary;
  loading: boolean;
  currentUserEmail: string | null;
  /** Reconciliação manual; no modo stream, não faz nada (o stream já atualiza). */
  refresh: () => Promise<void>;
  markThreadRead: (pageId: string, threadId: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  isThreadUnread: (pageId: string, threadId: string) => boolean;
  /** Override otimista até o stream confirmar. */
  upsertThread: (pageId: string, thread: Thread) => void;
  /** Remoção otimista até o stream confirmar. */
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

function itemKey(pageId: string, threadId: string): string {
  return `${pageId}|${threadId}`;
}

function sortByActivity(items: CommentInboxItem[]): CommentInboxItem[] {
  return [...items].sort(
    (a, b) =>
      new Date(b.thread.lastActivityAt).getTime() -
      new Date(a.thread.lastActivityAt).getTime(),
  );
}

export function CommentsInboxProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const { store, lastEventAt } = useCommentsStream();
  const [overrides, setOverrides] = useState<Map<string, CommentInboxItem>>(
    () => new Map(),
  );
  const [removed, setRemoved] = useState<Set<string>>(() => new Set());

  const currentUserEmail = session?.user?.email ?? null;
  const loading = status === "loading" || lastEventAt === 0;

  const items = useMemo<CommentInboxItem[]>(() => {
    if (!currentUserEmail) return [];
    const base = getInboxItems(store, currentUserEmail);
    const baseMap = new Map<string, CommentInboxItem>();
    for (const item of base) {
      baseMap.set(itemKey(item.pageId, item.thread.id), item);
    }

    for (const [key, item] of overrides) {
      const existing = baseMap.get(key);
      if (!existing) {
        baseMap.set(key, item);
        continue;
      }
      const localTs = new Date(item.thread.lastActivityAt).getTime();
      const serverTs = new Date(existing.thread.lastActivityAt).getTime();
      if (localTs > serverTs) {
        baseMap.set(key, item);
      }
    }

    for (const key of removed) {
      baseMap.delete(key);
    }

    return sortByActivity([...baseMap.values()]);
  }, [store, overrides, removed, currentUserEmail]);

  /**
   * Remove overrides/removes já reconciliados pelo snapshot mais recente do
   * servidor. Chamado inline nas próprias ações (não em effect).
   */
  const pruneReconciled = useCallback(
    (
      prevOverrides: Map<string, CommentInboxItem>,
      prevRemoved: Set<string>,
    ) => {
      const nextOv = new Map(prevOverrides);
      for (const [key, item] of prevOverrides) {
        const page = store.pages[item.pageId];
        const serverThread = page?.threads.find(
          (t) => t.id === item.thread.id,
        );
        if (!serverThread) continue;
        const localTs = new Date(item.thread.lastActivityAt).getTime();
        const serverTs = new Date(serverThread.lastActivityAt).getTime();
        if (serverTs >= localTs) nextOv.delete(key);
      }
      const nextRm = new Set(prevRemoved);
      for (const key of prevRemoved) {
        const [pageId, threadId] = key.split("|");
        const page = store.pages[pageId];
        if (!page?.threads.some((t) => t.id === threadId)) {
          nextRm.delete(key);
        }
      }
      return { nextOv, nextRm };
    },
    [store],
  );

  const summary = useMemo<CommentInboxSummary>(() => {
    if (!currentUserEmail) {
      return { totalCount: 0, openCount: 0, unreadCount: 0 };
    }
    // Prefere o resumo derivado dos items (que já contém overrides otimistas).
    // Para fallback inicial (sem items ainda), usa o helper puro.
    if (items.length === 0 && lastEventAt === 0) {
      return getInboxSummary(store, currentUserEmail);
    }
    return {
      totalCount: items.length,
      openCount: items.filter((it) => it.thread.status === "open").length,
      unreadCount: items.filter((it) => it.unread).length,
    };
  }, [items, lastEventAt, store, currentUserEmail]);

  const refresh = useCallback(async () => {
    // No modo stream, não há polling a disparar. Mantido por compatibilidade.
  }, []);

  const upsertThread = useCallback(
    (pageId: string, thread: Thread) => {
      const lastComment = thread.comments[thread.comments.length - 1];
      const key = itemKey(pageId, thread.id);
      if (!lastComment) {
        setRemoved((prev) => {
          const { nextRm } = pruneReconciled(new Map(), prev);
          nextRm.add(key);
          return nextRm;
        });
        setOverrides((prev) => {
          const { nextOv } = pruneReconciled(prev, new Set());
          nextOv.delete(key);
          return nextOv;
        });
        return;
      }
      const meta = pageMeta(pageId);
      const mine =
        currentUserEmail &&
        lastComment.createdBy.email.toLowerCase() ===
          currentUserEmail.toLowerCase();
      const item: CommentInboxItem = {
        pageId,
        pageLabel: meta.label,
        pageSection: meta.section,
        thread,
        lastComment,
        unread: mine ? false : false,
      };
      setOverrides((prev) => {
        const { nextOv } = pruneReconciled(prev, new Set());
        nextOv.set(key, item);
        return nextOv;
      });
      setRemoved((prev) => {
        if (!prev.has(key)) return prev;
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    },
    [currentUserEmail, pruneReconciled],
  );

  const removeThread = useCallback(
    (pageId: string, threadId: string) => {
      const key = itemKey(pageId, threadId);
      setRemoved((prev) => {
        const { nextRm } = pruneReconciled(new Map(), prev);
        nextRm.add(key);
        return nextRm;
      });
      setOverrides((prev) => {
        if (!prev.has(key)) return prev;
        const next = new Map(prev);
        next.delete(key);
        return next;
      });
    },
    [pruneReconciled],
  );

  const markThreadRead = useCallback(
    async (pageId: string, threadId: string) => {
      const key = itemKey(pageId, threadId);
      const existing = items.find(
        (it) => it.pageId === pageId && it.thread.id === threadId,
      );
      if (existing) {
        setOverrides((prev) => {
          const { nextOv } = pruneReconciled(prev, new Set());
          nextOv.set(key, { ...existing, unread: false });
          return nextOv;
        });
      }
      try {
        await markThreadReadAction(pageId, threadId);
      } catch (err) {
        console.error("markThreadRead failed", err);
      }
    },
    [items, pruneReconciled],
  );

  const markAllRead = useCallback(async () => {
    setOverrides(() => {
      const next = new Map<string, CommentInboxItem>();
      for (const existing of items) {
        next.set(itemKey(existing.pageId, existing.thread.id), {
          ...existing,
          unread: false,
        });
      }
      return next;
    });
    try {
      await markAllThreadsReadAction();
    } catch (err) {
      console.error("markAllRead failed", err);
    }
  }, [items]);

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
