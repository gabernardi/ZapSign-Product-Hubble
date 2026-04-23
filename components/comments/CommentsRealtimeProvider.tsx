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
import PusherClient from "pusher-js";
import type { Thread } from "@/lib/comments/types";
import {
  COMMENTS_CHANNEL,
  COMMENTS_EVENT_NAME,
  type CommentsEvent,
} from "@/lib/comments/events";

/**
 * Fonte única de verdade client-side para comentários.
 *
 * - Faz um fetch inicial em `/api/comments/inbox` pra hidratar o estado global.
 * - Abre uma conexão WebSocket via Pusher (canal privado `private-comments`).
 * - Aplica eventos `thread.upserted`, `thread.deleted`, `thread.read` em tempo
 *   real no estado interno.
 * - Expõe helpers `applyLocal` / `removeLocal` / `replaceLocal` pros providers
 *   de UI fazerem otimismo imediato antes do round-trip.
 *
 * Reload sempre traz o estado correto: o SSR consulta o Postgres diretamente,
 * e este provider refaz o fetch inicial + reconecta o WS.
 */

interface CommentsRealtimeContextValue {
  threads: Thread[];
  connected: boolean;
  loading: boolean;
  applyLocal: (thread: Thread) => void;
  removeLocal: (threadId: string) => void;
  replaceLocal: (tempId: string, real: Thread) => void;
  markReadLocal: (threadId: string, readAt: string) => void;
  markAllReadLocal: (readAt: string) => void;
}

const CommentsRealtimeContext =
  createContext<CommentsRealtimeContextValue | null>(null);

function mergeThread(list: Thread[], next: Thread): Thread[] {
  const idx = list.findIndex((t) => t.id === next.id);
  if (idx >= 0) {
    const copy = list.slice();
    copy[idx] = next;
    return copy;
  }
  return [next, ...list];
}

interface InboxApiResponse {
  items?: Array<{ thread?: Thread }>;
}

export function CommentsRealtimeProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const userEmail = session?.user?.email?.toLowerCase() ?? null;

  const [threads, setThreads] = useState<Thread[]>([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch inicial (sempre que a sessão for autenticada).
  useEffect(() => {
    if (status !== "authenticated") return;
    let cancelled = false;
    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch("/api/comments/inbox", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`inbox HTTP ${res.status}`);
        const data = (await res.json()) as InboxApiResponse;
        if (cancelled) return;
        const list: Thread[] = (data.items ?? [])
          .map((item) => item.thread)
          .filter((t): t is Thread => Boolean(t));
        setThreads(list);
      } catch (err) {
        if (!cancelled) {
          console.error("[comments-realtime] initial fetch failed", err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [status]);

  // Conexão Pusher + subscribe no canal privado.
  useEffect(() => {
    if (status !== "authenticated") return;

    const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
    if (!key || !cluster) {
      console.warn(
        "[comments-realtime] NEXT_PUBLIC_PUSHER_KEY/CLUSTER ausentes — real-time desabilitado.",
      );
      return;
    }

    const pusher = new PusherClient(key, {
      cluster,
      authEndpoint: "/api/pusher/auth",
      forceTLS: true,
    });

    pusher.connection.bind("connected", () => setConnected(true));
    pusher.connection.bind("disconnected", () => setConnected(false));
    pusher.connection.bind("unavailable", () => setConnected(false));
    pusher.connection.bind("failed", () => setConnected(false));

    const channel = pusher.subscribe(COMMENTS_CHANNEL);

    channel.bind(COMMENTS_EVENT_NAME, (event: CommentsEvent) => {
      if (!event || typeof event !== "object") return;
      switch (event.type) {
        case "thread.upserted":
          setThreads((prev) => mergeThread(prev, event.thread));
          break;
        case "thread.deleted":
          setThreads((prev) => prev.filter((t) => t.id !== event.threadId));
          break;
        case "thread.read":
          if (!userEmail || event.userEmail.toLowerCase() !== userEmail) return;
          setThreads((prev) =>
            prev.map((t) =>
              t.id === event.threadId
                ? { ...t, readAtForCurrentUser: event.readAt }
                : t,
            ),
          );
          break;
        case "thread.all-read":
          if (!userEmail || event.userEmail.toLowerCase() !== userEmail) return;
          setThreads((prev) =>
            prev.map((t) => ({ ...t, readAtForCurrentUser: event.readAt })),
          );
          break;
      }
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(COMMENTS_CHANNEL);
      pusher.disconnect();
    };
  }, [status, userEmail]);

  const applyLocal = useCallback((thread: Thread) => {
    setThreads((prev) => mergeThread(prev, thread));
  }, []);

  const removeLocal = useCallback((threadId: string) => {
    setThreads((prev) => prev.filter((t) => t.id !== threadId));
  }, []);

  const replaceLocal = useCallback((tempId: string, real: Thread) => {
    setThreads((prev) => {
      const without = prev.filter((t) => t.id !== tempId);
      return mergeThread(without, real);
    });
  }, []);

  const markReadLocal = useCallback((threadId: string, readAt: string) => {
    setThreads((prev) =>
      prev.map((t) =>
        t.id === threadId ? { ...t, readAtForCurrentUser: readAt } : t,
      ),
    );
  }, []);

  const markAllReadLocal = useCallback((readAt: string) => {
    setThreads((prev) =>
      prev.map((t) => ({ ...t, readAtForCurrentUser: readAt })),
    );
  }, []);

  const value = useMemo<CommentsRealtimeContextValue>(
    () => ({
      threads,
      connected,
      loading,
      applyLocal,
      removeLocal,
      replaceLocal,
      markReadLocal,
      markAllReadLocal,
    }),
    [
      threads,
      connected,
      loading,
      applyLocal,
      removeLocal,
      replaceLocal,
      markReadLocal,
      markAllReadLocal,
    ],
  );

  return (
    <CommentsRealtimeContext.Provider value={value}>
      {children}
    </CommentsRealtimeContext.Provider>
  );
}

export function useCommentsRealtime(): CommentsRealtimeContextValue {
  const ctx = useContext(CommentsRealtimeContext);
  if (!ctx) {
    throw new Error(
      "useCommentsRealtime precisa estar dentro de <CommentsRealtimeProvider>.",
    );
  }
  return ctx;
}
