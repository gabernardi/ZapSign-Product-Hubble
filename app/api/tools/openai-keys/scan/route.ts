import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { listProjectsWithKeys } from "@/lib/tools/openai-keys";

const ALLOWED_DOMAINS = ["zapsign.com.br", "truora.com"] as const;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function ensureAuthorized(): Promise<NextResponse | null> {
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
  return null;
}

export async function POST() {
  const unauthorized = await ensureAuthorized();
  if (unauthorized) return unauthorized;

  const result = await listProjectsWithKeys();
  return NextResponse.json(result);
}
