"use client";

import { useComments } from "./CommentProvider";
import styles from "./comments.module.css";

export function CommentsToggle() {
  const { threads, panelOpen, openPanel } = useComments();
  if (panelOpen) return null;
  const openCount = threads.filter((t) => t.status === "open").length;
  return (
    <button
      type="button"
      className={styles.panelToggle}
      onClick={() => openPanel(null)}
      data-comments-skip=""
    >
      <svg
        className={styles.panelToggleIcon}
        width="14"
        height="14"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M2.5 3.5A1.5 1.5 0 0 1 4 2h8a1.5 1.5 0 0 1 1.5 1.5v6A1.5 1.5 0 0 1 12 11H7l-3 2.5V11h-.5A1.5 1.5 0 0 1 2 9.5v-6Z"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      </svg>
      Comentários
      {openCount > 0 && (
        <span className={styles.panelToggleCount}>{openCount}</span>
      )}
    </button>
  );
}
