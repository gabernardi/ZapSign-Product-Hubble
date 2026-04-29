import { createHash } from "node:crypto";
import { loadJsonBlob, saveJsonBlob } from "@/lib/data/json-blob-store";
import {
  cacheKey,
  TRANSLATIONS_BLOB_FILENAME,
  type Locale,
  type TranslationsCache,
} from "./types";

/**
 * Cache de traduções persistido em Vercel Blob (prod) ou arquivo local
 * (dev), com uma camada in-memory para evitar reler o blob inteiro a cada
 * request. Mutações são aplicadas no memo + escritas serializadas no
 * blob.
 *
 * O blob é um objeto plano `{ "<locale>:<hash>": "texto traduzido" }`.
 * Hash é sha1(source).slice(0, 16) — colisão astronomicamente improvável
 * pro volume interno e mantém o arquivo enxuto.
 */

const MEMO_TTL_MS = 60_000;

let memo: TranslationsCache | null = null;
let memoLoadedAt = 0;
let inflightLoad: Promise<TranslationsCache> | null = null;
let writeChain: Promise<void> = Promise.resolve();

export function hashSource(text: string): string {
  return createHash("sha1").update(text).digest("hex").slice(0, 16);
}

async function loadFresh(): Promise<TranslationsCache> {
  const data = await loadJsonBlob<TranslationsCache>(
    TRANSLATIONS_BLOB_FILENAME,
    {},
  );
  memo = { ...data };
  memoLoadedAt = Date.now();
  return memo;
}

async function ensureLoaded(): Promise<TranslationsCache> {
  if (memo && Date.now() - memoLoadedAt < MEMO_TTL_MS) return memo;
  if (inflightLoad) return inflightLoad;
  inflightLoad = loadFresh().finally(() => {
    inflightLoad = null;
  });
  return inflightLoad;
}

export async function lookupBatch(
  locale: Locale,
  texts: string[],
): Promise<{ hits: Record<string, string>; misses: string[] }> {
  const cache = await ensureLoaded();
  const hits: Record<string, string> = {};
  const misses: string[] = [];
  const seen = new Set<string>();
  for (const text of texts) {
    if (seen.has(text)) continue;
    seen.add(text);
    const key = cacheKey(locale, hashSource(text));
    const cached = cache[key];
    if (typeof cached === "string") {
      hits[text] = cached;
    } else {
      misses.push(text);
    }
  }
  return { hits, misses };
}

/**
 * Adiciona traduções ao cache e persiste. Escritas são serializadas com
 * uma chain pra evitar dois saves concorrentes pisando um no outro
 * (read-modify-write em cima do JSON inteiro).
 */
export async function putBatch(
  locale: Locale,
  entries: Record<string, string>,
): Promise<void> {
  const sources = Object.keys(entries);
  if (sources.length === 0) return;

  const next = writeChain.then(async () => {
    const cache = await ensureLoaded();
    let changed = false;
    for (const source of sources) {
      const translated = entries[source];
      if (typeof translated !== "string" || !translated) continue;
      const key = cacheKey(locale, hashSource(source));
      if (cache[key] !== translated) {
        cache[key] = translated;
        changed = true;
      }
    }
    if (!changed) return;
    await saveJsonBlob<TranslationsCache>(TRANSLATIONS_BLOB_FILENAME, cache);
    memoLoadedAt = Date.now();
  });

  writeChain = next.catch((err) => {
    console.error("[i18n] putBatch failed:", err);
  });

  await next;
}
