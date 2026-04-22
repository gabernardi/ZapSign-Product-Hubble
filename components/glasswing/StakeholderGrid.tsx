import styles from "./StakeholderGrid.module.css";

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
  return (
    <section id={id} className={styles.section}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <span className={styles.eyebrow}>{eyebrow}</span>
          <h2 className={styles.title}>{title}</h2>
          {description && <p className={styles.description}>{description}</p>}
        </header>

        <ul className={styles.grid}>
          {items.map((item) => (
            <li key={item.code} className={styles.cell}>
              <span className={styles.code}>{item.code}</span>
              <span className={styles.role}>{item.role}</span>
              <span className={styles.focus}>{item.focus}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
