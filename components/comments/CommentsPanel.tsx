"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useComments } from "./CommentProvider";
import { REACTION_EMOJIS, type Comment, type Thread } from "@/lib/data/comments";
import styles from "./comments.module.css";

const TIME_FORMATTER = new Intl.RelativeTimeFormat("pt-BR", {
  style: "short",
});

const FULL_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60_000);
  if (mins < 1) return "agora";
  if (mins < 60) return TIME_FORMATTER.format(-mins, "minute");
  const hours = Math.round(mins / 60);
  if (hours < 24) return TIME_FORMATTER.format(-hours, "hour");
  const days = Math.round(hours / 24);
  if (days < 30) return TIME_FORMATTER.format(-days, "day");
  return FULL_FORMATTER.format(new Date(iso));
}

function initials(name?: string | null, email?: string): string {
  const source = name || email || "?";
  const parts = source.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

function sortByDomOrder(threads: Thread[]): Thread[] {
  if (typeof document === "undefined") return threads;
  const scored = threads.map((t) => {
    const block = document.querySelector<HTMLElement>(
      `[data-comment-block="${cssEscape(t.anchor.blockId)}"]`,
    );
    const rect = block?.getBoundingClientRect();
    const top = rect ? rect.top + window.scrollY : Number.MAX_SAFE_INTEGER;
    return { thread: t, top, start: t.anchor.startOffset };
  });
  scored.sort((a, b) => {
    if (a.top !== b.top) return a.top - b.top;
    return a.start - b.start;
  });
  return scored.map((s) => s.thread);
}

function cssEscape(value: string): string {
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
    return CSS.escape(value);
  }
  return value.replace(/["\\\]]/g, "\\$&");
}

export function CommentsPanel() {
  const {
    threads,
    panelOpen,
    activeThreadId,
    composeAnchor,
    pendingThreadId,
    closePanel,
    setActiveThread,
    beginCompose,
    cancelCompose,
    createThread,
    replyToThread,
    reactToComment,
    resolveThread,
    removeComment,
    currentUserEmail,
  } = useComments();

  const [showResolved, setShowResolved] = useState(false);
  const [orderTick, setOrderTick] = useState(0);

  // Recomputa ordem por posição DOM quando o painel abre (aguarda highlights aplicarem).
  useEffect(() => {
    if (!panelOpen) return;
    const id = window.setTimeout(() => setOrderTick((t) => t + 1), 60);
    return () => window.clearTimeout(id);
  }, [panelOpen, threads.length]);

  const ordered = useMemo(() => {
    // orderTick é intencional: serve para reexecutar a ordenação após o painel abrir.
    void orderTick;
    return sortByDomOrder(threads);
  }, [threads, orderTick]);

  const openThreads = useMemo(
    () => ordered.filter((t) => t.status === "open"),
    [ordered],
  );
  const resolvedThreads = useMemo(
    () => ordered.filter((t) => t.status === "resolved"),
    [ordered],
  );

  // Rola para o thread ativo.
  useEffect(() => {
    if (!panelOpen || !activeThreadId) return;
    const id = `thread-${activeThreadId}`;
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [panelOpen, activeThreadId, threads]);

  return (
    <>
      <div
        className={`${styles.panelBackdrop} ${panelOpen ? styles.open : ""}`}
        onClick={closePanel}
        aria-hidden={!panelOpen}
      />
      <aside
        className={`${styles.panel} ${panelOpen ? styles.open : ""}`}
        role="dialog"
        aria-label="Comentários"
        aria-hidden={!panelOpen}
        data-comments-skip=""
      >
        <header className={styles.panelHeader}>
          <div className={styles.panelHeaderText}>
            <h2 className={styles.panelTitle}>Comentários</h2>
            <p className={styles.panelSubtitle}>
              {openThreads.length === 0
                ? composeAnchor
                  ? "Escrevendo nova discussão"
                  : "Nenhuma discussão em aberto"
                : `${openThreads.length} ${openThreads.length === 1 ? "em aberto" : "em aberto"}`}
            </p>
          </div>
          <button
            type="button"
            onClick={closePanel}
            className={styles.closeButton}
            aria-label="Fechar painel de comentários"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 3l10 10M13 3L3 13"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </header>

        <div className={styles.panelBody}>
          {!currentUserEmail && (
            <p className={styles.signedOutNotice}>
              Faça login para comentar e reagir.
            </p>
          )}

          {composeAnchor && (
            <ComposeThread
              quote={composeAnchor.quote}
              onCancel={cancelCompose}
              onSubmit={async (body) => {
                await createThread(composeAnchor, body);
              }}
            />
          )}

          {openThreads.length === 0 && !composeAnchor ? (
            <p className={styles.empty}>
              Selecione qualquer trecho do texto para começar uma discussão.
            </p>
          ) : (
            <ul className={styles.threadList}>
              {openThreads.map((thread) => (
                <li key={thread.id}>
                  <ThreadCard
                    thread={thread}
                    isActive={activeThreadId === thread.id}
                    isPending={pendingThreadId === thread.id}
                    onFocus={() => setActiveThread(thread.id)}
                    onReply={(body) => replyToThread(thread.id, body)}
                    onReact={(commentId, emoji) =>
                      reactToComment(thread.id, commentId, emoji)
                    }
                    onResolve={() => resolveThread(thread.id, "resolved")}
                    onDelete={(commentId) =>
                      removeComment(thread.id, commentId)
                    }
                    currentUserEmail={currentUserEmail}
                  />
                </li>
              ))}
            </ul>
          )}

          {resolvedThreads.length > 0 && (
            <div className={styles.resolvedSection}>
              <button
                type="button"
                className={styles.resolvedToggle}
                onClick={() => setShowResolved((v) => !v)}
              >
                <span>Resolvidas · {resolvedThreads.length}</span>
                <span>{showResolved ? "Ocultar" : "Mostrar"}</span>
              </button>
              {showResolved && (
                <ul className={styles.threadList}>
                  {resolvedThreads.map((thread) => (
                    <li key={thread.id}>
                      <ThreadCard
                        thread={thread}
                        isActive={activeThreadId === thread.id}
                        isPending={false}
                        onFocus={() => setActiveThread(thread.id)}
                        onReply={(body) => replyToThread(thread.id, body)}
                        onReact={(commentId, emoji) =>
                          reactToComment(thread.id, commentId, emoji)
                        }
                        onResolve={() => resolveThread(thread.id, "open")}
                        onDelete={(commentId) =>
                          removeComment(thread.id, commentId)
                        }
                        currentUserEmail={currentUserEmail}
                        resolved
                      />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

interface ComposeThreadProps {
  quote: string;
  onCancel: () => void;
  onSubmit: (body: string) => Promise<void>;
}

function ComposeThread({ quote, onCancel, onSubmit }: ComposeThreadProps) {
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!body.trim() || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit(body);
      setBody("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.compose}>
      <blockquote className={styles.threadQuote}>
        {truncateQuote(quote)}
      </blockquote>
      <form className={styles.replyForm} onSubmit={handleSubmit}>
        <textarea
          className={styles.replyInput}
          placeholder="Escreva um comentário…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          autoFocus
        />
        <div className={styles.replyActions}>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={onCancel}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className={styles.primaryButton}
            disabled={submitting || !body.trim()}
          >
            {submitting ? "Enviando…" : "Comentar"}
          </button>
        </div>
      </form>
    </div>
  );
}

interface ThreadCardProps {
  thread: Thread;
  isActive: boolean;
  isPending: boolean;
  resolved?: boolean;
  currentUserEmail: string | null;
  onFocus: () => void;
  onReply: (body: string) => Promise<void> | void;
  onReact: (commentId: string, emoji: string) => Promise<void> | void;
  onResolve: () => Promise<void> | void;
  onDelete: (commentId: string) => Promise<void> | void;
}

function ThreadCard({
  thread,
  isActive,
  isPending,
  resolved,
  currentUserEmail,
  onFocus,
  onReply,
  onReact,
  onResolve,
  onDelete,
}: ThreadCardProps) {
  const [replyBody, setReplyBody] = useState("");
  const [replying, setReplying] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (isPending) setReplying(true);
  }, [isPending]);

  async function submitReply(e: FormEvent) {
    e.preventDefault();
    if (!replyBody.trim() || sending) return;
    setSending(true);
    try {
      await onReply(replyBody);
      setReplyBody("");
      setReplying(false);
    } finally {
      setSending(false);
    }
  }

  return (
    <article
      id={`thread-${thread.id}`}
      className={`${styles.thread} ${isActive ? styles.active : ""} ${resolved ? styles.resolved : ""}`}
      onMouseEnter={onFocus}
    >
      <div className={styles.threadMeta}>
        <span>
          {thread.comments.length}{" "}
          {thread.comments.length === 1 ? "comentário" : "comentários"}
        </span>
        {thread.status === "resolved" && (
          <span className={styles.threadResolvedFlag}>Resolvida</span>
        )}
      </div>

      <blockquote className={styles.threadQuote}>
        {truncateQuote(thread.anchor.quote)}
      </blockquote>

      <ul className={styles.commentList}>
        {thread.comments.map((comment) => (
          <li key={comment.id}>
            <CommentItem
              comment={comment}
              canDelete={
                !!currentUserEmail &&
                comment.createdBy.email === currentUserEmail
              }
              currentUserEmail={currentUserEmail}
              onReact={(emoji) => onReact(comment.id, emoji)}
              onDelete={() => onDelete(comment.id)}
            />
          </li>
        ))}
      </ul>

      <div className={styles.threadActions}>
        <div className={styles.threadActionsLeft}>
          <button
            type="button"
            className={styles.ghostButton}
            onClick={onResolve}
          >
            {thread.status === "open" ? "Resolver" : "Reabrir"}
          </button>
        </div>
        {currentUserEmail && !replying && (
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => setReplying(true)}
          >
            Responder
          </button>
        )}
      </div>

      {currentUserEmail && replying && (
        <form className={styles.replyForm} onSubmit={submitReply}>
          <textarea
            className={styles.replyInput}
            placeholder="Responder…"
            value={replyBody}
            onChange={(e) => setReplyBody(e.target.value)}
            autoFocus
          />
          <div className={styles.replyActions}>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => {
                setReplyBody("");
                setReplying(false);
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.primaryButton}
              disabled={sending || !replyBody.trim()}
            >
              {sending ? "Enviando…" : "Responder"}
            </button>
          </div>
        </form>
      )}
    </article>
  );
}

interface CommentItemProps {
  comment: Comment;
  canDelete: boolean;
  currentUserEmail: string | null;
  onReact: (emoji: string) => void | Promise<void>;
  onDelete: () => void | Promise<void>;
}

function CommentItem({
  comment,
  canDelete,
  currentUserEmail,
  onReact,
  onDelete,
}: CommentItemProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const hasImage = Boolean(comment.createdBy.image);

  return (
    <div className={styles.comment}>
      <div className={styles.avatar} aria-hidden="true">
        {hasImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={comment.createdBy.image} alt="" />
        ) : (
          <span>
            {initials(comment.createdBy.name, comment.createdBy.email)}
          </span>
        )}
      </div>
      <div className={styles.commentBody}>
        <div className={styles.commentHead}>
          <span className={styles.commentAuthor}>
            {comment.createdBy.name ?? comment.createdBy.email}
          </span>
          <time className={styles.commentTime} dateTime={comment.createdAt}>
            {formatRelative(comment.createdAt)}
          </time>
        </div>
        <p className={styles.commentText}>{comment.body}</p>
        <div className={styles.commentActions}>
          <div className={styles.reactionRow}>
            {Object.entries(comment.reactions).map(([emoji, users]) => {
              const mine =
                !!currentUserEmail && users.includes(currentUserEmail);
              return (
                <button
                  key={emoji}
                  type="button"
                  className={`${styles.reactionChip} ${mine ? styles.mine : ""}`}
                  onClick={() => onReact(emoji)}
                  disabled={!currentUserEmail}
                  title={users.join(", ")}
                >
                  <span aria-hidden="true">{emoji}</span>
                  <span>{users.length}</span>
                </button>
              );
            })}
            {currentUserEmail && (
              <span style={{ position: "relative" }}>
                <button
                  type="button"
                  className={styles.reactionPicker}
                  onClick={() => setPickerOpen((v) => !v)}
                  aria-label="Adicionar reação"
                >
                  <span aria-hidden="true">＋</span>
                </button>
                {pickerOpen && (
                  <span className={styles.reactionMenu}>
                    {REACTION_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        className={styles.reactionMenuButton}
                        onClick={() => {
                          onReact(emoji);
                          setPickerOpen(false);
                        }}
                      >
                        {emoji}
                      </button>
                    ))}
                  </span>
                )}
              </span>
            )}
          </div>
          {canDelete && (
            <button
              type="button"
              className={styles.linkButton}
              onClick={onDelete}
            >
              Excluir
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function truncateQuote(quote: string, max = 220): string {
  const trimmed = quote.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1).trimEnd()}…`;
}
