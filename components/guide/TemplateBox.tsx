import styles from "./TemplateBox.module.css";

interface TemplateRow {
  key: string;
  value: string;
}

interface TemplateBoxProps {
  label: string;
  rows: TemplateRow[];
}

export function TemplateBox({ label, rows }: TemplateBoxProps) {
  return (
    <div className={styles.box}>
      <div className={styles.label}>{label}</div>
      {rows.map((row, i) => (
        <div key={i} className={styles.row}>
          <span className={styles.key}>{row.key}</span>
          <span className={styles.val}>{row.value}</span>
        </div>
      ))}
    </div>
  );
}
