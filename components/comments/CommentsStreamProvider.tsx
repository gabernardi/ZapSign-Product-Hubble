"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { CommentsStore } from "@/lib/data/comments";
import { emptyStore } from "@/lib/data/comments";

/**
 * Estado do stream SSE dos comentários. Uma única conexão por árvore React
 * distribui o snapshot atual do store pra todos os providers derivados
 * (inbox global + providers por página). Substitui o polling anterior.
 */
interface CommentsStreamContextValue {
  store: CommentsStore;
  revision: string;
  /** true se o EventSource está aberto e recebendo eventos. */
  connected: boolean;
  /** Timestamp do último evento recebido (snapshot ou change). 0 se nunca. */
  lastEventAt: number;
}

const CommentsStreamContext = createContext<CommentsStreamContextValue | null>(
  null,
);

interface StreamEvent {
  type: "snapshot" | "change";
  store: CommentsStore;
  revision: string;
}

const RECONNECT_INITIAL_MS = 1_000;
const RECONNECT_MAX_MS = 15_000;

export function CommentsStreamProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<CommentsStore>(() => emptyStore());
  const [revision, setRevision] = useState("");
  const [connected, setConnected] = useState(false);
  const [lastEventAt, setLastEventAt] = useState(0);

  const esRef = useRef<EventSource | null>(null);
  const reconnectDelayRef = useRef(RECONNECT_INITIAL_MS);
  const reconnectTimerRef = useRef<number | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    const connect = () => {
      if (!mountedRef.current) return;
      // Fecha conexão anterior, se houver, pra evitar duplicação em HMR.
      esRef.current?.close();
      const es = new EventSource("/api/comments/events", {
        withCredentials: true,
      });
      esRef.current = es;

      es.onopen = () => {
        if (!mountedRef.current) return;
        setConnected(true);
        reconnectDelayRef.current = RECONNECT_INITIAL_MS;
      };

      es.onmessage = (event) => {
        if (!mountedRef.current) return;
        try {
          const parsed = JSON.parse(event.data) as StreamEvent;
          if (!parsed || typeof parsed !== "object") return;
          if (parsed.type !== "snapshot" && parsed.type !== "change") return;
          setStore(parsed.store);
          setRevision(parsed.revision);
          setLastEventAt(Date.now());
        } catch (err) {
          console.warn("[comments-stream] bad event payload:", err);
        }
      };

      es.onerror = () => {
        if (!mountedRef.current) return;
        setConnected(false);
        es.close();
        // Backoff exponencial até o máximo.
        const delay = reconnectDelayRef.current;
        reconnectDelayRef.current = Math.min(
          RECONNECT_MAX_MS,
          delay * 2,
        );
        reconnectTimerRef.current = window.setTimeout(() => {
          connect();
        }, delay);
      };
    };

    connect();

    return () => {
      mountedRef.current = false;
      if (reconnectTimerRef.current !== null) {
        window.clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      esRef.current?.close();
      esRef.current = null;
    };
  }, []);

  const value = useMemo<CommentsStreamContextValue>(
    () => ({ store, revision, connected, lastEventAt }),
    [store, revision, connected, lastEventAt],
  );

  return (
    <CommentsStreamContext.Provider value={value}>
      {children}
    </CommentsStreamContext.Provider>
  );
}

export function useCommentsStream(): CommentsStreamContextValue {
  const ctx = useContext(CommentsStreamContext);
  if (!ctx) {
    throw new Error(
      "useCommentsStream deve ser usado dentro de <CommentsStreamProvider>.",
    );
  }
  return ctx;
}
