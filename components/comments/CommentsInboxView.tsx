"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useCommentsInbox } from "./CommentsInboxProvider";
import type { CommentInboxItem } from "@/lib/comments/types";
import styles from "./comments-inbox.module.css";

const TIME_FORMATTER = new Intl.RelativeTimeFormat("pt-BR", { style: "short" });

type FilterKey =
  | "all"
  | "unread"
  | "open"
  | "resolved"
  | "mine"
  | "participating";

const FILTERS: Array<{ key: FilterKey; label: string }> = [
  { key: "all", label: "Tudo" },
  { key: "unread", label: "Não lidos" },
  { key: "open", label: "Em aberto" },
  { key: "resolved", label: "Resolvidos" },
  { key: "mine", label: "Meus" },
  { key: "participating", label: "Participando" },
];

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diff / 60_000);
  if (minutes < 1) return "agora";
  if (minutes < 60) return TIME_FORMATTER.format(-minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (hours < 24) return TIME_FORMATTER.format(-hours, "hour");
  const days = Math.round(hours / 24);
  return TIME_FORMATTER.format(-days, "day");
}

function truncate(value: string, max = 180): string {
  const trimmed = value.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1).trimEnd()}…`;
}

export function CommentsInboxView() {
  const { items, summary, loading, currentUserEmail, markAllRead } =
    useCommentsInbox();
  const [filter, setFilter] = useState<FilterKey>("all");

  const filtered = useMemo(() => {
    return items.filter((item) => {
      switch (filter) {
        case "unread":
          return item.unread;
        case "open":
          return item.thread.status === "open";
        case "resolved":
          return item.thread.status === "resolved";
        case "mine":
          return item.thread.createdBy.email === currentUserEmail;
        case "participating":
          return currentUserEmail
            ? item.thread.participantEmails.includes(currentUserEmail)
            : false;
        default:
          return true;
      }
    });
  }, [currentUserEmail, filter, items]);

  const groups = useMemo(() => {
    const map = new Map<
      string,
      {
        pageId: string;
        pageLabel: string;
        pageSection: string;
        items: CommentInboxItem[];
      }
    >();
    for (const item of filtered) {
      const existing = map.get(item.pageId);
      if (existing) {
        existing.items.push(item);
      } else {
        map.set(item.pageId, {
          pageId: item.pageId,
          pageLabel: item.pageLabel,
          pageSection: item.pageSection,
          items: [item],
        });
      }
    }
    return Array.from(map.values());
  }, [filtered]);

  return (
    <section className={styles.section}>
      <div className={styles.statBar}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Total</span>
          <strong className={styles.statValue}>{summary.totalCount}</strong>
        </div>
        <span className={styles.statDivider} aria-hidden="true" />
        <div className={styles.stat}>
          <span className={styles.statLabel}>Em aberto</span>
          <strong className={styles.statValue}>{summary.openCount}</strong>
        </div>
        <span className={styles.statDivider} aria-hidden="true" />
        <div className={styles.stat}>
          <span className={styles.statLabel}>Não lidos</span>
          <strong
            className={`${styles.statValue} ${
              summary.unreadCount > 0 ? styles.statValueAccent : ""
            }`}
          >
            {summary.unreadCount}
          </strong>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.filters} role="tablist">
          {FILTERS.map((item) => (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={filter === item.key}
              className={`${styles.filterButton} ${
                filter === item.key ? styles.filterButtonActive : ""
              }`}
              onClick={() => setFilter(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>
        {summary.unreadCount > 0 && (
          <button
            type="button"
            className={styles.markAllButton}
            onClick={() => void markAllRead()}
          >
            Marcar tudo como lido
          </button>
        )}
      </div>

      {loading ? (
        <div className={styles.emptyState}>
          <p>Carregando atividade…</p>
        </div>
      ) : groups.length === 0 ? (
        <div className={styles.emptyState}>
          <p>Nenhum comentário encontrado nesse filtro.</p>
          <span>
            Selecione um trecho em qualquer página editorial para começar uma
            discussão.
          </span>
        </div>
      ) : (
        <div className={styles.groups}>
          {groups.map((group) => (
            <section key={group.pageId} className={styles.group}>
              <header className={styles.groupHeader}>
                <div className={styles.groupHeaderText}>
                  <p className={styles.groupEyebrow}>{group.pageSection}</p>
                  <h2 className={styles.groupTitle}>
                    {group.pageLabel}
                    <span className={styles.groupCount}>
                      {group.items.length}
                    </span>
                  </h2>
                </div>
                <Link href={group.pageId} className={styles.pageLink}>
                  Abrir página
                  <span aria-hidden="true" className={styles.pageLinkArrow}>
                    →
                  </span>
                </Link>
              </header>

              <div className={styles.cards}>
                {group.items.map((item) => {
                  const actor =
                    item.thread.lastActivityBy.name ??
                    item.thread.lastActivityBy.email;
                  const commentCount = item.thread.comments.length;
                  const participantCount = item.thread.participantEmails.length;
                  const href = `${item.pageId}?thread=${encodeURIComponent(
                    item.thread.id,
                  )}`;

                  return (
                    <Link
                      key={item.thread.id}
                      href={href}
                      className={`${styles.card} ${
                        item.unread ? styles.cardUnread : ""
                      }`}
                      aria-label={`Abrir thread: ${item.thread.anchor.quote}`}
                    >
                      <div className={styles.cardTop}>
                        <div className={styles.pills}>
                          {item.unread && (
                            <span
                              className={`${styles.pill} ${styles.pillNew}`}
                            >
                              Novo
                            </span>
                          )}
                          {item.thread.status === "resolved" && (
                            <span
                              className={`${styles.pill} ${styles.pillResolved}`}
                            >
                              Resolvida
                            </span>
                          )}
                        </div>
                        <span className={styles.time}>
                          {formatRelative(item.thread.lastActivityAt)}
                        </span>
                      </div>

                      <blockquote className={styles.quote}>
                        {truncate(item.thread.anchor.quote, 200)}
                      </blockquote>

                      <p className={styles.lastComment}>
                        <span className={styles.lastCommentActor}>{actor}</span>
                        <span className={styles.lastCommentSep} aria-hidden="true">
                          ·
                        </span>
                        <span className={styles.lastCommentBody}>
                          {truncate(item.lastComment.body, 220)}
                        </span>
                      </p>

                      <div className={styles.meta}>
                        <span>
                          {commentCount}{" "}
                          {commentCount === 1 ? "comentário" : "comentários"}
                        </span>
                        <span className={styles.metaDot} aria-hidden="true">
                          ·
                        </span>
                        <span>
                          {participantCount}{" "}
                          {participantCount === 1
                            ? "participante"
                            : "participantes"}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </section>
  );
}
