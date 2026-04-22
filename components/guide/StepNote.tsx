import styles from "./StepNote.module.css";

interface StepNoteProps {
  children: React.ReactNode;
  label?: string;
}

export function StepNote({ children, label = "Nota" }: StepNoteProps) {
  return (
    <aside className={styles.note} role="note">
      <div className={styles.meta}>
        <svg
          className={styles.glyph}
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="7" cy="7" r="5.6" stroke="currentColor" strokeWidth="1.2" />
          <path
            d="M7 6.2v3.4"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <circle cx="7" cy="4.2" r="0.7" fill="currentColor" />
        </svg>
        <span className={styles.label}>{label}</span>
      </div>
      <div className={styles.body}>{children}</div>
    </aside>
  );
}
