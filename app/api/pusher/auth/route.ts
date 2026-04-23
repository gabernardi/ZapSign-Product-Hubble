import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { authorizePrivateChannel } from "@/lib/comments/pusher-server";
import { COMMENTS_CHANNEL } from "@/lib/comments/events";

const ALLOWED_DOMAINS = ["zapsign.com.br", "truora.com"] as const;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Endpoint de autenticação de private channels do Pusher.
 *
 * O client faz POST com `socket_id` e `channel_name` vindos da lib
 * `pusher-js`. Validamos sessão + domínio do e-mail; se OK, assinamos o
 * token com o secret do Pusher via `pusher.authorizeChannel`.
 */
export async function POST(request: Request) {
  const session = await auth();
  const email = session?.user?.email ?? null;
  const domain = email?.split("@")[1]?.toLowerCase();
  if (
    !email ||
    !domain ||
    !(ALLOWED_DOMAINS as readonly string[]).includes(domain)
  ) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.formData();
  const socketId = body.get("socket_id");
  const channel = body.get("channel_name");

  if (
    typeof socketId !== "string" ||
    typeof channel !== "string" ||
    channel !== COMMENTS_CHANNEL
  ) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const authResponse = authorizePrivateChannel(socketId, channel, email, {
    email,
    name: session?.user?.name ?? undefined,
  });
  if (!authResponse) {
    return NextResponse.json(
      { error: "pusher_not_configured" },
      { status: 503 },
    );
  }
  return NextResponse.json(authResponse);
}
