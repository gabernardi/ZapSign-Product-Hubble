import { auth } from "@/lib/auth";
import {
  getCurrentSnapshot,
  subscribe,
  type CommentsStreamEvent,
} from "@/lib/comments/events-bus";

// SSE precisa do runtime Node pra manter a conexão aberta; edge/static não
// suportam streams longos.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Tempo máximo de uma conexão SSE antes do Vercel desligar. O client reconecta
// automaticamente via EventSource, então vale manter alto sem preocupação.
export const maxDuration = 300;

const ALLOWED_DOMAINS = ["zapsign.com.br", "truora.com"] as const;
const HEARTBEAT_MS = 15_000;

function sseHeaders(): HeadersInit {
  return {
    "content-type": "text/event-stream; charset=utf-8",
    "cache-control": "no-store, no-transform",
    connection: "keep-alive",
    // Impede buffering em proxies (nginx, cloudflare).
    "x-accel-buffering": "no",
  };
}

export async function GET(request: Request) {
  const session = await auth();
  const email = session?.user?.email ?? null;
  const domain = email?.split("@")[1]?.toLowerCase();
  if (
    !email ||
    !domain ||
    !(ALLOWED_DOMAINS as readonly string[]).includes(domain)
  ) {
    return new Response("unauthorized", { status: 401 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let closed = false;
      const send = (event: CommentsStreamEvent) => {
        if (closed) return;
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(event)}\n\n`),
          );
        } catch {
          // Stream já fechado — ignora.
        }
      };

      // Snapshot inicial — o client já consegue renderizar sem esperar o
      // primeiro tick do poller.
      try {
        send(await getCurrentSnapshot());
      } catch (err) {
        console.warn("[comments-events] initial snapshot failed:", err);
      }

      const unsubscribe = subscribe(send);

      // Heartbeat: comentário SSE vazio mantém a conexão viva atravessando
      // proxies e impede o browser de marcar como timeout.
      const heartbeat = setInterval(() => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(`: ping ${Date.now()}\n\n`));
        } catch {
          // ignora
        }
      }, HEARTBEAT_MS);

      const cleanup = () => {
        if (closed) return;
        closed = true;
        clearInterval(heartbeat);
        unsubscribe();
        try {
          controller.close();
        } catch {
          // ignora
        }
      };

      request.signal.addEventListener("abort", cleanup);
    },
  });

  return new Response(stream, { headers: sseHeaders() });
}
