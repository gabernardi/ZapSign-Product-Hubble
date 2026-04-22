"use client";

import { useEffect, useState } from "react";
import styles from "./TableOfContents.module.css";

interface TocItem {
  id: string;
  label: string;
}

interface TableOfContentsProps {
  items: TocItem[];
  label?: string;
}

export function TableOfContents({
  items,
  label = "Neste guia",
}: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>(items[0]?.id ?? "");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const targets = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);

    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => {
            const aTop = a.boundingClientRect.top;
            const bTop = b.boundingClientRect.top;
            return aTop - bTop;
          });

        if (visible.length > 0 && visible[0].target.id) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: "-20% 0px -70% 0px",
        threshold: 0,
      },
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [items]);

  const handleClick =
    (id: string) => (event: React.MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      const el = document.getElementById(id);
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY - 64;
      window.scrollTo({ top, behavior: "smooth" });
      setActiveId(id);
    };

  return (
    <nav className={styles.toc} aria-label={label}>
      <span className={styles.label}>{label}</span>
      <ol className={styles.list}>
        {items.map((item, i) => {
          const isActive = item.id === activeId;
          return (
            <li key={item.id} className={styles.item}>
              <a
                href={`#${item.id}`}
                onClick={handleClick(item.id)}
                className={`${styles.link} ${isActive ? styles.active : ""}`}
              >
                <span className={styles.index}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className={styles.text}>{item.label}</span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
