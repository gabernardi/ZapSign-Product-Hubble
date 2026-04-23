"use client";

import { useState } from "react";
import styles from "./QuoteCarousel.module.css";

interface Quote {
  body: string;
  role: string;
  context: string;
}

interface QuoteCarouselProps {
  quotes: Quote[];
}

export function QuoteCarousel({ quotes }: QuoteCarouselProps) {
  const [index, setIndex] = useState(0);
  const total = quotes.length;
  const current = quotes[index];

  const go = (delta: number) => {
    setIndex((prev) => (prev + delta + total) % total);
  };

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className={styles.carousel}>
      <div className={styles.counter}>
        <span className={styles.counterCurrent}>{pad(index + 1)}</span>
        <span className={styles.counterSep}>/</span>
        <span className={styles.counterTotal}>{pad(total)}</span>
      </div>

      <blockquote key={index} className={styles.quote}>
        <p
          className={styles.body}
          data-comment-block={`quote.${index}.body`}
        >
          &ldquo;{current.body}&rdquo;
        </p>
        <footer className={styles.attribution}>
          <span
            className={styles.role}
            data-comment-block={`quote.${index}.role`}
          >
            {current.role}
          </span>
          <span
            className={styles.context}
            data-comment-block={`quote.${index}.context`}
          >
            {current.context}
          </span>
        </footer>
      </blockquote>

      <div className={styles.controls}>
        <button
          type="button"
          className={styles.navButton}
          onClick={() => go(-1)}
          aria-label="Voz anterior"
        >
          <span aria-hidden="true">←</span>
        </button>
        <div className={styles.dots} role="tablist" aria-label="Selecionar voz">
          {quotes.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Voz ${i + 1} de ${total}`}
              className={`${styles.dot} ${i === index ? styles.dotActive : ""}`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
        <button
          type="button"
          className={styles.navButton}
          onClick={() => go(1)}
          aria-label="Próxima voz"
        >
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  );
}
