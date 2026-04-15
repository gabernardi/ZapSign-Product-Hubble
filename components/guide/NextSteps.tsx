import Link from "next/link";
import styles from "./NextSteps.module.css";

interface NextStepItem {
  number: string;
  title: string;
  description: string;
  isLink?: boolean;
  href?: string;
}

interface NextStepsProps {
  chip: string;
  title: string;
  subtitle: string;
  items: NextStepItem[];
}

export function NextSteps({ chip, title, subtitle, items }: NextStepsProps) {
  return (
    <div className={styles.container}>
      <div className={styles.top}>
        <div className={styles.chip}>{chip}</div>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.subtitle}>{subtitle}</p>
      </div>
      <div className={styles.items}>
        {items.map((item, i) => {
          const isLast = item.isLink && item.href;
          return (
            <div
              key={i}
              className={`${styles.item} ${isLast ? styles.itemLink : ""}`}
            >
              <div className={styles.num}>{item.number}</div>
              <div className={styles.content}>
                <div className={styles.itemTitle}>{item.title}</div>
                <p className={styles.desc}>{item.description}</p>
              </div>
              {isLast && (
                <Link href={item.href!} className={styles.arrow}>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                  >
                    <path
                      d="M4.167 10h11.666M11.667 5.833 15.833 10l-4.166 4.167"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
