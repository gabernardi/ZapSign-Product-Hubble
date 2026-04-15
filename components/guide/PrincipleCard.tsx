import styles from "./PrincipleCard.module.css";

interface PrincipleCardProps {
  number: string;
  title: string;
  body: string;
}

export function PrincipleCard({ number, title, body }: PrincipleCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.num}>{number}</div>
      <div className={styles.title}>{title}</div>
      <div className={styles.body}>{body}</div>
    </div>
  );
}
