import { Fraunces } from "next/font/google";
import { downstreamGlasswingData as data } from "@/lib/data/downstream-glasswing";
import { GlasswingShell } from "@/components/glasswing/GlasswingShell";
import { GlasswingHero } from "@/components/glasswing/GlasswingHero";
import {
  EditorialSection,
  EditorialProse,
} from "@/components/glasswing/EditorialSection";
import { SceneBlock } from "@/components/glasswing/SceneBlock";
import { StakeholderGrid } from "@/components/glasswing/StakeholderGrid";
import { StatBar } from "@/components/glasswing/StatBar";
import { TimelineChart } from "@/components/glasswing/TimelineChart";
import { QuoteCarousel } from "@/components/glasswing/QuoteCarousel";
import { Footnotes } from "@/components/glasswing/Footnotes";
import { TableOfContents } from "@/components/glasswing/TableOfContents";
import { PhaseOwnership } from "@/components/glasswing/PhaseOwnership";
import { getGlasswingNav } from "@/lib/data/glasswing-nav";
import styles from "./page.module.css";

const tocItems = [
  { id: "introducao", label: "Abertura" },
  { id: "contexto", label: "Contexto" },
  { id: "fases", label: "As fases" },
  { id: "participantes", label: "Quem participa" },
  { id: "dados", label: "Evidência" },
  { id: "vozes", label: "Vozes" },
  { id: "planos", label: "Compromissos" },
  { id: "appendix", label: "Appendix" },
];

const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
  axes: ["opsz", "SOFT"],
});

export const metadata = {
  title: "Downstream · Hubble",
  description:
    "Guia do processo Downstream da ZapSign: como o trio executa, lança e aprende com o que foi construído.",
};

export default function DownstreamPage() {
  return (
    <div className={`${styles.page} ${fraunces.variable}`}>
      <GlasswingShell
        brand={data.topbar.brand}
        navItems={getGlasswingNav("downstream")}
      >
        <TableOfContents items={tocItems} label="Neste guia" />
        <GlasswingHero
          eyebrow={data.hero.eyebrow}
          title={data.hero.title}
          subtitle={data.hero.subtitle}
          continueLabel={data.hero.continueLabel}
          continueHref="#introducao"
        />

        <EditorialSection
          id="introducao"
          label={data.introduction.label}
          eyebrow="01 · Abertura"
        >
          <EditorialProse>
            {data.introduction.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </EditorialProse>
        </EditorialSection>

        <EditorialSection
          id="contexto"
          label={data.context.label}
          eyebrow="02 · Contexto"
        >
          <EditorialProse>
            {data.context.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </EditorialProse>
        </EditorialSection>

        <SceneBlock
          kind={data.intermission.kind}
          eyebrow={data.intermission.eyebrow}
          title={data.intermission.title}
          body={data.intermission.body}
        />

        <EditorialSection
          id="fases"
          label={data.phases.label}
          eyebrow="03 · As fases"
          wide
        >
          <EditorialProse>
            <p>{data.phases.intro}</p>
          </EditorialProse>
          <div className={styles.phases}>
            {data.phases.items.map((phase) => (
              <article key={phase.number} className={styles.phase}>
                <div className={styles.phaseNumber}>{phase.number}</div>
                <div className={styles.phaseBody}>
                  <header className={styles.phaseHead}>
                    <span className={styles.phaseDuration}>
                      {phase.duration}
                    </span>
                    <h3 className={styles.phaseName}>{phase.name}</h3>
                  </header>
                  <p className={styles.phaseText}>{phase.body}</p>
                  <ul className={styles.phaseHighlights}>
                    {phase.highlights.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                  {phase.ownership && (
                    <PhaseOwnership
                      owner={phase.ownership.owner}
                      contributors={phase.ownership.contributors}
                    />
                  )}
                </div>
              </article>
            ))}
          </div>
        </EditorialSection>

        <StakeholderGrid
          id="participantes"
          eyebrow={data.stakeholders.eyebrow}
          title={data.stakeholders.title}
          description={data.stakeholders.description}
          items={data.stakeholders.items}
        />

        <EditorialSection
          id="dados"
          label={data.benchmarks.label}
          eyebrow="04 · Evidência"
          wide
        >
          <EditorialProse>
            <p>{data.benchmarks.intro}</p>
          </EditorialProse>
          <TimelineChart
            title={data.benchmarks.timeline.title}
            description={data.benchmarks.timeline.description}
            series={data.benchmarks.timeline.points}
            unit={data.benchmarks.timeline.unit}
          />
          {data.benchmarks.blocks.map((block) => (
            <StatBar
              key={block.title}
              title={block.title}
              description={block.description}
              series={block.series}
              unit={block.unit}
            />
          ))}
        </EditorialSection>

        <EditorialSection
          id="vozes"
          label={data.voices.label}
          eyebrow="05 · Vozes"
        >
          <EditorialProse>
            <p>{data.voices.intro}</p>
          </EditorialProse>
          <QuoteCarousel quotes={data.voices.quotes} />
        </EditorialSection>

        <EditorialSection
          id="planos"
          label={data.plans.label}
          eyebrow="06 · Compromissos"
        >
          <EditorialProse>
            <p>{data.plans.intro}</p>
          </EditorialProse>
          <div className={styles.plans}>
            {data.plans.items.map((item) => (
              <article key={item.number} className={styles.plan}>
                <div className={styles.planNumber}>{item.number}</div>
                <div className={styles.planBody}>
                  <h3 className={styles.planTitle}>{item.title}</h3>
                  <p className={styles.planText}>{item.body}</p>
                </div>
              </article>
            ))}
          </div>
        </EditorialSection>

        <EditorialSection
          id="appendix"
          label={data.appendix.label}
          eyebrow="Appendix"
        >
          <Footnotes items={data.appendix.footnotes} />
        </EditorialSection>

        <footer className={styles.footer}>
          <div className={styles.footerInner}>
            <p className={styles.footerQuote}>
              &ldquo;{data.footer.quote}&rdquo;
            </p>
            <div className={styles.footerMeta}>
              <span className={styles.footerBrand}>{data.footer.brand}</span>
              <span>{data.footer.meta}</span>
            </div>
          </div>
        </footer>
      </GlasswingShell>
    </div>
  );
}
