/**
 * Contratos de eventos trafegados pelo Pusher entre servidor e clientes.
 *
 * Canal único: `private-comments` (todos os usuários autenticados entram nele).
 * Os eventos carregam o dado completo necessário pro cliente aplicar o update
 * sem precisar refetch.
 */

import type { Thread } from "./types";

export const COMMENTS_CHANNEL = "private-comments";

export type CommentsEvent =
  | { type: "thread.upserted"; thread: Thread }
  | { type: "thread.deleted"; threadId: string; pageId: string }
  | { type: "thread.read"; threadId: string; userEmail: string; readAt: string }
  | { type: "thread.all-read"; userEmail: string; readAt: string };

/**
 * Nome do evento que usamos no Pusher. Mantemos um nome único e colocamos
 * o tipo dentro do payload — simplifica o bind no cliente (um único handler
 * faz switch por `type`).
 */
export const COMMENTS_EVENT_NAME = "update";
