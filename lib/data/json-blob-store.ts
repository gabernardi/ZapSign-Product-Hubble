import { promises as fs } from "node:fs";
import path from "node:path";
import { put } from "@vercel/blob";

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
 * **Cache CDN:** não usamos `head()` porque a metadata também pode vir
 * stale do CDN logo após um `put`. Em vez disso, construímos a URL
 * pública diretamente a partir do `storeId` embutido no
 * `BLOB_READ_WRITE_TOKEN` e buscamos com `?v=<Date.now()>` +
 * `cache: "no-store"` + `cache-control: no-cache`, o que força sempre
 * ida ao origin. `cacheControlMaxAge: 0` no `put` garante que o CDN
 * não sirva a resposta passada por mais do que uma request.
 *
 * **Concorrência:** dois writes simultâneos fazem read-modify-write em
 * cima do store inteiro — o último vence. Aceitável pro volume interno;
 * se virar problema, migrar pra granularidade por chave ou pra um banco
 * relacional.
 */

const CACHE_TTL_SECONDS = 0;

function blobEnabled(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function blobPublicUrl(pathname: string): string | null {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return null;
  // Formato esperado: vercel_blob_rw_<storeId>_<secret>
  const match = token.match(/^vercel_blob_rw_([A-Za-z0-9]+)_/);
  if (!match) return null;
  return `https://${match[1]}.public.blob.vercel-storage.com/${pathname}`;
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
  const url = blobPublicUrl(filename);
  console.info(
    `[json-blob-store] load start filename=${filename} blob=${enabled} url=${Boolean(url)}`,
  );
  if (enabled && url) {
    try {
      const bustUrl = `${url}?v=${Date.now()}`;
      const res = await fetch(bustUrl, {
        cache: "no-store",
        headers: { "cache-control": "no-cache" },
      });
      if (res.ok) {
        const text = await res.text();
        console.info(
          `[json-blob-store] load ok filename=${filename} bytes=${text.length}`,
        );
        return JSON.parse(text) as T;
      }
      if (res.status === 404) {
        console.info(
          `[json-blob-store] blob not found filename=${filename} (using seed)`,
        );
      } else {
        console.warn(
          `[json-blob-store] fetch failed filename=${filename} status=${res.status} ${res.statusText}`,
        );
      }
    } catch (err) {
      console.warn(
        `[json-blob-store] read failed filename=${filename}:`,
        err,
      );
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
