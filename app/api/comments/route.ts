import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { getPageThreads } from "@/lib/data/comments";
import { loadCommentsStore } from "@/lib/data/comments-store";

const ALLOWED_DOMAINS = ["zapsign.com.br", "truora.com"] as const;

export async function GET(request: NextRequest) {
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

  const pageId = request.nextUrl.searchParams.get("pageId");
  if (!pageId || !pageId.startsWith("/") || pageId.length > 200) {
    return NextResponse.json({ error: "invalid_pageId" }, { status: 400 });
  }

  const store = await loadCommentsStore();
  const threads = getPageThreads(store, pageId);
  return NextResponse.json(
    { threads },
    { headers: { "cache-control": "no-store" } },
  );
}
