import styles from "./GuideFooter.module.css";

interface GuideFooterProps {
  quote: string;
  brand: string;
}

export function GuideFooter({ quote, brand }: GuideFooterProps) {
  return (
    <footer className={styles.footer}>
      <div className={styles.quote}>{quote}</div>
      <span className={styles.brand}>{brand}</span>
    </footer>
  );
}
