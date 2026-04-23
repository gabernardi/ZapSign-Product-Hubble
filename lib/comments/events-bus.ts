import { EventEmitter } from "node:events";
import { loadCommentsStore } from "@/lib/data/comments-store";
import type { CommentsStore } from "@/lib/data/comments";

/**
 * Bus in-memory para eventos de comentários + poller de failsafe.
 *
 * Arquitetura:
 * - Dentro da mesma instância Node, ações publicam diretamente via
 *   `publishStoreSnapshot` (latência zero pros clientes conectados ali).
 * - Como Vercel roda múltiplas instâncias independentes, um ciclo de
 *   poller (2s) detecta mudanças feitas em outras instâncias relendo o
 *   Blob — garante propagação entre instâncias sem precisar de pub/sub
 *   externo (Redis/Upstash).
 *
 * O bus é armazenado em `globalThis` pra sobreviver a HMR do Next dev.
 */

export type CommentsStreamEvent =
  | { type: "snapshot"; store: CommentsStore; revision: string }
  | { type: "change"; store: CommentsStore; revision: string };

type Listener = (event: CommentsStreamEvent) => void;

const POLL_INTERVAL_MS = 2_000;
const MAX_LISTENERS = 1_000;

interface BusState {
  emitter: EventEmitter;
  lastRevision: string;
  lastStore: CommentsStore | null;
  pollerStarted: boolean;
}

declare global {
  var __commentsBusState: BusState | undefined;
}

function getState(): BusState {
  if (!globalThis.__commentsBusState) {
    const emitter = new EventEmitter();
    emitter.setMaxListeners(MAX_LISTENERS);
    globalThis.__commentsBusState = {
      emitter,
      lastRevision: "",
      lastStore: null,
      pollerStarted: false,
    };
  }
  return globalThis.__commentsBusState;
}

function hashStore(store: CommentsStore): string {
  // Hash barato — tamanho + timestamp mais recente. Suficiente pra detectar
  // qualquer mutação relevante sem serializar/comparar o store inteiro.
  let totalThreads = 0;
  let totalComments = 0;
  let latest = 0;
  for (const page of Object.values(store.pages)) {
    for (const thread of page.threads) {
      totalThreads += 1;
      totalComments += thread.comments.length;
      const ts = new Date(thread.lastActivityAt).getTime();
      if (ts > latest) latest = ts;
    }
  }
  return `${totalThreads}:${totalComments}:${latest}`;
}

function ensurePoller(): void {
  const state = getState();
  if (state.pollerStarted) return;
  state.pollerStarted = true;

  const tick = async () => {
    try {
      const store = await loadCommentsStore();
      const revision = hashStore(store);
      if (revision !== state.lastRevision) {
        state.lastStore = store;
        state.lastRevision = revision;
        state.emitter.emit("store", {
          type: "change",
          store,
          revision,
        } satisfies CommentsStreamEvent);
      }
    } catch (err) {
      console.warn("[comments-bus] poll failed:", err);
    }
  };

  // Primeiro tick imediato pra seed inicial, depois intervalo fixo.
  void tick();
  setInterval(() => {
    void tick();
  }, POLL_INTERVAL_MS).unref?.();
}

export async function getCurrentSnapshot(): Promise<CommentsStreamEvent> {
  ensurePoller();
  const state = getState();
  if (state.lastStore && state.lastRevision) {
    return {
      type: "snapshot",
      store: state.lastStore,
      revision: state.lastRevision,
    };
  }
  const store = await loadCommentsStore();
  const revision = hashStore(store);
  state.lastStore = store;
  state.lastRevision = revision;
  return { type: "snapshot", store, revision };
}

/**
 * Publica um novo snapshot do store. Chamado pelas server actions logo
 * depois de salvar — garante latência zero pros clientes conectados à
 * mesma instância Node. Outras instâncias vão pegar via poller.
 */
export function publishStoreSnapshot(store: CommentsStore): void {
  ensurePoller();
  const state = getState();
  const revision = hashStore(store);
  if (revision === state.lastRevision) return;
  state.lastStore = store;
  state.lastRevision = revision;
  state.emitter.emit("store", {
    type: "change",
    store,
    revision,
  } satisfies CommentsStreamEvent);
}

export function subscribe(listener: Listener): () => void {
  ensurePoller();
  const state = getState();
  state.emitter.on("store", listener);
  return () => {
    state.emitter.off("store", listener);
  };
}
