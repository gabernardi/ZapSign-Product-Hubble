"use client";

import styles from "./comments.module.css";

interface CommentTriggerProps {
  onClick: () => void;
}

export function CommentTrigger({ onClick }: CommentTriggerProps) {
  return (
    <button
      type="button"
      className={styles.trigger}
      onMouseDown={(e) => {
        // Impede que o mousedown limpe a seleção antes do click disparar.
        e.preventDefault();
      }}
      onClick={onClick}
    >
      <span className={styles.triggerIcon} aria-hidden="true">
        <svg
          viewBox="0 0 16 16"
          fill="none"
          width="14"
          height="14"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M2.5 3.5A1.5 1.5 0 0 1 4 2h8a1.5 1.5 0 0 1 1.5 1.5v6A1.5 1.5 0 0 1 12 11H7l-3 2.5V11h-.5A1.5 1.5 0 0 1 2 9.5v-6Z"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      Comentar
    </button>
  );
}
