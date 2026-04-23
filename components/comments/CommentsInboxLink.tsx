"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCommentsInbox } from "./CommentsInboxProvider";
import styles from "./comments-inbox-link.module.css";

type Variant = "glasswing" | "header" | "sidebar";

interface CommentsInboxLinkProps {
  variant: Variant;
  onClick?: () => void;
}

export function CommentsInboxLink({
  variant,
  onClick,
}: CommentsInboxLinkProps) {
  const pathname = usePathname();
  const { summary } = useCommentsInbox();
  const active = pathname.startsWith("/dashboard/comentarios");
  const unreadCount = summary.unreadCount;

  return (
    <Link
      href="/dashboard/comentarios"
      onClick={onClick}
      className={[
        styles.link,
        styles[variant],
        active ? styles.active : "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-current={active ? "page" : undefined}
    >
      <span className={styles.icon} aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M2.5 3.5A1.5 1.5 0 0 1 4 2h8a1.5 1.5 0 0 1 1.5 1.5v6A1.5 1.5 0 0 1 12 11H7l-3 2.5V11h-.5A1.5 1.5 0 0 1 2 9.5v-6Z"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className={styles.label}>Comentários</span>
      {unreadCount > 0 && (
        <span className={styles.count}>{unreadCount}</span>
      )}
    </Link>
  );
}
