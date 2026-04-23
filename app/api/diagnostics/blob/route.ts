import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { del, head, put } from "@vercel/blob";

/**
 * Endpoint de diagnóstico TEMPORÁRIO.
 * Testa o roundtrip do Vercel Blob (put → head → fetch → del) e reporta o
 * que aconteceu. Remover depois que a persistência for confirmada em prod.
 */

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

  const report: Record<string, unknown> = {
    tokenPresent: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
    tokenLength: process.env.BLOB_READ_WRITE_TOKEN?.length ?? 0,
    vercelEnv: process.env.VERCEL_ENV ?? null,
    nodeVersion: process.version,
  };

  const filename = `_diagnostics_${Date.now()}.json`;
  const payload = { hello: "world", at: new Date().toISOString() };

  try {
    const putResult = await put(filename, JSON.stringify(payload), {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
      cacheControlMaxAge: 60,
    });
    report.putOk = true;
    report.putPathname = putResult.pathname;

    const meta = await head(filename);
    const url = `${meta.url}?_t=${Date.now()}`;
    const res = await fetch(url, { cache: "no-store" });
    if (res.ok) {
      report.getOk = true;
      report.getBody = await res.text();
    } else {
      report.getOk = false;
      report.getStatus = res.status;
    }

    await del(filename);
    report.delOk = true;
  } catch (err) {
    report.errorName = err instanceof Error ? err.name : "unknown";
    report.errorMessage = err instanceof Error ? err.message : String(err);
  }

  return NextResponse.json(report, {
    headers: { "cache-control": "no-store" },
  });
}
