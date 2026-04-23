import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getAllThreads,
  toInboxItems,
  toInboxSummary,
} from "@/lib/comments/db";

const ALLOWED_DOMAINS = ["zapsign.com.br", "truora.com"] as const;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

  const threads = await getAllThreads(email);
  const items = toInboxItems(threads);
  const summary = toInboxSummary(items);
  return NextResponse.json(
    { items, summary },
    { headers: { "cache-control": "no-store" } },
  );
}
