import styles from "./Deliverables.module.css";

interface Deliverable {
  number: string;
  title: string;
  description: string;
}

interface DeliverablesProps {
  chip: string;
  title: string;
  subtitle: string;
  items: Deliverable[];
}

export function Deliverables({ chip, title, subtitle, items }: DeliverablesProps) {
  return (
    <div className={styles.container}>
      <div className={styles.top}>
        <div className={styles.chip}>{chip}</div>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.subtitle}>{subtitle}</p>
      </div>
      <div className={styles.cards}>
        {items.map((item, i) => (
          <div key={i} className={styles.card}>
            <div className={styles.num}>{item.number}</div>
            <div className={styles.cardTitle}>{item.title}</div>
            <p className={styles.desc}>{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
