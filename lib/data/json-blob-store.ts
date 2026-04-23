import { promises as fs } from "node:fs";
import path from "node:path";
import { BlobNotFoundError, get, put } from "@vercel/blob";

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
 * **Cache CDN:** usamos `get()` da SDK com `useCache: false` — ela
 * adiciona `?cache=0` na URL e envia `Authorization: Bearer`, o que
 * bypassa o cache do CDN em cada leitura. `cacheControlMaxAge: 60`
 * limita o pior caso de staleness caso algum cliente ignore as
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
  if (blobEnabled()) {
    try {
      const result = await get(filename, {
        access: "public",
        useCache: false,
      });
      if (result && result.statusCode === 200 && result.stream) {
        const text = await new Response(result.stream).text();
        return JSON.parse(text) as T;
      }
      // result === null não é esperado quando não usamos ifNoneMatch e
      // o blob existe — trata como "vazio, usa seed".
    } catch (err) {
      if (!(err instanceof BlobNotFoundError)) {
        throw err;
      }
    }
    const seed = await readLocal<T>(filename);
    return seed ?? emptyValue;
  }

  const local = await readLocal<T>(filename);
  return local ?? emptyValue;
}

export async function saveJsonBlob<T>(
  filename: string,
  value: T,
): Promise<void> {
  if (blobEnabled()) {
    await put(filename, JSON.stringify(value, null, 2) + "\n", {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
      cacheControlMaxAge: CACHE_TTL_SECONDS,
    });
    return;
  }
  await writeLocal(filename, value);
}
