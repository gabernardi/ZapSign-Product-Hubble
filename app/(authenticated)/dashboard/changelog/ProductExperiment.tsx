"use client";

import { useMemo, useState } from "react";
import {
  isVisibleIn,
  type DecoratedEntry,
} from "@/lib/data/changelog-review";
import { ChangelogView } from "./ChangelogView";
import { DebugPanel } from "./DebugPanel";
import styles from "./page.module.css";

type Tab = "public" | "internal" | "debug";

export function ProductExperiment({
  entries,
  generatedAt,
}: {
  entries: DecoratedEntry[];
  generatedAt: string;
}) {
  const [tab, setTab] = useState<Tab>("public");

  const stats = useMemo(() => {
    let approved = 0;
    let rejected = 0;
    let pending = 0;
    let publicCount = 0;
    let internalCount = 0;
    for (const e of entries) {
      if (e.review.status === "approved") {
        approved++;
        if (isVisibleIn(e.review, "public")) publicCount++;
        if (isVisibleIn(e.review, "internal")) internalCount++;
      } else if (e.review.status === "rejected") {
        rejected++;
      } else {
        pending++;
      }
    }
    return {
      approved,
      rejected,
      pending,
      publicCount,
      internalCount,
      total: entries.length,
    };
  }, [entries]);

  const publicEntries = useMemo(
    () => entries.filter((e) => isVisibleIn(e.review, "public")),
    [entries],
  );
  const internalEntries = useMemo(
    () => entries.filter((e) => isVisibleIn(e.review, "internal")),
    [entries],
  );

  return (
    <div className={styles.product}>
      <header className={styles.productHeader}>
        <div className={styles.productCrumb}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/zapsign-logo.svg"
            alt="ZapSign"
            className={styles.productLogo}
          />
          <span className={styles.productCrumbSep} aria-hidden="true">
            /
          </span>
          <span className={styles.productCrumbLabel}>Changelog</span>
        </div>

        <nav className={styles.productTabs} aria-label="Seções">
          <button
            type="button"
            className={`${styles.productTab} ${tab === "public" ? styles.productTabActive : ""}`}
            onClick={() => setTab("public")}
          >
            Público
            <span className={styles.productTabBadge}>{stats.publicCount}</span>
          </button>
          <button
            type="button"
            className={`${styles.productTab} ${tab === "internal" ? styles.productTabActive : ""}`}
            onClick={() => setTab("internal")}
          >
            Interno
            <span className={styles.productTabBadge}>
              {stats.internalCount}
            </span>
          </button>
          <button
            type="button"
            className={`${styles.productTab} ${tab === "debug" ? styles.productTabActive : ""}`}
            onClick={() => setTab("debug")}
          >
            Debug
            {stats.pending > 0 && (
              <span
                className={`${styles.productTabBadge} ${styles.productTabBadgePending}`}
              >
                {stats.pending} pendente
                {stats.pending === 1 ? "" : "s"}
              </span>
            )}
          </button>
        </nav>

        {tab === "public" ? (
          <>
            <h1 className={styles.productTitle}>Novidades para clientes</h1>
            <p className={styles.productSubtitle}>
              Mudanças e melhorias do ZapSign que chegam até você, em ordem
              cronológica.
            </p>
          </>
        ) : tab === "internal" ? (
          <>
            <h1 className={styles.productTitle}>Novidades do produto</h1>
            <p className={styles.productSubtitle}>
              Visão interna do time ZapSign: tudo que foi para produção, inclusive
              o que não é comunicado publicamente.
            </p>
          </>
        ) : (
          <>
            <h1 className={styles.productTitle}>Curadoria</h1>
            <p className={styles.productSubtitle}>
              Para cada entrada: aprove, escolha onde publicar (público, interno
              ou ambos), edite o texto ou rejeite. {stats.total} entradas da IA ·{" "}
              {stats.approved} aprovada{stats.approved === 1 ? "" : "s"} ·{" "}
              {stats.pending} pendente{stats.pending === 1 ? "" : "s"} ·{" "}
              {stats.rejected} rejeitada{stats.rejected === 1 ? "" : "s"}.
            </p>
          </>
        )}
      </header>

      <main
        id="entradas"
        className={`${styles.entries} ${tab === "debug" ? styles.entriesWide : ""}`}
      >
        {tab === "public" ? (
          <ChangelogView entries={publicEntries} audience="public" />
        ) : tab === "internal" ? (
          <ChangelogView entries={internalEntries} audience="internal" />
        ) : (
          <DebugPanel entries={entries} stats={stats} />
        )}
      </main>

      <footer className={styles.footer}>
        <span className={styles.footerBrand}>ZapSign</span>
        <span className={styles.footerMeta}>Atualizado em {generatedAt}</span>
      </footer>
    </div>
  );
}
