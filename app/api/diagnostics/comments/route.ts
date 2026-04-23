import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { neon } from "@neondatabase/serverless";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_DOMAINS = ["zapsign.com.br", "truora.com"] as const;

/**
 * Endpoint de diagnóstico: reporta se as envs necessárias pro subsistema
 * de comentários estão configuradas e se a conexão com Neon está ok.
 * Não expõe secrets — só booleans e erros sanitizados.
 */
export async function GET() {
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

  const envCheck = {
    DATABASE_URL: Boolean(process.env.DATABASE_URL),
    PUSHER_APP_ID: Boolean(process.env.PUSHER_APP_ID),
    PUSHER_KEY: Boolean(process.env.PUSHER_KEY),
    PUSHER_SECRET: Boolean(process.env.PUSHER_SECRET),
    PUSHER_CLUSTER: process.env.PUSHER_CLUSTER ?? null,
    NEXT_PUBLIC_PUSHER_KEY: Boolean(process.env.NEXT_PUBLIC_PUSHER_KEY),
    NEXT_PUBLIC_PUSHER_CLUSTER: process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? null,
  };

  let db: { connected: boolean; error?: string; counts?: Record<string, number> } = {
    connected: false,
  };
  if (process.env.DATABASE_URL) {
    try {
      const sql = neon(process.env.DATABASE_URL);
      const [threadRow] = (await sql.query(
        `SELECT COUNT(*)::int AS count FROM threads`,
      )) as { count: number }[];
      const [commentRow] = (await sql.query(
        `SELECT COUNT(*)::int AS count FROM comments`,
      )) as { count: number }[];
      db = {
        connected: true,
        counts: {
          threads: threadRow?.count ?? 0,
          comments: commentRow?.count ?? 0,
        },
      };
    } catch (err) {
      db = {
        connected: false,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  return NextResponse.json({ env: envCheck, db, viewer: email });
}
