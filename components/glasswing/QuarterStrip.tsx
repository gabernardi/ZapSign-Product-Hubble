import styles from "./QuarterStrip.module.css";

interface QuarterItem {
  id: string;
  label: string;
  period: string;
  active: boolean;
  note: string;
}

interface QuarterStripProps {
  items: QuarterItem[];
}

export function QuarterStrip({ items }: QuarterStripProps) {
  return (
    <ol className={styles.strip} aria-label="Trimestres do ano">
      {items.map((q) => (
        <li
          key={q.id}
          className={`${styles.item} ${q.active ? styles.active : ""}`}
          aria-current={q.active ? "step" : undefined}
        >
          <span className={styles.marker} aria-hidden="true" />
          <div className={styles.body}>
            <div className={styles.head}>
              <span className={styles.label}>{q.label}</span>
              <span className={styles.period}>{q.period}</span>
            </div>
            <span className={styles.note}>{q.note}</span>
          </div>
        </li>
      ))}
    </ol>
  );
}
