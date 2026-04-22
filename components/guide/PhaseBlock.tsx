import styles from "./PhaseBlock.module.css";

interface PhaseBlockProps {
  phase: string;
  color: "blue" | "amber" | "green" | "deep";
  title: string;
  subtitle: string;
  zone?: string;
  owner?: string;
  support?: string;
}

export function PhaseBlock({
  phase,
  color,
  title,
  subtitle,
  zone,
  owner,
  support,
}: PhaseBlockProps) {
  const hasOwnership = zone || owner || support;

  return (
    <div className={styles.block}>
      <div className={styles.row}>
        <div className={`${styles.chip} ${styles[color]}`}>{phase}</div>
        <div className={styles.line} />
      </div>
      <div className={styles.title}>{title}</div>
      <div className={styles.sub}>{subtitle}</div>

      {hasOwnership && (
        <div className={styles.ownership}>
          {zone && (
            <span className={`${styles.ownItem} ${styles.ownItemPrimary}`}>
              <span className={styles.ownKey}>Zona</span>
              <span className={styles.ownVal}>{zone}</span>
            </span>
          )}
          {owner && (
            <span className={styles.ownItem}>
              <span className={styles.ownKey}>Owner</span>
              <span className={styles.ownVal}>{owner}</span>
            </span>
          )}
          {support && (
            <span className={styles.ownItem}>
              <span className={styles.ownKey}>Apoio</span>
              <span className={styles.ownVal}>{support}</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
