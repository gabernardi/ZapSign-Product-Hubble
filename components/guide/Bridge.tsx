import styles from "./Bridge.module.css";

interface BridgeProps {
  label: string;
  children: React.ReactNode;
}

export function Bridge({ label, children }: BridgeProps) {
  return (
    <div className={styles.bridge}>
      <div className={styles.arrow}>↓</div>
      <div>
        <div className={styles.label}>{label}</div>
        <div className={styles.text}>{children}</div>
      </div>
    </div>
  );
}
