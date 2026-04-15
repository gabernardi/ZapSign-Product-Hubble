import styles from "./MetricRow.module.css";

interface Metric {
  label: string;
  value: string;
  description: string;
}

interface MetricRowProps {
  metrics: Metric[];
}

export function MetricRow({ metrics }: MetricRowProps) {
  return (
    <div className={styles.row}>
      {metrics.map((m, i) => (
        <div key={i} className={styles.chip}>
          <div className={styles.label}>{m.label}</div>
          <div className={styles.val}>{m.value}</div>
          <div className={styles.desc}>{m.description}</div>
        </div>
      ))}
    </div>
  );
}
