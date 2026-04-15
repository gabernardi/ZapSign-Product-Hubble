import styles from "./StartingPointCard.module.css";

interface StartingPointCardProps {
  color: "blue" | "amber" | "teal" | "purple";
  title: string;
  body: string;
  focusLabel: string;
  focusValue: string;
}

export function StartingPointCard({
  color,
  title,
  body,
  focusLabel,
  focusValue,
}: StartingPointCardProps) {
  return (
    <div className={styles.card}>
      <div className={`${styles.dot} ${styles[color]}`} />
      <div className={styles.title}>{title}</div>
      <div className={styles.body}>{body}</div>
      <div className={styles.focus}>
        {focusLabel}: <span>{focusValue}</span>
      </div>
    </div>
  );
}
