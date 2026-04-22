import styles from "./Deliverables.module.css";
import { Ownership } from "./Ownership";

interface Role {
  role: string;
  focus: string;
}

interface Deliverable {
  number: string;
  title: string;
  description: string;
  ownership?: {
    owner: Role;
    contributors: Role[];
  };
}

interface DeliverablesProps {
  chip: string;
  title: string;
  subtitle: string;
  items: Deliverable[];
}

export function Deliverables({ chip, title, subtitle, items }: DeliverablesProps) {
  return (
    <section className={styles.container}>
      <div className={styles.sheen} aria-hidden="true" />

      <header className={styles.top}>
        <div className={styles.chip}>
          <span className={styles.chipDot} />
          {chip}
        </div>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.subtitle}>{subtitle}</p>
      </header>

      <div className={styles.items}>
        <div className={styles.thread} aria-hidden="true" />

        {items.map((item, i) => (
          <article key={i} className={styles.item}>
            <div className={styles.meta}>
              <div className={styles.threadNode} aria-hidden="true">
                <span className={styles.threadDot} />
              </div>
              <div className={styles.num}>{item.number}</div>
              <div className={styles.ordinal}>
                Artefato <span className={styles.ordinalBold}>{i + 1}</span> de {items.length}
              </div>
            </div>

            <div className={styles.body}>
              <h3 className={styles.cardTitle}>{item.title}</h3>
              <p className={styles.desc}>{item.description}</p>
              {item.ownership && (
                <Ownership
                  owner={item.ownership.owner}
                  contributors={item.ownership.contributors}
                />
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
