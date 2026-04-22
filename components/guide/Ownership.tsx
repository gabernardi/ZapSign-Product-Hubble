import styles from "./Ownership.module.css";

interface Role {
  role: string;
  focus: string;
}

interface OwnershipProps {
  owner: Role;
  contributors: Role[];
}

export function Ownership({ owner, contributors }: OwnershipProps) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <span className={styles.headerLabel}>Quem responde</span>
      </div>

      <dl className={styles.list}>
        <div className={`${styles.row} ${styles.ownerRow}`}>
          <dt className={styles.tag}>
            <span className={styles.tagDot} aria-hidden="true" />
            Owner
          </dt>
          <dd className={styles.role}>{owner.role}</dd>
          <dd className={styles.focus}>{owner.focus}</dd>
        </div>

        {contributors.map((c, i) => (
          <div key={i} className={styles.row}>
            <dt className={styles.tag}>Colabora</dt>
            <dd className={styles.role}>{c.role}</dd>
            <dd className={styles.focus}>{c.focus}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
