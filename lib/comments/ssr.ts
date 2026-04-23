import "server-only";

import { auth } from "@/lib/auth";
import { getThreadsForPage } from "./db";
import type { Thread } from "./types";

/**
 * Helper para carregar threads de uma página no server component.
 * Já puxa o email do usuário da sessão pra popular `readAtForCurrentUser`.
 *
 * Se o banco falhar (ex: `DATABASE_URL` ausente em build/preview), devolve
 * lista vazia ao invés de quebrar o build. O client-side depois pega o
 * estado correto via Pusher + fetch.
 */
export async function loadPageCommentsForSsr(pageId: string): Promise<Thread[]> {
  const session = await auth();
  const email = session?.user?.email ?? undefined;
  try {
    return await getThreadsForPage(pageId, email);
  } catch (err) {
    // Relança o sinal de dynamic rendering pro Next marcar a rota corretamente;
    // só engole erros reais de infra (ex: DATABASE_URL ausente no build).
    if (
      err instanceof Error &&
      typeof (err as { digest?: string }).digest === "string" &&
      (err as { digest?: string }).digest!.startsWith("DYNAMIC_SERVER_USAGE")
    ) {
      throw err;
    }
    console.warn("[comments/ssr] falha ao carregar threads", pageId, err);
    return [];
  }
}
