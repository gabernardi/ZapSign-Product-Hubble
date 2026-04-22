import styles from "./Bridge.module.css";

interface BridgeProps {
  label: string;
  children: React.ReactNode;
}

export function Bridge({ label, children }: BridgeProps) {
  return (
    <aside className={styles.bridge} aria-label={label}>
      <div className={styles.rule} aria-hidden="true">
        <span className={styles.rulePin} />
      </div>
      <div className={styles.content}>
        <div className={styles.head}>
          <svg
            className={styles.glyph}
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M6 1.5v8M2.8 6.5L6 9.8l3.2-3.3"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className={styles.label}>{label}</span>
        </div>
        <div className={styles.text}>{children}</div>
      </div>
    </aside>
  );
}
