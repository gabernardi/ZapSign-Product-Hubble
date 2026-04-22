import styles from "./PhaseOwnership.module.css";

interface Person {
  role: string;
  focus: string;
}

interface PhaseOwnershipProps {
  owner: Person;
  contributors?: Person[];
}

export function PhaseOwnership({ owner, contributors = [] }: PhaseOwnershipProps) {
  return (
    <div className={styles.wrap}>
      <div className={styles.block}>
        <span className={styles.label}>Owner</span>
        <div className={styles.ownerRow}>
          <span className={styles.role}>{owner.role}</span>
          <span className={styles.focus}>{owner.focus}</span>
        </div>
      </div>

      {contributors.length > 0 && (
        <div className={styles.block}>
          <span className={styles.label}>Co-responsáveis</span>
          <ul className={styles.list}>
            {contributors.map((person, i) => (
              <li key={i} className={styles.item}>
                <span className={styles.roleInline}>{person.role}</span>
                <span className={styles.sep} aria-hidden="true">
                  ·
                </span>
                <span className={styles.focusInline}>{person.focus}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
