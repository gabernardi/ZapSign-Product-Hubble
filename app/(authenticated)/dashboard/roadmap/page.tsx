import { Fraunces } from "next/font/google";
import { roadmapGlasswingData as data } from "@/lib/data/roadmap-glasswing";
import { GlasswingShell } from "@/components/glasswing/GlasswingShell";
import { GlasswingHero } from "@/components/glasswing/GlasswingHero";
import {
  EditorialSection,
  EditorialProse,
} from "@/components/glasswing/EditorialSection";
import { SceneBlock } from "@/components/glasswing/SceneBlock";
import { Footnotes } from "@/components/glasswing/Footnotes";
import { TableOfContents } from "@/components/glasswing/TableOfContents";
import { QuarterStrip } from "@/components/glasswing/QuarterStrip";
import { SquadBlock } from "@/components/glasswing/SquadBlock";
import { PlatformProgress } from "@/components/glasswing/PlatformProgress";
import { getGlasswingNav } from "@/lib/data/glasswing-nav";
import styles from "./page.module.css";

const tocItems = [
  { id: "introducao", label: "Abertura" },
  { id: "contexto", label: "O momento" },
  { id: "principios", label: "Princípios" },
  { id: "ano", label: "O ano" },
  { id: "squads", label: "Squads" },
  { id: "plataforma", label: "Plataforma v2" },
  { id: "appendix", label: "Appendix" },
];

const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
  axes: ["opsz", "SOFT"],
});

export const metadata = {
  title: "Roadmap · Hubble",
  description:
    "Roadmap trimestral da ZapSign: squads, metas e status dos projetos em execução.",
};

export default function RoadmapPage() {
  return (
    <div className={`${styles.page} ${fraunces.variable}`}>
      <GlasswingShell
        brand={data.topbar.brand}
        navItems={getGlasswingNav("roadmap", "2T26")}
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
          eyebrow="02 · O momento"
        >
          <EditorialProse>
            {data.context.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </EditorialProse>
        </EditorialSection>

        <EditorialSection
          id="principios"
          label={data.principles.label}
          eyebrow="03 · Princípios"
          wide
        >
          <EditorialProse>
            <p>{data.principles.intro}</p>
          </EditorialProse>
          <div className={styles.phases}>
            {data.principles.items.map((p) => (
              <article key={p.number} className={styles.phase}>
                <div className={styles.phaseNumber}>{p.number}</div>
                <div className={styles.phaseBody}>
                  <header className={styles.phaseHead}>
                    <span className={styles.phaseDuration}>{p.duration}</span>
                    <h3 className={styles.phaseName}>{p.name}</h3>
                  </header>
                  <p className={styles.phaseText}>{p.body}</p>
                  <ul className={styles.phaseHighlights}>
                    {p.highlights.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </EditorialSection>

        <SceneBlock
          kind={data.intermission.kind}
          eyebrow={data.intermission.eyebrow}
          title={data.intermission.title}
          body={data.intermission.body}
        />

        <EditorialSection
          id="ano"
          label={data.quarters.label}
          eyebrow="04 · O ano"
          wide
        >
          <EditorialProse>
            <p>{data.quarters.intro}</p>
          </EditorialProse>
          <QuarterStrip items={data.quarters.items} />
        </EditorialSection>

        <EditorialSection
          id="squads"
          label={data.squadsSection.label}
          eyebrow="05 · Squads"
          wide
        >
          <EditorialProse>
            <p>{data.squadsSection.intro}</p>
          </EditorialProse>
          <div className={styles.squads}>
            {data.squadsSection.items.map((squad, i) => (
              <SquadBlock
                key={squad.id}
                id={`squad-${squad.id}`}
                number={String(i + 1).padStart(2, "0")}
                name={squad.name}
                context={squad.context}
                people={squad.people}
                goals={squad.goals}
                projects={squad.projects}
              />
            ))}
          </div>
        </EditorialSection>

        <EditorialSection
          id="plataforma"
          label={data.platform.label}
          eyebrow="06 · Plataforma v2"
          wide
        >
          <EditorialProse>
            <p>{data.platform.intro}</p>
          </EditorialProse>
          <PlatformProgress flows={data.platform.flows} />
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
