import styles from "./FidelityLadder.module.css";

interface FidelityStep {
  label: string;
  description: string;
}

interface FidelityLadderProps {
  steps: FidelityStep[];
}

export function FidelityLadder({ steps }: FidelityLadderProps) {
  return (
    <div className={styles.ladder}>
      {steps.map((step, i) => (
        <div key={i} className={styles.step}>
          <div className={styles.label}>{step.label}</div>
          <div className={styles.desc}>{step.description}</div>
        </div>
      ))}
    </div>
  );
}
