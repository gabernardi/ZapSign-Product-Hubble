import styles from "./SectionLabel.module.css";

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.label}>
      {children}
    </div>
  );
}
