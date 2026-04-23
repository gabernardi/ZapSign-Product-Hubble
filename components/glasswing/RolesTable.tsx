import styles from "./RolesTable.module.css";
import { slugifyForBlockId } from "./_blockId";

export interface RoleRow {
  number: string;
  name: string;
  question: string;
  body: string;
  leads: string[];
  contributes: string[];
  doesNotOwn: string[];
}

interface RolesTableProps {
  items: RoleRow[];
}

export function RolesTable({ items }: RolesTableProps) {
  return (
    <div className={styles.wrap}>
      <div
        className={styles.table}
        role="table"
        aria-label="Papéis e responsabilidades"
      >
        <div className={styles.head} role="row">
          <span className={`${styles.cell} ${styles.headCell}`} role="columnheader">
            Papel
          </span>
          <span className={`${styles.cell} ${styles.headCell}`} role="columnheader">
            Lidera
          </span>
          <span className={`${styles.cell} ${styles.headCell}`} role="columnheader">
            Contribui com
          </span>
          <span className={`${styles.cell} ${styles.headCell}`} role="columnheader">
            Não assume
          </span>
        </div>

        {items.map((role) => {
          const prefix = `roles.${slugifyForBlockId(role.name)}`;
          return (
            <div key={role.number} className={styles.row} role="row">
              <div
                className={`${styles.cell} ${styles.roleCell}`}
                role="cell"
                data-label="Papel"
              >
                <span className={styles.number}>{role.number}</span>
                <h3 className={styles.name} data-comment-block={`${prefix}.name`}>
                  {role.name}
                </h3>
                <p
                  className={styles.question}
                  data-comment-block={`${prefix}.question`}
                >
                  {role.question}
                </p>
                <p className={styles.body} data-comment-block={`${prefix}.body`}>
                  {role.body}
                </p>
              </div>

              <div className={styles.cell} role="cell" data-label="Lidera">
                <ul
                  className={styles.list}
                  data-comment-block={`${prefix}.leads`}
                >
                  {role.leads.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className={styles.cell} role="cell" data-label="Contribui com">
                <ul
                  className={styles.list}
                  data-comment-block={`${prefix}.contributes`}
                >
                  {role.contributes.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className={styles.cell} role="cell" data-label="Não assume">
                <ul
                  className={`${styles.list} ${styles.listMuted}`}
                  data-comment-block={`${prefix}.doesNotOwn`}
                >
                  {role.doesNotOwn.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
