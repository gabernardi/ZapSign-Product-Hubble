"use client";

import { useState } from "react";
import type {
  ChangelogAudience,
  DecoratedEntry,
} from "@/lib/data/changelog-review";
import styles from "./page.module.css";

const PAGE_SIZE = 20;

const ENTRY_DATE_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

function formatEntryDate(iso: string): string {
  const raw = ENTRY_DATE_FORMATTER.format(new Date(iso));
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

export function ChangelogView({
  entries,
  audience,
}: {
  entries: DecoratedEntry[];
  audience: ChangelogAudience;
}) {
  const [visible, setVisible] = useState(PAGE_SIZE);

  if (entries.length === 0) {
    return (
      <p className={styles.empty}>
        {audience === "public"
          ? "Nenhuma entrada publicada no changelog público ainda. Use a aba Debug para aprovar entradas como 'público' ou 'ambos'."
          : "Nenhuma entrada no changelog interno ainda. Use a aba Debug para aprovar entradas como 'interno' ou 'ambos'."}
      </p>
    );
  }

  const shown = entries.slice(0, visible);
  const remaining = entries.length - shown.length;

  return (
    <>
      {shown.map((entry) => (
        <article key={entry.id} className={styles.entry}>
          <time className={styles.entryDate} dateTime={entry.date}>
            {formatEntryDate(entry.date)}
          </time>
          <h2 className={styles.entryTitle}>{entry.displayTitle}</h2>
          {entry.displayDescription && (
            <p className={styles.entryText}>{entry.displayDescription}</p>
          )}
          {entry.displayImpact && (
            <p className={styles.entryText}>
              <strong className={styles.entryImpactLabel}>
                O que muda pra você:
              </strong>{" "}
              {entry.displayImpact}
            </p>
          )}
        </article>
      ))}

      {remaining > 0 && (
        <div className={styles.loadMoreRow}>
          <button
            type="button"
            className={styles.loadMore}
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
          >
            Carregar mais
            <span className={styles.loadMoreMeta}>
              {remaining}{" "}
              {remaining === 1 ? "entrada restante" : "entradas restantes"}
            </span>
          </button>
        </div>
      )}
    </>
  );
}
