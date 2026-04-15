import styles from "./PhaseBlock.module.css";

interface PhaseBlockProps {
  phase: string;
  color: "blue" | "amber" | "green";
  title: string;
  subtitle: string;
}

export function PhaseBlock({ phase, color, title, subtitle }: PhaseBlockProps) {
  return (
    <div className={styles.block}>
      <div className={styles.row}>
        <div className={`${styles.chip} ${styles[color]}`}>{phase}</div>
        <div className={styles.line} />
      </div>
      <div className={styles.title}>{title}</div>
      <div className={styles.sub}>{subtitle}</div>
    </div>
  );
}
