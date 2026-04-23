/**
 * Tipos canônicos do subsistema de comentários.
 *
 * Versão pós-rewrite: o servidor (Neon/Postgres) é a fonte da verdade,
 * não existe mais snapshot agregado em JSON. Tudo que antes morava em
 * `CommentsStore` virou linhas nas tabelas `threads` / `comments`.
 */

export type ThreadStatus = "open" | "resolved";

export interface Author {
  email: string;
  name?: string;
  image?: string;
}

export interface CommentAnchor {
  blockId: string;
  startOffset: number;
  endOffset: number;
  quote: string;
}

export interface CommentReactions {
  [emoji: string]: string[];
}

export interface Comment {
  id: string;
  body: string;
  createdAt: string;
  createdBy: Author;
  reactions: CommentReactions;
}

export interface Thread {
  id: string;
  pageId: string;
  anchor: CommentAnchor;
  status: ThreadStatus;
  createdAt: string;
  createdBy: Author;
  comments: Comment[];
  participantEmails: string[];
  lastActivityAt: string;
  lastActivityBy: Author;
  /**
   * Derivado por usuário: `read_at` da tabela `thread_reads`. Só vem
   * preenchido quando a query conhece o usuário atual.
   */
  readAtForCurrentUser?: string | null;
}

export interface CommentInboxItem {
  pageId: string;
  pageLabel: string;
  pageSection: string;
  thread: Thread;
  unread: boolean;
  lastComment: Comment;
}

export interface CommentInboxSummary {
  totalCount: number;
  openCount: number;
  unreadCount: number;
}

export const REACTION_EMOJIS: readonly string[] = [
  "👍",
  "❤️",
  "🎉",
  "🤔",
  "👀",
] as const;
