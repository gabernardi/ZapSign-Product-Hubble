import styles from "./StatBar.module.css";
import { slugifyForBlockId } from "./_blockId";

interface StatSeriesItem {
  label: string;
  value: number;
  highlight?: boolean;
}

interface StatBarProps {
  title: string;
  description?: string;
  series: StatSeriesItem[];
  unit?: string;
}

export function StatBar({ title, description, series, unit = "%" }: StatBarProps) {
  const max = Math.max(...series.map((s) => s.value), 100);
  const prefix = `stat.${slugifyForBlockId(title)}`;

  return (
    <figure className={styles.stat}>
      <figcaption className={styles.caption}>
        <h3 className={styles.title} data-comment-block={`${prefix}.title`}>
          {title}
        </h3>
        {description && (
          <p
            className={styles.description}
            data-comment-block={`${prefix}.description`}
          >
            {description}
          </p>
        )}
      </figcaption>
      <div className={styles.rows}>
        {series.map((item) => {
          const width = (item.value / max) * 100;
          return (
            <div
              key={item.label}
              className={`${styles.row} ${item.highlight ? styles.highlight : ""}`}
            >
              <div className={styles.rowHeader}>
                <span className={styles.rowLabel}>{item.label}</span>
                <span className={styles.rowValue}>
                  {item.value}
                  <span className={styles.rowUnit}>{unit === "%" ? "%" : ` ${unit}`}</span>
                </span>
              </div>
              <div className={styles.track}>
                <div
                  className={styles.bar}
                  style={{ width: `${width}%` }}
                  aria-hidden="true"
                />
              </div>
            </div>
          );
        })}
      </div>
    </figure>
  );
}
