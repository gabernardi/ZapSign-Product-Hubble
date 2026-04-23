import "server-only";

import Pusher from "pusher";
import {
  COMMENTS_CHANNEL,
  COMMENTS_EVENT_NAME,
  type CommentsEvent,
} from "./events";

/**
 * Client do Pusher server-side (broadcasting).
 *
 * Mantido como singleton pra reusar conexão HTTP entre invocations. Se as
 * envs estiverem faltando (dev local sem Pusher configurado), devolvemos
 * um stub que apenas loga — a UI continua funcionando, só sem real-time.
 */

interface PusherLike {
  trigger: (
    channel: string,
    event: string,
    data: unknown,
  ) => Promise<unknown>;
  authorizeChannel?: (
    socketId: string,
    channel: string,
    data?: { user_id: string; user_info?: Record<string, unknown> },
  ) => { auth: string; channel_data?: string };
}

let cached: PusherLike | null = null;

function pusher(): PusherLike {
  if (cached) return cached;

  const {
    PUSHER_APP_ID,
    PUSHER_KEY,
    PUSHER_SECRET,
    PUSHER_CLUSTER,
  } = process.env;

  if (!PUSHER_APP_ID || !PUSHER_KEY || !PUSHER_SECRET || !PUSHER_CLUSTER) {
    console.warn(
      "[pusher-server] envs ausentes — broadcast desabilitado. " +
        "Configure PUSHER_APP_ID, PUSHER_KEY, PUSHER_SECRET, PUSHER_CLUSTER.",
    );
    cached = {
      async trigger() {
        return undefined;
      },
    };
    return cached;
  }

  const instance = new Pusher({
    appId: PUSHER_APP_ID,
    key: PUSHER_KEY,
    secret: PUSHER_SECRET,
    cluster: PUSHER_CLUSTER,
    useTLS: true,
  });
  cached = instance as unknown as PusherLike;
  return cached;
}

/**
 * Publica um evento no canal de comentários. Nunca lança — falha de
 * Pusher não pode derrubar uma mutation que já persistiu no banco.
 */
export async function publishCommentsEvent(event: CommentsEvent): Promise<void> {
  try {
    await pusher().trigger(COMMENTS_CHANNEL, COMMENTS_EVENT_NAME, event);
  } catch (err) {
    console.error("[pusher-server] falha ao publicar evento", event.type, err);
  }
}

/**
 * Assina (authorize) a entrada de um cliente em um canal privado. Usado no
 * endpoint `/api/pusher/auth`. Retorna null se o Pusher não estiver
 * configurado.
 */
export function authorizePrivateChannel(
  socketId: string,
  channel: string,
  userId: string,
  userInfo?: Record<string, unknown>,
): { auth: string; channel_data?: string } | null {
  const instance = pusher();
  if (!instance.authorizeChannel) return null;
  return instance.authorizeChannel(socketId, channel, {
    user_id: userId,
    user_info: userInfo,
  });
}
