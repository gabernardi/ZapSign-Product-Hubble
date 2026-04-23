"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import {
  addComment as addCommentHelper,
  addThread as addThreadHelper,
  deleteComment as deleteCommentHelper,
  getThreadById,
  markAllThreadsRead as markAllThreadsReadHelper,
  markThreadRead as markThreadReadHelper,
  setThreadStatus as setThreadStatusHelper,
  toggleReaction as toggleReactionHelper,
  type Author,
  type CommentAnchor,
  type Thread,
  type ThreadStatus,
} from "@/lib/data/comments";
import {
  loadCommentsStore,
  saveCommentsStore,
} from "@/lib/data/comments-store";
import {
  notifyCommentThreadParticipants,
  notifyNewCommentThread,
} from "@/lib/email/comment-notifications";

const ALLOWED_DOMAINS = ["zapsign.com.br", "truora.com"] as const;

async function requireAuthor(): Promise<Author> {
  const session = await auth();
  const email = session?.user?.email ?? null;
  const domain = email?.split("@")[1]?.toLowerCase();
  if (!email || !domain || !(ALLOWED_DOMAINS as readonly string[]).includes(domain)) {
    throw new Error("Não autorizado.");
  }
  return {
    email,
    name: session?.user?.name ?? undefined,
    image: session?.user?.image ?? undefined,
  };
}

function assertValidPageId(pageId: string): void {
  // Somente caminhos absolutos simples do dashboard são aceitos.
  if (!pageId.startsWith("/") || pageId.length > 200) {
    throw new Error("pageId inválido.");
  }
}

function assertValidBody(body: string): string {
  const trimmed = body.trim();
  if (!trimmed) throw new Error("Comentário vazio.");
  if (trimmed.length > 4000) throw new Error("Comentário muito longo.");
  return trimmed;
}

export async function createThread(
  pageId: string,
  anchor: CommentAnchor,
  body: string,
): Promise<Thread> {
  assertValidPageId(pageId);
  const author = await requireAuthor();
  const trimmed = assertValidBody(body);

  if (
    !anchor ||
    typeof anchor.blockId !== "string" ||
    typeof anchor.startOffset !== "number" ||
    typeof anchor.endOffset !== "number" ||
    typeof anchor.quote !== "string" ||
    anchor.endOffset <= anchor.startOffset ||
    !anchor.quote.trim()
  ) {
    throw new Error("Âncora inválida.");
  }

  const store = await loadCommentsStore();
  const thread = addThreadHelper(store, pageId, anchor, trimmed, author);
  await saveCommentsStore(store);
  revalidatePath(pageId);
  void notifyNewCommentThread({ pageId, thread, actor: author });
  return thread;
}

export async function addComment(
  pageId: string,
  threadId: string,
  body: string,
): Promise<void> {
  assertValidPageId(pageId);
  const author = await requireAuthor();
  const trimmed = assertValidBody(body);

  const store = await loadCommentsStore();
  const comment = addCommentHelper(store, pageId, threadId, trimmed, author);
  if (!comment) throw new Error("Thread não encontrada.");
  const thread = getThreadById(store, pageId, threadId);
  if (!thread) throw new Error("Thread não encontrada.");
  await saveCommentsStore(store);
  revalidatePath(pageId);
  void notifyCommentThreadParticipants({
    pageId,
    thread,
    actor: author,
    commentBody: comment.body,
  });
}

export async function toggleReaction(
  pageId: string,
  threadId: string,
  commentId: string,
  emoji: string,
): Promise<void> {
  assertValidPageId(pageId);
  const author = await requireAuthor();
  if (typeof emoji !== "string" || emoji.length === 0 || emoji.length > 8) {
    throw new Error("Emoji inválido.");
  }

  const store = await loadCommentsStore();
  const ok = toggleReactionHelper(
    store,
    pageId,
    threadId,
    commentId,
    emoji,
    author.email,
  );
  if (!ok) throw new Error("Comentário não encontrado.");
  await saveCommentsStore(store);
  revalidatePath(pageId);
}

export async function setThreadStatus(
  pageId: string,
  threadId: string,
  status: ThreadStatus,
): Promise<void> {
  assertValidPageId(pageId);
  await requireAuthor();
  if (status !== "open" && status !== "resolved") {
    throw new Error("Status inválido.");
  }
  const store = await loadCommentsStore();
  const ok = setThreadStatusHelper(store, pageId, threadId, status);
  if (!ok) throw new Error("Thread não encontrada.");
  await saveCommentsStore(store);
  revalidatePath(pageId);
}

export async function deleteComment(
  pageId: string,
  threadId: string,
  commentId: string,
): Promise<{ threadRemoved: boolean }> {
  assertValidPageId(pageId);
  const author = await requireAuthor();
  const store = await loadCommentsStore();
  const result = deleteCommentHelper(
    store,
    pageId,
    threadId,
    commentId,
    author.email,
  );
  if (!result.ok) {
    throw new Error("Não foi possível remover o comentário.");
  }
  await saveCommentsStore(store);
  revalidatePath(pageId);
  return { threadRemoved: result.threadRemoved };
}

export async function markThreadRead(
  pageId: string,
  threadId: string,
): Promise<void> {
  assertValidPageId(pageId);
  const author = await requireAuthor();
  const store = await loadCommentsStore();
  const ok = markThreadReadHelper(store, pageId, threadId, author.email);
  if (!ok) throw new Error("Thread não encontrada.");
  await saveCommentsStore(store);
}

export async function markAllThreadsRead(): Promise<{ updated: number }> {
  const author = await requireAuthor();
  const store = await loadCommentsStore();
  const updated = markAllThreadsReadHelper(store, author.email);
  await saveCommentsStore(store);
  return { updated };
}
