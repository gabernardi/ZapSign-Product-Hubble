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
  markAllThreadsRead as markAllThreadsReadAction,
  markThreadRead as markThreadReadAction,
} from "@/app/actions/comments";
import type {
  CommentInboxItem,
  CommentInboxSummary,
  Thread,
} from "@/lib/data/comments";

const POLL_INTERVAL_MS = 3_000;

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

function itemKey(item: CommentInboxItem): string {
  return `${item.pageId}|${item.thread.id}`;
}

/**
 * Combina o estado local (otimista) com a resposta do servidor por thread.
 * Se o local tem `lastActivityAt` mais novo que o servidor — o que acontece
 * nos segundos iniciais enquanto o Blob se propaga — mantemos o local. Caso
 * contrário, o servidor vence (fonte da verdade). Threads que só existem
 * localmente e ainda não passaram de uma janela de graça também são mantidas.
 */
function mergeInboxItems(
  local: CommentInboxItem[],
  server: CommentInboxItem[],
  removedLocally: ReadonlySet<string>,
  graceMs: number,
): CommentInboxItem[] {
  const localByKey = new Map(local.map((item) => [itemKey(item), item]));
  const serverByKey = new Map(server.map((item) => [itemKey(item), item]));
  const now = Date.now();
  const result: CommentInboxItem[] = [];
  const used = new Set<string>();

  for (const serverItem of server) {
    const key = itemKey(serverItem);
    if (removedLocally.has(key)) {
      // Removido otimisticamente e o servidor ainda tem cache stale — ignora.
      continue;
    }
    const localItem = localByKey.get(key);
    if (
      localItem &&
      new Date(localItem.thread.lastActivityAt).getTime() >
        new Date(serverItem.thread.lastActivityAt).getTime()
    ) {
      result.push(localItem);
    } else {
      result.push(serverItem);
    }
    used.add(key);
  }

  // Preserva itens locais que ainda não chegaram no servidor (criados há
  // poucos segundos) — dá uma janela de graça pro Blob propagar.
  for (const localItem of local) {
    const key = itemKey(localItem);
    if (used.has(key)) continue;
    if (serverByKey.has(key)) continue;
    const ageMs =
      now - new Date(localItem.thread.lastActivityAt).getTime();
    if (ageMs < graceMs) {
      result.push(localItem);
    }
  }

  return sortByActivity(result);
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

const OPTIMISTIC_GRACE_MS = 30_000;

export function CommentsInboxProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [items, setItems] = useState<CommentInboxItem[]>([]);
  const [loading, setLoading] = useState(true);
  // Chaves removidas otimisticamente: ignoramos essas threads se o servidor
  // ainda estiver retornando-as (stale) durante a janela de graça.
  const removedKeysRef = useRef<Map<string, number>>(new Map());

  const currentUserEmail = session?.user?.email ?? null;

  const markRemovedKey = useCallback((pageId: string, threadId: string) => {
    removedKeysRef.current.set(`${pageId}|${threadId}`, Date.now());
  }, []);

  const getActiveRemovedKeys = useCallback((): Set<string> => {
    const now = Date.now();
    const active = new Set<string>();
    for (const [key, addedAt] of removedKeysRef.current) {
      if (now - addedAt < OPTIMISTIC_GRACE_MS) {
        active.add(key);
      } else {
        removedKeysRef.current.delete(key);
      }
    }
    return active;
  }, []);

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
      const serverItems = Array.isArray(data.items) ? data.items : [];
      const removed = getActiveRemovedKeys();
      setItems((prev) =>
        mergeInboxItems(prev, serverItems, removed, OPTIMISTIC_GRACE_MS),
      );
    } catch {
      // Silencioso: polling eventual corrige.
    } finally {
      setLoading(false);
    }
  }, [currentUserEmail, getActiveRemovedKeys]);

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

  const removeThread = useCallback(
    (pageId: string, threadId: string) => {
      markRemovedKey(pageId, threadId);
      setItems((prev) =>
        prev.filter(
          (item) => !(item.pageId === pageId && item.thread.id === threadId),
        ),
      );
    },
    [markRemovedKey],
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
