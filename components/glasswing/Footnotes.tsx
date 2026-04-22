import styles from "./Footnotes.module.css";

interface FootnoteItem {
  number: string;
  html: string;
}

interface FootnotesProps {
  items: FootnoteItem[];
}

export function Footnotes({ items }: FootnotesProps) {
  return (
    <ol className={styles.list}>
      {items.map((item) => (
        <li key={item.number} className={styles.item} id={`fn-${item.number}`}>
          <span className={styles.number}>{item.number}</span>
          <span
            className={styles.body}
            dangerouslySetInnerHTML={{ __html: item.html }}
          />
        </li>
      ))}
    </ol>
  );
}
