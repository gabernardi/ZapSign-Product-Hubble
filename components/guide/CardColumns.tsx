import styles from "./CardColumns.module.css";

interface ColumnData {
  label: string;
  labelColor?: "blue" | "green" | "amber";
  bgColor?: "blue" | "green" | "amber";
  items: string[];
}

interface CardColumnsProps {
  columns: ColumnData[];
}

export function CardColumns({ columns }: CardColumnsProps) {
  return (
    <div className={styles.grid}>
      {columns.map((col, i) => (
        <div
          key={i}
          className={`${styles.box} ${col.bgColor ? styles[`bg${col.bgColor}`] : ""}`}
        >
          <span
            className={`${styles.label} ${col.labelColor ? styles[col.labelColor] : ""}`}
          >
            {col.label}
          </span>
          <ul className={styles.list}>
            {col.items.map((item, j) => (
              <li key={j}>{item}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
