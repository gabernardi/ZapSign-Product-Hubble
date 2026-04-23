"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import type { Author, CommentAnchor, Thread, ThreadStatus } from "@/lib/comments/types";
import {
  addCommentToThread,
  createThread as createThreadDb,
  deleteComment as deleteCommentDb,
  markAllThreadsRead as markAllThreadsReadDb,
  markThreadRead as markThreadReadDb,
  setThreadStatus as setThreadStatusDb,
  toggleReaction as toggleReactionDb,
} from "@/lib/comments/db";
import { publishCommentsEvent } from "@/lib/comments/pusher-server";
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

  const thread = await createThreadDb({
    pageId,
    anchor,
    author,
    body: trimmed,
  });
  await publishCommentsEvent({ type: "thread.upserted", thread });
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

  const thread = await addCommentToThread({
    threadId,
    body: trimmed,
    author,
  });
  await publishCommentsEvent({ type: "thread.upserted", thread });
  revalidatePath(pageId);
  const latest = thread.comments[thread.comments.length - 1];
  if (latest) {
    void notifyCommentThreadParticipants({
      pageId,
      thread,
      actor: author,
      commentBody: latest.body,
    });
  }
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

  const thread = await toggleReactionDb(threadId, commentId, emoji, author.email);
  if (!thread) throw new Error("Comentário não encontrado.");
  await publishCommentsEvent({ type: "thread.upserted", thread });
  revalidatePath(pageId);
}

export async function setThreadStatus(
  pageId: string,
  threadId: string,
  status: ThreadStatus,
): Promise<void> {
  assertValidPageId(pageId);
  const author = await requireAuthor();
  if (status !== "open" && status !== "resolved") {
    throw new Error("Status inválido.");
  }
  const thread = await setThreadStatusDb(threadId, status, author);
  if (!thread) throw new Error("Thread não encontrada.");
  await publishCommentsEvent({ type: "thread.upserted", thread });
  revalidatePath(pageId);
}

export async function deleteComment(
  pageId: string,
  threadId: string,
  commentId: string,
): Promise<{ threadRemoved: boolean }> {
  assertValidPageId(pageId);
  const author = await requireAuthor();
  const result = await deleteCommentDb(threadId, commentId, author.email);
  if (!result) {
    throw new Error("Não foi possível remover o comentário.");
  }
  if (result.kind === "thread-deleted") {
    await publishCommentsEvent({
      type: "thread.deleted",
      threadId: result.threadId,
      pageId: result.pageId,
    });
    revalidatePath(pageId);
    return { threadRemoved: true };
  }
  await publishCommentsEvent({ type: "thread.upserted", thread: result.thread });
  revalidatePath(pageId);
  return { threadRemoved: false };
}

export async function markThreadRead(
  pageId: string,
  threadId: string,
): Promise<void> {
  assertValidPageId(pageId);
  const author = await requireAuthor();
  await markThreadReadDb(threadId, author.email);
  // O evento `thread.read` é direcionado ao próprio usuário (para
  // sincronizar abas/dispositivos). Outros usuários ignoram pelo email.
  await publishCommentsEvent({
    type: "thread.read",
    threadId,
    userEmail: author.email,
    readAt: new Date().toISOString(),
  });
}

export async function markAllThreadsRead(): Promise<{ updated: number }> {
  const author = await requireAuthor();
  await markAllThreadsReadDb(author.email);
  const readAt = new Date().toISOString();
  await publishCommentsEvent({
    type: "thread.all-read",
    userEmail: author.email,
    readAt,
  });
  return { updated: 0 };
}
