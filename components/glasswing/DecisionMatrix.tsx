import styles from "./DecisionMatrix.module.css";
import { slugifyForBlockId } from "./_blockId";

export type DecisionCode = "D" | "C" | "I" | "—";

export interface DecisionRole {
  code: string;
  label: string;
}

export interface DecisionRow {
  title: string;
  context: string;
  values: string[];
}

export interface DecisionLegendItem {
  code: string;
  label: string;
}

interface DecisionMatrixProps {
  roles: DecisionRole[];
  rows: DecisionRow[];
  legend: DecisionLegendItem[];
}

export function DecisionMatrix({ roles, rows, legend }: DecisionMatrixProps) {
  return (
    <div className={styles.wrap}>
      <div className={styles.scroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col" className={styles.decisionCol}>
                <span className={styles.colHead}>Decisão</span>
              </th>
              {roles.map((role) => (
                <th key={role.code} scope="col" className={styles.roleCol}>
                  <span className={styles.roleCode}>{role.code}</span>
                  <span className={styles.roleLabel}>{role.label}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const rowId = `decision.${slugifyForBlockId(row.title)}`;
              return (
                <tr key={row.title}>
                  <th scope="row" className={styles.decisionCell}>
                    <span
                      className={styles.decisionTitle}
                      data-comment-block={`${rowId}.title`}
                    >
                      {row.title}
                    </span>
                    <span
                      className={styles.decisionContext}
                      data-comment-block={`${rowId}.context`}
                    >
                      {row.context}
                    </span>
                  </th>
                  {row.values.map((value, i) => (
                    <td key={i} className={styles.valueCell}>
                      <span
                        className={`${styles.pill} ${pillClass(value)}`}
                        aria-label={valueAriaLabel(value, legend)}
                      >
                        {value}
                      </span>
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ul className={styles.legend} aria-label="Legenda">
        {legend.map((item) => (
          <li key={item.code} className={styles.legendItem}>
            <span className={`${styles.pill} ${pillClass(item.code)}`}>
              {item.code}
            </span>
            <span
              className={styles.legendLabel}
              data-comment-block={`decision.legend.${slugifyForBlockId(item.code)}`}
            >
              {item.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function pillClass(value: string): string {
  switch (value) {
    case "D":
      return styles.pillDecide;
    case "C":
      return styles.pillConsult;
    case "I":
      return styles.pillInform;
    default:
      return styles.pillMuted;
  }
}

function valueAriaLabel(
  value: string,
  legend: DecisionLegendItem[],
): string | undefined {
  return legend.find((l) => l.code === value)?.label;
}
