import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { checkSmsDevBalance } from "@/lib/tools/smsdev";

const ALLOWED_DOMAINS = ["zapsign.com.br", "truora.com"] as const;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

export async function POST(req: Request) {
  const unauthorized = await ensureAuthorized();
  if (unauthorized) return unauthorized;

  let body: { threshold?: number } = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const result = await checkSmsDevBalance({ threshold: body.threshold });
  return NextResponse.json(result);
}
