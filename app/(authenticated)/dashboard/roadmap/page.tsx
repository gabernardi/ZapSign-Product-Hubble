"use client";

import { useState } from "react";
import Link from "next/link";
import {
  QUARTERS,
  type RoadmapQuarter,
  type RoadmapItem,
  type RoadmapSection,
  type RoadmapGroup,
} from "@/lib/data/roadmap";
import { OPPORTUNITIES } from "@/lib/data/opportunities";
import styles from "./roadmap.module.css";

function Chevron() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
      <path
        d="M2.5 3.75L5 6.25l2.5-2.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function OppDrawer({ ids, open }: { ids: string[]; open: boolean }) {
  const opps = ids.map((id) => OPPORTUNITIES[id]).filter(Boolean);
  if (!opps.length) return null;

  return (
    <div className={`${styles.oppDrawer} ${open ? styles.open : ""}`}>
      <div className={styles.oppDrawerInner}>
        <div className={styles.oppList}>
          {opps.map((o) => (
            <div key={o.id} className={styles.oppCard}>
              <div className={styles.oppHead}>
                <span className={styles.oppId}>{o.id}</span>
                <span className={styles.oppOutcome}>{o.outcome}</span>
              </div>
              <p className={styles.oppDesc}>{o.description}</p>
              <div className={styles.oppKvs}>
                {(
                  [
                    ["Segmento", o.segment],
                    ["Motion", o.motion],
                    ["Fonte", o.source],
                    ["Prioridade", o.priority],
                  ] as const
                ).map(([label, value]) => (
                  <div key={label} className={styles.oppKv}>
                    <span className={styles.oppKvLabel}>{label}</span>
                    <span className={styles.oppKvValue}>{value}</span>
                  </div>
                ))}
              </div>
              {o.evidence && <p className={styles.oppEvidence}>{o.evidence}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Item({ item }: { item: RoadmapItem }) {
  const [open, setOpen] = useState(false);
  const hasOpps = !!item.opportunityIds?.length;

  return (
    <div className={styles.item}>
      <div className={styles.itemTitle}>{item.title}</div>
      <div className={styles.itemDesc}>{item.description}</div>

      {(item.owner || item.caveat) && (
        <div className={styles.itemMeta}>
          {item.owner && <span className={styles.owner}>{item.owner}</span>}
          {item.caveat && <span className={styles.caveat}>{item.caveat}</span>}
        </div>
      )}

      {hasOpps && (
        <button
          className={`${styles.oppToggle} ${open ? styles.open : ""}`}
          onClick={() => setOpen((p) => !p)}
        >
          <Chevron />
          {item.opportunityIds!.length} oportunidade
          {item.opportunityIds!.length > 1 ? "s" : ""}
        </button>
      )}

      {hasOpps && <OppDrawer ids={item.opportunityIds!} open={open} />}
    </div>
  );
}

function Column({ group }: { group: RoadmapGroup }) {
  return (
    <div className={`${styles.col} ${styles[group.id]}`}>
      <div className={styles.colHeader}>
        <span className={styles.colName}>
          {group.id === "downstream" ? "Downstream" : "Upstream"}
        </span>
      </div>
      <div className={styles.items}>
        {group.items.map((item) => (
          <Item key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

function SectionBlock({ section }: { section: RoadmapSection }) {
  return (
    <section className={`${styles.section} animate-fade-up`}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{section.title}</h2>
        <p className={styles.sectionNarrative}>{section.narrative}</p>
      </div>
      <div
        className={`${styles.sectionGrid} ${section.groups.length === 1 ? styles.single : ""}`}
      >
        {section.groups.map((g) => (
          <Column key={g.id} group={g} />
        ))}
      </div>
    </section>
  );
}

function ComplianceBlock({
  items,
}: {
  items: { id: string; title: string; description: string }[];
}) {
  if (!items.length) return null;
  return (
    <div className={`${styles.compliance} animate-fade-up`}>
      <div className={styles.complianceLabel}>Obrigatório</div>
      <div className={styles.complianceList}>
        {items.map((c) => (
          <div key={c.id} className={styles.complianceRow}>
            <span className={styles.complianceName}>{c.title}</span>
            <span className={styles.complianceSep}> — </span>
            {c.description}
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyQuarter({ quarter }: { quarter: RoadmapQuarter }) {
  return (
    <div className={styles.emptyState}>
      <p className={styles.emptyTitle}>
        {quarter.label} &middot; {quarter.period}
      </p>
      <p className={styles.emptyDesc}>Planejamento ainda não definido.</p>
    </div>
  );
}

export default function RoadmapPage() {
  const [activeId, setActiveId] = useState(
    () => QUARTERS.find((q) => q.active)?.id || QUARTERS[0].id
  );
  const quarter = QUARTERS.find((q) => q.id === activeId)!;
  const hasContent =
    quarter.compliance.length > 0 || quarter.sections.length > 0;

  return (
    <div className={styles.page}>
      <header className={`${styles.header} animate-fade-up`}>
        <div className={styles.breadcrumb}>
          <Link href="/dashboard">Dashboard</Link>
          <span className={styles.breadcrumbSep}>/</span>
          <span>Roadmap</span>
        </div>
        <h1 className={styles.title}>Roadmap {quarter.label}</h1>
        <p className={styles.period}>{quarter.period}</p>
      </header>

      <nav className={`${styles.quarterNav} animate-fade-up`}>
        {QUARTERS.map((q) => {
          const empty =
            q.compliance.length === 0 && q.sections.length === 0;
          return (
            <button
              key={q.id}
              className={`${styles.quarterTab} ${q.id === activeId ? styles.active : ""} ${empty && q.id !== activeId ? styles.disabled : ""}`}
              onClick={() => {
                if (!empty || q.id === activeId) setActiveId(q.id);
              }}
            >
              {q.label}
            </button>
          );
        })}
      </nav>

      {hasContent ? (
        <div className="animate-fade-up">
          {quarter.summary && (
            <p className={styles.summary}>{quarter.summary}</p>
          )}

          <ComplianceBlock items={quarter.compliance} />

          <div className={styles.sections}>
            {quarter.sections.map((s) => (
              <SectionBlock key={s.id} section={s} />
            ))}
          </div>
        </div>
      ) : (
        <EmptyQuarter quarter={quarter} />
      )}
    </div>
  );
}
