import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { translateBatch } from "@/lib/i18n/openai-translate";
import { lookupBatch, putBatch } from "@/lib/i18n/translation-cache";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n/types";

const MAX_TEXTS_PER_REQUEST = 200;
const MAX_TEXT_LENGTH = 2_000;

interface TranslateRequestBody {
  locale?: unknown;
  texts?: unknown;
  context?: unknown;
}

function sanitizeTexts(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  const out: string[] = [];
  const seen = new Set<string>();
  for (const item of input) {
    if (typeof item !== "string") continue;
    if (item.length === 0 || item.length > MAX_TEXT_LENGTH) continue;
    if (seen.has(item)) continue;
    seen.add(item);
    out.push(item);
    if (out.length >= MAX_TEXTS_PER_REQUEST) break;
  }
  return out;
}

export async function POST(request: Request) {
  let body: TranslateRequestBody;
  try {
    body = (await request.json()) as TranslateRequestBody;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const locale: Locale = isLocale(body.locale) ? body.locale : DEFAULT_LOCALE;
  const texts = sanitizeTexts(body.texts);

  if (locale === DEFAULT_LOCALE || texts.length === 0) {
    const passthrough: Record<string, string> = {};
    for (const t of texts) passthrough[t] = t;
    return NextResponse.json(
      { translations: passthrough },
      { headers: { "cache-control": "no-store" } },
    );
  }

  // Tela de login (ainda sem sessão) precisa traduzir; demais usos
  // exigem sessão válida pra evitar abuso do endpoint.
  const isLoginContext = body.context === "login";
  if (!isLoginContext) {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const { hits, misses } = await lookupBatch(locale, texts);

  let aiTranslations = new Map<string, string>();
  if (misses.length > 0) {
    aiTranslations = await translateBatch(locale, misses);
    const toPersist: Record<string, string> = {};
    for (const [source, translated] of aiTranslations) {
      if (translated && translated !== source) {
        toPersist[source] = translated;
      } else if (translated === source) {
        toPersist[source] = source;
      }
    }
    if (Object.keys(toPersist).length > 0) {
      try {
        await putBatch(locale, toPersist);
      } catch (err) {
        console.error("[i18n] persist cache failed:", err);
      }
    }
  }

  const translations: Record<string, string> = { ...hits };
  for (const text of misses) {
    translations[text] = aiTranslations.get(text) ?? text;
  }

  return NextResponse.json(
    { translations },
    { headers: { "cache-control": "no-store" } },
  );
}
