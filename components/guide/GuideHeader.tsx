import styles from "./GuideHeader.module.css";

interface GuideHeaderProps {
  pill: string;
  title: string;
  description: string;
  meta: {
    label: string;
    detail: string;
  };
}

export function GuideHeader({ pill, title, description, meta }: GuideHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div>
          <div className={styles.pill}>
            <span className={styles.dot} />
            {pill}
          </div>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.desc}>{description}</p>
        </div>
        <div className={styles.meta}>
          <strong>{meta.label}</strong>
          <span dangerouslySetInnerHTML={{ __html: meta.detail }} />
        </div>
      </div>
    </header>
  );
}
