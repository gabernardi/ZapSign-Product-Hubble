import styles from "./StakeholderGrid.module.css";
import { slugifyForBlockId } from "./_blockId";

interface Stakeholder {
  code: string;
  role: string;
  focus: string;
}

interface StakeholderGridProps {
  id?: string;
  eyebrow: string;
  title: string;
  description?: string;
  items: Stakeholder[];
}

export function StakeholderGrid({
  id,
  eyebrow,
  title,
  description,
  items,
}: StakeholderGridProps) {
  const prefix = `stakeholders.${slugifyForBlockId(title)}`;
  return (
    <section id={id} className={styles.section}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <span
            className={styles.eyebrow}
            data-comment-block={`${prefix}.eyebrow`}
          >
            {eyebrow}
          </span>
          <h2 className={styles.title} data-comment-block={`${prefix}.title`}>
            {title}
          </h2>
          {description && (
            <p
              className={styles.description}
              data-comment-block={`${prefix}.description`}
            >
              {description}
            </p>
          )}
        </header>

        <ul className={styles.grid}>
          {items.map((item) => {
            const itemPrefix = `${prefix}.${slugifyForBlockId(item.code)}`;
            return (
              <li key={item.code} className={styles.cell}>
                <span
                  className={styles.code}
                  data-comment-block={`${itemPrefix}.code`}
                >
                  {item.code}
                </span>
                <span
                  className={styles.role}
                  data-comment-block={`${itemPrefix}.role`}
                >
                  {item.role}
                </span>
                <span
                  className={styles.focus}
                  data-comment-block={`${itemPrefix}.focus`}
                >
                  {item.focus}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
