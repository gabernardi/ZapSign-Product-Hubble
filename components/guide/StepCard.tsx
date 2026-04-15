import styles from "./StepCard.module.css";

interface StepCardProps {
  stepNumber: number;
  stepLabel: string;
  timeChip: string;
  title: string;
  description: string;
  children: React.ReactNode;
  output: string;
  isLast?: boolean;
}

export function StepCard({
  stepNumber,
  stepLabel,
  timeChip,
  title,
  description,
  children,
  output,
  isLast = false,
}: StepCardProps) {
  return (
    <div className={styles.step}>
      <div className={styles.left}>
        <div className={styles.num}>{stepNumber}</div>
        {!isLast && <div className={styles.connector} />}
      </div>
      <div className={styles.body}>
        <div className={styles.card}>
          <div className={styles.meta}>
            <span className={styles.tag}>{stepLabel}</span>
            <span className={styles.time}>{timeChip}</span>
          </div>
          <div className={styles.title}>{title}</div>
          <p className={styles.desc}>{description}</p>

          {children}

          <div className={styles.output}>
            <div className={styles.outputIcon}>
              <svg viewBox="0 0 16 16" fill="none" width="12" height="12">
                <path
                  d="M13.3 4.7L6 12 2.7 8.7l1.1-1 2.2 2.2 6.3-6.3 1 1z"
                  fill="#137333"
                />
              </svg>
            </div>
            <span className={styles.outputLabel}>{output}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
