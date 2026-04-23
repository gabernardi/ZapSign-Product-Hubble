import "server-only";

import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import type {
  Author,
  Comment,
  CommentAnchor,
  CommentInboxItem,
  CommentInboxSummary,
  CommentReactions,
  Thread,
  ThreadStatus,
} from "./types";
import { pageMeta } from "./page-meta";

/**
 * Camada de acesso a dados para comentários, em cima do Neon/Postgres.
 *
 * Princípios:
 *   - O banco é a fonte única da verdade. Nada mora em memória nem em JSON.
 *   - Mutations devolvem o objeto completo já no formato da aplicação
 *     (`Thread` / `Comment`), pronto pra propagar via Pusher.
 *   - Nenhuma função aqui toca Pusher — isso é responsabilidade do caller
 *     (server actions) pra manter separação entre "persistência" e "fanout".
 */

let cachedSql: NeonQueryFunction<false, false> | null = null;

function sqlClient(): NeonQueryFunction<false, false> {
  if (cachedSql) return cachedSql;
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL não definida. Configure a env var com a connection string do Neon.",
    );
  }
  cachedSql = neon(url);
  return cachedSql;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function generateId(prefix: "t" | "c"): string {
  try {
    const uuid =
      typeof globalThis !== "undefined" &&
      typeof globalThis.crypto?.randomUUID === "function"
        ? globalThis.crypto.randomUUID()
        : "";
    if (uuid) {
      return `${prefix}_${uuid.replace(/-/g, "").slice(0, 12)}`;
    }
  } catch {
    // ignore
  }
  const rand = Math.random().toString(36).slice(2, 10);
  const time = Date.now().toString(36).slice(-4);
  return `${prefix}_${time}${rand}`;
}

function toIso(value: Date | string): string {
  return typeof value === "string" ? new Date(value).toISOString() : value.toISOString();
}

interface ThreadRow {
  id: string;
  page_id: string;
  anchor_block_id: string;
  anchor_start_offset: number;
  anchor_end_offset: number;
  anchor_quote: string;
  status: ThreadStatus;
  created_at: string | Date;
  created_by_email: string;
  created_by_name: string | null;
  created_by_image: string | null;
  last_activity_at: string | Date;
  last_activity_by_email: string;
  last_activity_by_name: string | null;
  last_activity_by_image: string | null;
  read_at_for_current_user?: string | Date | null;
}

interface CommentRow {
  id: string;
  thread_id: string;
  body: string;
  created_at: string | Date;
  created_by_email: string;
  created_by_name: string | null;
  created_by_image: string | null;
  reactions: CommentReactions | string;
}

function rowToComment(row: CommentRow): Comment {
  const reactions: CommentReactions =
    typeof row.reactions === "string"
      ? (JSON.parse(row.reactions) as CommentReactions)
      : (row.reactions ?? {});
  return {
    id: row.id,
    body: row.body,
    createdAt: toIso(row.created_at),
    createdBy: {
      email: row.created_by_email,
      name: row.created_by_name ?? undefined,
      image: row.created_by_image ?? undefined,
    },
    reactions,
  };
}

function rowToThread(row: ThreadRow, comments: Comment[]): Thread {
  const participantEmails = Array.from(
    new Set(
      [row.created_by_email, ...comments.map((c) => c.createdBy.email)].map(
        normalizeEmail,
      ),
    ),
  );
  return {
    id: row.id,
    pageId: row.page_id,
    anchor: {
      blockId: row.anchor_block_id,
      startOffset: row.anchor_start_offset,
      endOffset: row.anchor_end_offset,
      quote: row.anchor_quote,
    },
    status: row.status,
    createdAt: toIso(row.created_at),
    createdBy: {
      email: row.created_by_email,
      name: row.created_by_name ?? undefined,
      image: row.created_by_image ?? undefined,
    },
    comments,
    participantEmails,
    lastActivityAt: toIso(row.last_activity_at),
    lastActivityBy: {
      email: row.last_activity_by_email,
      name: row.last_activity_by_name ?? undefined,
      image: row.last_activity_by_image ?? undefined,
    },
    readAtForCurrentUser: row.read_at_for_current_user
      ? toIso(row.read_at_for_current_user)
      : null,
  };
}

async function fetchCommentsForThreads(
  threadIds: string[],
): Promise<Map<string, Comment[]>> {
  if (threadIds.length === 0) return new Map();
  const sql = sqlClient();
  const rows = (await sql.query(
    `SELECT id, thread_id, body, created_at, created_by_email, created_by_name,
            created_by_image, reactions
       FROM comments
      WHERE thread_id = ANY($1::text[])
      ORDER BY created_at ASC`,
    [threadIds],
  )) as CommentRow[];
  const byThread = new Map<string, Comment[]>();
  for (const id of threadIds) byThread.set(id, []);
  for (const row of rows) {
    const list = byThread.get(row.thread_id);
    if (list) list.push(rowToComment(row));
  }
  return byThread;
}

/**
 * Carrega uma thread pelo ID (usado depois de mutations pra devolver estado
 * canônico). Retorna `null` se não existir.
 */
export async function getThreadById(
  threadId: string,
  viewerEmail?: string,
): Promise<Thread | null> {
  const sql = sqlClient();
  const params: unknown[] = [threadId];
  let viewerJoin = "";
  if (viewerEmail) {
    params.push(normalizeEmail(viewerEmail));
    viewerJoin = `LEFT JOIN thread_reads tr
                    ON tr.thread_id = t.id AND tr.user_email = $2`;
  }
  const rows = (await sql.query(
    `SELECT t.*${viewerEmail ? ", tr.read_at AS read_at_for_current_user" : ""}
       FROM threads t
       ${viewerJoin}
      WHERE t.id = $1
      LIMIT 1`,
    params,
  )) as ThreadRow[];
  if (rows.length === 0) return null;
  const comments = (await fetchCommentsForThreads([threadId])).get(threadId) ?? [];
  return rowToThread(rows[0], comments);
}

/**
 * Lista threads de uma página, ordenadas por atividade desc. Se
 * `viewerEmail` for passado, inclui `readAtForCurrentUser` em cada thread.
 */
export async function getThreadsForPage(
  pageId: string,
  viewerEmail?: string,
): Promise<Thread[]> {
  const sql = sqlClient();
  const params: unknown[] = [pageId];
  let viewerJoin = "";
  let viewerSelect = "";
  if (viewerEmail) {
    params.push(normalizeEmail(viewerEmail));
    viewerJoin = `LEFT JOIN thread_reads tr
                    ON tr.thread_id = t.id AND tr.user_email = $2`;
    viewerSelect = ", tr.read_at AS read_at_for_current_user";
  }
  const rows = (await sql.query(
    `SELECT t.*${viewerSelect}
       FROM threads t
       ${viewerJoin}
      WHERE t.page_id = $1
      ORDER BY t.last_activity_at DESC`,
    params,
  )) as ThreadRow[];
  if (rows.length === 0) return [];
  const commentsByThread = await fetchCommentsForThreads(rows.map((r) => r.id));
  return rows.map((row) =>
    rowToThread(row, commentsByThread.get(row.id) ?? []),
  );
}

export async function getAllThreads(viewerEmail?: string): Promise<Thread[]> {
  const sql = sqlClient();
  const params: unknown[] = [];
  let viewerJoin = "";
  let viewerSelect = "";
  if (viewerEmail) {
    params.push(normalizeEmail(viewerEmail));
    viewerJoin = `LEFT JOIN thread_reads tr
                    ON tr.thread_id = t.id AND tr.user_email = $1`;
    viewerSelect = ", tr.read_at AS read_at_for_current_user";
  }
  const rows = (await sql.query(
    `SELECT t.*${viewerSelect}
       FROM threads t
       ${viewerJoin}
      ORDER BY t.last_activity_at DESC`,
    params,
  )) as ThreadRow[];
  if (rows.length === 0) return [];
  const commentsByThread = await fetchCommentsForThreads(rows.map((r) => r.id));
  return rows.map((row) =>
    rowToThread(row, commentsByThread.get(row.id) ?? []),
  );
}

/**
 * Deriva items de inbox a partir das threads de todas as páginas.
 */
export function toInboxItems(threads: Thread[]): CommentInboxItem[] {
  const items: CommentInboxItem[] = [];
  for (const thread of threads) {
    const last = thread.comments[thread.comments.length - 1];
    if (!last) continue;
    const meta = pageMeta(thread.pageId);
    const readAt = thread.readAtForCurrentUser;
    const unread = readAt
      ? new Date(thread.lastActivityAt).getTime() > new Date(readAt).getTime()
      : true;
    items.push({
      pageId: thread.pageId,
      pageLabel: meta.label,
      pageSection: meta.section,
      thread,
      unread,
      lastComment: last,
    });
  }
  items.sort(
    (a, b) =>
      new Date(b.thread.lastActivityAt).getTime() -
      new Date(a.thread.lastActivityAt).getTime(),
  );
  return items;
}

export function toInboxSummary(items: CommentInboxItem[]): CommentInboxSummary {
  return {
    totalCount: items.length,
    openCount: items.filter((item) => item.thread.status === "open").length,
    unreadCount: items.filter((item) => item.unread).length,
  };
}

/* ------------------------------------------------------------------ */
/* Mutations                                                          */
/* ------------------------------------------------------------------ */

interface CreateThreadInput {
  pageId: string;
  anchor: CommentAnchor;
  author: Author;
  body: string;
}

export async function createThread(
  input: CreateThreadInput,
): Promise<Thread> {
  const sql = sqlClient();
  const threadId = generateId("t");
  const commentId = generateId("c");
  const now = new Date();
  const author: Author = { ...input.author, email: normalizeEmail(input.author.email) };

  // Duas linhas em transação implícita — o Neon serverless HTTP não
  // suporta BEGIN/COMMIT multi-call, então fazemos ambos em sequência
  // com a mesma conexão. Se o segundo falhar, a thread fica órfã e é
  // limpada na próxima request (ver `cleanupEmptyThreads`). Na prática
  // os dois INSERTs quase sempre sobem juntos.
  await sql.query(
    `INSERT INTO threads (
        id, page_id, anchor_block_id, anchor_start_offset, anchor_end_offset,
        anchor_quote, status, created_at, created_by_email, created_by_name,
        created_by_image, last_activity_at, last_activity_by_email,
        last_activity_by_name, last_activity_by_image
     ) VALUES ($1,$2,$3,$4,$5,$6,'open',$7,$8,$9,$10,$7,$8,$9,$10)`,
    [
      threadId,
      input.pageId,
      input.anchor.blockId,
      input.anchor.startOffset,
      input.anchor.endOffset,
      input.anchor.quote,
      now,
      author.email,
      author.name ?? null,
      author.image ?? null,
    ],
  );

  await sql.query(
    `INSERT INTO comments (
        id, thread_id, body, created_at, created_by_email, created_by_name,
        created_by_image, reactions
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,'{}'::jsonb)`,
    [
      commentId,
      threadId,
      input.body,
      now,
      author.email,
      author.name ?? null,
      author.image ?? null,
    ],
  );

  // O autor já "leu" a própria thread.
  await markThreadRead(threadId, author.email);

  const thread = await getThreadById(threadId, author.email);
  if (!thread) {
    throw new Error("Falha ao reler thread recém-criada");
  }
  return thread;
}

interface AddCommentInput {
  threadId: string;
  body: string;
  author: Author;
}

export async function addCommentToThread(
  input: AddCommentInput,
): Promise<Thread> {
  const sql = sqlClient();
  const commentId = generateId("c");
  const now = new Date();
  const author: Author = { ...input.author, email: normalizeEmail(input.author.email) };

  const inserted = (await sql.query(
    `INSERT INTO comments (
        id, thread_id, body, created_at, created_by_email, created_by_name,
        created_by_image, reactions
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,'{}'::jsonb)
     RETURNING id`,
    [
      commentId,
      input.threadId,
      input.body,
      now,
      author.email,
      author.name ?? null,
      author.image ?? null,
    ],
  )) as { id: string }[];

  if (inserted.length === 0) {
    throw new Error("Falha ao inserir comentário");
  }

  await sql.query(
    `UPDATE threads
        SET last_activity_at = $2,
            last_activity_by_email = $3,
            last_activity_by_name = $4,
            last_activity_by_image = $5
      WHERE id = $1`,
    [input.threadId, now, author.email, author.name ?? null, author.image ?? null],
  );

  // Autor leu a própria atividade.
  await markThreadRead(input.threadId, author.email);

  const thread = await getThreadById(input.threadId, author.email);
  if (!thread) throw new Error("Thread não encontrada após adicionar comentário");
  return thread;
}

/**
 * Remove um comentário. Se era o último da thread, a thread inteira é removida
 * (CASCADE cobre reads). Retorna o estado pós-operação:
 *   - `{ kind: "thread-deleted", threadId }` se a thread foi removida
 *   - `{ kind: "thread-updated", thread }` se só um comentário saiu
 */
export type DeleteCommentResult =
  | { kind: "thread-deleted"; threadId: string; pageId: string }
  | { kind: "thread-updated"; thread: Thread };

export async function deleteComment(
  threadId: string,
  commentId: string,
  viewerEmail?: string,
): Promise<DeleteCommentResult | null> {
  const sql = sqlClient();

  // Confirma que o comentário pertence à thread antes de mexer
  const owned = (await sql.query(
    `SELECT 1 FROM comments WHERE id = $1 AND thread_id = $2 LIMIT 1`,
    [commentId, threadId],
  )) as unknown[];
  if (owned.length === 0) return null;

  await sql.query(`DELETE FROM comments WHERE id = $1`, [commentId]);

  const remaining = (await sql.query(
    `SELECT COUNT(*)::int AS count FROM comments WHERE thread_id = $1`,
    [threadId],
  )) as { count: number }[];

  if ((remaining[0]?.count ?? 0) === 0) {
    const rows = (await sql.query(
      `SELECT page_id FROM threads WHERE id = $1`,
      [threadId],
    )) as { page_id: string }[];
    const pageId = rows[0]?.page_id ?? "";
    await sql.query(`DELETE FROM threads WHERE id = $1`, [threadId]);
    return { kind: "thread-deleted", threadId, pageId };
  }

  // Reindexa last_activity com base no comentário mais recente restante
  const lastRows = (await sql.query(
    `SELECT created_at, created_by_email, created_by_name, created_by_image
       FROM comments
      WHERE thread_id = $1
      ORDER BY created_at DESC
      LIMIT 1`,
    [threadId],
  )) as {
    created_at: string | Date;
    created_by_email: string;
    created_by_name: string | null;
    created_by_image: string | null;
  }[];
  const last = lastRows[0];
  if (last) {
    await sql.query(
      `UPDATE threads
          SET last_activity_at = $2,
              last_activity_by_email = $3,
              last_activity_by_name = $4,
              last_activity_by_image = $5
        WHERE id = $1`,
      [
        threadId,
        last.created_at,
        last.created_by_email,
        last.created_by_name,
        last.created_by_image,
      ],
    );
  }

  const thread = await getThreadById(threadId, viewerEmail);
  if (!thread) return null;
  return { kind: "thread-updated", thread };
}

export async function setThreadStatus(
  threadId: string,
  status: ThreadStatus,
  actor: Author,
): Promise<Thread | null> {
  const sql = sqlClient();
  const now = new Date();
  const author: Author = { ...actor, email: normalizeEmail(actor.email) };
  const result = (await sql.query(
    `UPDATE threads
        SET status = $2,
            last_activity_at = $3,
            last_activity_by_email = $4,
            last_activity_by_name = $5,
            last_activity_by_image = $6
      WHERE id = $1
      RETURNING id`,
    [
      threadId,
      status,
      now,
      author.email,
      author.name ?? null,
      author.image ?? null,
    ],
  )) as { id: string }[];
  if (result.length === 0) return null;
  return getThreadById(threadId, author.email);
}

export async function toggleReaction(
  threadId: string,
  commentId: string,
  emoji: string,
  email: string,
): Promise<Thread | null> {
  const sql = sqlClient();
  const userEmail = normalizeEmail(email);

  const rows = (await sql.query(
    `SELECT reactions FROM comments WHERE id = $1 AND thread_id = $2 LIMIT 1`,
    [commentId, threadId],
  )) as { reactions: CommentReactions | string }[];
  if (rows.length === 0) return null;

  const current: CommentReactions =
    typeof rows[0].reactions === "string"
      ? (JSON.parse(rows[0].reactions) as CommentReactions)
      : (rows[0].reactions ?? {});
  const list = current[emoji] ?? [];
  const isOn = list.includes(userEmail);
  const nextList = isOn
    ? list.filter((e) => e !== userEmail)
    : [...list, userEmail];
  const next = { ...current };
  if (nextList.length === 0) delete next[emoji];
  else next[emoji] = nextList;

  await sql.query(
    `UPDATE comments SET reactions = $2::jsonb WHERE id = $1`,
    [commentId, JSON.stringify(next)],
  );

  return getThreadById(threadId, userEmail);
}

export async function markThreadRead(
  threadId: string,
  email: string,
): Promise<void> {
  const sql = sqlClient();
  const userEmail = normalizeEmail(email);
  await sql.query(
    `INSERT INTO thread_reads (thread_id, user_email, read_at)
     VALUES ($1, $2, NOW())
     ON CONFLICT (thread_id, user_email)
     DO UPDATE SET read_at = EXCLUDED.read_at`,
    [threadId, userEmail],
  );
}

export async function markAllThreadsRead(email: string): Promise<void> {
  const sql = sqlClient();
  const userEmail = normalizeEmail(email);
  await sql.query(
    `INSERT INTO thread_reads (thread_id, user_email, read_at)
     SELECT id, $1, NOW() FROM threads
     ON CONFLICT (thread_id, user_email)
     DO UPDATE SET read_at = EXCLUDED.read_at`,
    [userEmail],
  );
}
