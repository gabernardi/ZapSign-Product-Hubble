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
            data-comment-block={`footnote.${item.number}`}
            dangerouslySetInnerHTML={{ __html: item.html }}
          />
        </li>
      ))}
    </ol>
  );
}
