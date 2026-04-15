import styles from "./IterationStrip.module.css";

interface IterationItem {
  number: string;
  name: string;
  description: string;
}

interface IterationStripProps {
  header: string;
  items: IterationItem[];
}

export function IterationStrip({ header, items }: IterationStripProps) {
  return (
    <div className={styles.strip}>
      <div className={styles.header}>{header}</div>
      <div className={styles.items}>
        {items.map((item, i) => (
          <div key={i} className={styles.item}>
            <div className={styles.num}>{item.number}</div>
            <div className={styles.name}>{item.name}</div>
            <div className={styles.desc}>{item.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
