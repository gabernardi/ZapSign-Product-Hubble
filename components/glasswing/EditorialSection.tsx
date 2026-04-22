import styles from "./EditorialSection.module.css";

interface EditorialSectionProps {
  label: string;
  id?: string;
  wide?: boolean;
  eyebrow?: string;
  children: React.ReactNode;
}

export function EditorialSection({
  label,
  id,
  wide = false,
  eyebrow,
  children,
}: EditorialSectionProps) {
  return (
    <section id={id} className={styles.band}>
      <div className={`${styles.inner} ${wide ? styles.wide : ""}`}>
        <header className={styles.header}>
          {eyebrow && <span className={styles.eyebrow}>{eyebrow}</span>}
          <h2 className={styles.title}>{label}</h2>
        </header>
        <div className={styles.body}>{children}</div>
      </div>
    </section>
  );
}

export function EditorialProse({ children }: { children: React.ReactNode }) {
  return <div className={styles.prose}>{children}</div>;
}
