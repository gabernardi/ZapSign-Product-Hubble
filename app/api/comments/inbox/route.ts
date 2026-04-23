import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getInboxItems, getInboxSummary } from "@/lib/data/comments";
import { loadCommentsStore } from "@/lib/data/comments-store";

const ALLOWED_DOMAINS = ["zapsign.com.br", "truora.com"] as const;

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

  const store = await loadCommentsStore();
  return NextResponse.json(
    {
      items: getInboxItems(store, email),
      summary: getInboxSummary(store, email),
    },
    { headers: { "cache-control": "no-store" } },
  );
}
