import { promises as fs } from "node:fs";
import path from "node:path";
import { BlobNotFoundError, head, put } from "@vercel/blob";

/**
 * Storage JSON minimalista com duas estratégias:
 *
 * - **Produção (Vercel com `BLOB_READ_WRITE_TOKEN`):** lê e escreve em
 *   Vercel Blob (store público). O filesystem da função serverless é
 *   read-only, então o Blob é o único lugar mutável. As URLs dos blobs
 *   nunca são expostas ao cliente — todas as leituras passam pela SDK
 *   server-side com o Bearer token, o que força ida ao origin e evita
 *   servir dados stale do CDN.
 *
 * - **Desenvolvimento (sem token):** lê e escreve no arquivo local
 *   versionado em `lib/data/<filename>`. Mantém o fluxo antigo de
 *   "curadoria em dev + commit" sem fricção.
 *
 * **Seed:** no primeiro deploy que aponta pro Blob, ele está vazio.
 * Nesse caso o load usa o JSON commitado como seed. O primeiro `save`
 * promove o Blob a fonte da verdade.
 *
 * **Cache CDN:** usamos `head()` para descobrir a URL do blob + `fetch()`
 * com cache-buster (`?v=<uploadedAt>`) e `cache: "no-store"`, forçando
 * ida ao origin e ignorando stale do CDN. `cacheControlMaxAge: 60` no
 * `put` limita o pior caso de staleness caso algum cliente ignore as
 * diretivas acima.
 *
 * **Concorrência:** dois writes simultâneos fazem read-modify-write em
 * cima do store inteiro — o último vence. Aceitável pro volume interno;
 * se virar problema, migrar pra granularidade por chave ou pra um banco
 * relacional.
 */

const CACHE_TTL_SECONDS = 60;

function blobEnabled(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function localPath(filename: string): string {
  return path.join(process.cwd(), "lib/data", filename);
}

async function readLocal<T>(filename: string): Promise<T | null> {
  try {
    const raw = await fs.readFile(localPath(filename), "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function writeLocal<T>(filename: string, value: T): Promise<void> {
  await fs.writeFile(
    localPath(filename),
    JSON.stringify(value, null, 2) + "\n",
    "utf8",
  );
}

export async function loadJsonBlob<T>(
  filename: string,
  emptyValue: T,
): Promise<T> {
  const enabled = blobEnabled();
  console.info(`[json-blob-store] load start filename=${filename} blob=${enabled}`);
  if (enabled) {
    try {
      const meta = await head(filename);
      const cacheBuster = meta.uploadedAt
        ? new Date(meta.uploadedAt).getTime().toString()
        : Date.now().toString();
      const separator = meta.url.includes("?") ? "&" : "?";
      const res = await fetch(`${meta.url}${separator}v=${cacheBuster}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const text = await res.text();
        console.info(
          `[json-blob-store] load ok filename=${filename} bytes=${text.length}`,
        );
        return JSON.parse(text) as T;
      }
      console.warn(
        `[json-blob-store] fetch failed filename=${filename} status=${res.status} ${res.statusText}`,
      );
    } catch (err) {
      // Blob ainda não existe (primeiro deploy) ou leitura falhou: cai pro
      // seed local + emptyValue. Erros reais ficam visíveis no log sem
      // quebrar o prerender/runtime.
      if (err instanceof BlobNotFoundError) {
        console.info(
          `[json-blob-store] blob not found filename=${filename} (using seed)`,
        );
      } else {
        console.warn(
          `[json-blob-store] read failed filename=${filename}:`,
          err,
        );
      }
    }
    const seed = await readLocal<T>(filename);
    console.info(
      `[json-blob-store] load fallback filename=${filename} seed=${Boolean(seed)}`,
    );
    return seed ?? emptyValue;
  }

  const local = await readLocal<T>(filename);
  return local ?? emptyValue;
}

export async function saveJsonBlob<T>(
  filename: string,
  value: T,
): Promise<void> {
  const enabled = blobEnabled();
  console.info(
    `[json-blob-store] save start filename=${filename} blob=${enabled}`,
  );
  if (enabled) {
    const body = JSON.stringify(value, null, 2) + "\n";
    const result = await put(filename, body, {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
      cacheControlMaxAge: CACHE_TTL_SECONDS,
    });
    console.info(
      `[json-blob-store] save ok filename=${filename} bytes=${body.length} pathname=${result.pathname} url=${result.url}`,
    );
    return;
  }
  await writeLocal(filename, value);
  console.info(
    `[json-blob-store] save local filename=${filename} (dev mode, not persistent on Vercel)`,
  );
}
