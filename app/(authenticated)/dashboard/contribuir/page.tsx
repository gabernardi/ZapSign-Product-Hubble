import { Fraunces } from "next/font/google";
import { contribuirData as data } from "@/lib/data/contribuir";
import { GlasswingShell } from "@/components/glasswing/GlasswingShell";
import { GlasswingHero } from "@/components/glasswing/GlasswingHero";
import {
  EditorialSection,
  EditorialProse,
} from "@/components/glasswing/EditorialSection";
import { SceneBlock } from "@/components/glasswing/SceneBlock";
import { TableOfContents } from "@/components/glasswing/TableOfContents";
import { getGlasswingNav } from "@/lib/data/glasswing-nav";
import { Comments } from "@/components/comments/Comments";
import { loadPageCommentsForSsr } from "@/lib/comments/ssr";
import styles from "./page.module.css";

const PAGE_ID = "/dashboard/contribuir";

const SCOPE_COLOR: Record<string, string> = {
  Micro: "mint",
  Pequeno: "cyan",
  Médio: "peach",
  Grande: "lavender",
  Core: "peach",
  Aposta: "lavender",
};

const PRINCIPLE_COLORS = ["mint", "peach", "lavender"];
const TOOL_COLORS = ["cyan", "lavender", "mint", "peach"];

const tocItems = [
  { id: "catalogo", label: "Catálogo" },
  { id: "introducao", label: "Abertura" },
  { id: "principios", label: "Princípios" },
  { id: "possibilidades", label: "O que é possível" },
  { id: "passos", label: "Do clone ao deploy" },
  { id: "estrutura", label: "Onde estão as coisas" },
  { id: "ferramentas", label: "Ferramentas" },
  { id: "commits", label: "Commits" },
  { id: "faq", label: "FAQ" },
  { id: "suporte", label: "Suporte" },
];

const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
  axes: ["opsz", "SOFT"],
});

export const metadata = {
  title: "Laboratório · Hubble",
  description:
    "Espaço de experimentação do time de produto da ZapSign — do próximo experimento neste site a funcionalidades para o core de assinatura e apostas que podem virar unidade de negócio nova.",
};

export default async function ContribuirPage() {
  const threads = await loadPageCommentsForSsr(PAGE_ID);
  return (
    <div className={`${styles.page} ${fraunces.variable}`}>
      <Comments pageId={PAGE_ID} initialThreads={threads}>
      <GlasswingShell
        brand={data.topbar.brand}
        navItems={getGlasswingNav("contribuir")}
      >
        <TableOfContents items={tocItems} label="Neste guia" />

        <GlasswingHero
          eyebrow={data.hero.eyebrow}
          title={data.hero.title}
          subtitle={data.hero.subtitle}
          continueLabel={data.hero.continueLabel}
          continueHref="#catalogo"
          tone="lab"
        />

        <EditorialSection
          id="catalogo"
          label={data.experiments.label}
          eyebrow="01 · Catálogo"
          wide
        >
          <EditorialProse>
            <p data-comment-block="contribuir.catalogo.intro">
              {data.experiments.intro}
            </p>
          </EditorialProse>
          <ol className={styles.experiments}>
            {data.experiments.items.map((exp) => (
              <li key={exp.id} className={styles.experiment}>
                <div className={styles.experimentMeta}>
                  <code className={styles.experimentCode}>{exp.id}</code>
                  <span
                    className={`${styles.experimentStatus} ${styles[`status_${exp.status}`]}`}
                  >
                    <span
                      className={styles.experimentStatusDot}
                      aria-hidden="true"
                    />
                    {exp.statusLabel}
                  </span>
                </div>
                <div className={styles.experimentBody}>
                  <h3 className={styles.experimentTitle}>{exp.title}</h3>
                  <p className={styles.experimentHypothesis}>
                    {exp.hypothesis}
                  </p>
                  <footer className={styles.experimentFoot}>
                    <span className={styles.experimentLead}>
                      <span className={styles.experimentLeadLabel}>Lead</span>
                      {exp.lead}
                    </span>
                    <span
                      className={styles.experimentFootDivider}
                      aria-hidden="true"
                    >
                      ·
                    </span>
                    <span className={styles.experimentNote}>{exp.note}</span>
                    {exp.href && (
                      <a
                        className={styles.experimentLink}
                        href={exp.href}
                      >
                        {exp.hrefLabel ?? "Abrir"}
                        <span aria-hidden="true">→</span>
                      </a>
                    )}
                  </footer>
                </div>
              </li>
            ))}
          </ol>
        </EditorialSection>

        <EditorialSection
          id="introducao"
          label={data.introduction.label}
          eyebrow="02 · Abertura"
        >
          <EditorialProse>
            {data.introduction.paragraphs.map((p, i) => (
              <p key={i} data-comment-block={`contribuir.introducao.p${i + 1}`}>
                {p}
              </p>
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
            <p data-comment-block="contribuir.principios.intro">
              {data.principles.intro}
            </p>
          </EditorialProse>
          <div className={styles.principles}>
            {data.principles.items.map((p, i) => {
              const color = PRINCIPLE_COLORS[i % PRINCIPLE_COLORS.length];
              return (
                <article key={p.number} className={styles.principle}>
                  <div
                    className={`${styles.principleNumber} ${styles[`tone_${color}`]}`}
                  >
                    {p.number}
                  </div>
                  <div className={styles.principleBody}>
                    <h3 className={styles.principleTitle}>{p.title}</h3>
                    <p className={styles.principleText}>{p.body}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </EditorialSection>

        <EditorialSection
          id="possibilidades"
          label={data.possibilities.label}
          eyebrow="04 · Possibilidades"
          wide
        >
          <EditorialProse>
            <p data-comment-block="contribuir.possibilidades.intro">
              {data.possibilities.intro}
            </p>
          </EditorialProse>
          <div className={styles.possibilities}>
            {data.possibilities.items.map((item, i) => {
              const color = SCOPE_COLOR[item.scope] ?? "mint";
              return (
                <article key={i} className={styles.possibility}>
                  <span
                    className={`${styles.possibilityScope} ${styles[`scope_${color}`]}`}
                  >
                    <span className={styles.scopeDot} aria-hidden="true" />
                    {item.scope}
                  </span>
                  <h3 className={styles.possibilityTitle}>{item.title}</h3>
                  <p className={styles.possibilityBody}>{item.body}</p>
                </article>
              );
            })}
          </div>
        </EditorialSection>

        <SceneBlock
          kind="river"
          eyebrow={data.intermission.eyebrow}
          title={data.intermission.title}
          body={data.intermission.body}
        />

        <EditorialSection
          id="passos"
          label={data.steps.label}
          eyebrow="05 · Passo a passo"
          wide
        >
          <EditorialProse>
            <p data-comment-block="contribuir.passos.intro">
              {data.steps.intro}
            </p>
          </EditorialProse>
          <ol className={styles.steps}>
            {data.steps.items.map((step) => (
              <li key={step.number} className={styles.step}>
                <div className={styles.stepNumber}>{step.number}</div>
                <div className={styles.stepBody}>
                  <header className={styles.stepHead}>
                    <span className={styles.stepDuration}>{step.duration}</span>
                    <h3 className={styles.stepName}>{step.name}</h3>
                  </header>
                  <p className={styles.stepText}>{step.body}</p>
                  <ul className={styles.stepHighlights}>
                    {step.highlights.map((h, i) => (
                      <li key={i}>
                        <code className={styles.code}>{h}</code>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ol>
        </EditorialSection>

        <EditorialSection
          id="estrutura"
          label={data.structure.label}
          eyebrow="06 · Estrutura"
          wide
        >
          <EditorialProse>
            <p data-comment-block="contribuir.estrutura.intro">
              {data.structure.intro}
            </p>
          </EditorialProse>
          <div className={styles.locations}>
            {data.structure.locations.map((loc) => (
              <article key={loc.path} className={styles.location}>
                <header className={styles.locationHead}>
                  <span className={styles.locationKind}>{loc.kind}</span>
                  <h3 className={styles.locationArea}>{loc.area}</h3>
                </header>
                <code className={styles.locationPath}>{loc.path}</code>
                <p className={styles.locationBody}>{loc.body}</p>
              </article>
            ))}
          </div>
        </EditorialSection>

        <EditorialSection
          id="ferramentas"
          label={data.tools.label}
          eyebrow="07 · Ferramentas"
          wide
        >
          <EditorialProse>
            <p data-comment-block="contribuir.ferramentas.intro">
              {data.tools.intro}
            </p>
          </EditorialProse>
          <div className={styles.tools}>
            {data.tools.items.map((tool, i) => {
              const color = TOOL_COLORS[i % TOOL_COLORS.length];
              return (
                <article key={tool.name} className={styles.tool}>
                  <header className={styles.toolHead}>
                    <h3 className={styles.toolName}>
                      <span
                        className={`${styles.toolDot} ${styles[`tone_${color}`]}`}
                        aria-hidden="true"
                      />
                      {tool.name}
                    </h3>
                    <span className={styles.toolRole}>{tool.role}</span>
                  </header>
                  <p className={styles.toolBody}>{tool.body}</p>
                  <p className={styles.toolTip}>
                    <span className={styles.toolTipLabel}>Dica</span>
                    {tool.tip}
                  </p>
                </article>
              );
            })}
          </div>
        </EditorialSection>

        <EditorialSection
          id="commits"
          label={data.conventions.label}
          eyebrow="08 · Commits"
          wide
        >
          <EditorialProse>
            <p data-comment-block="contribuir.commits.intro">
              {data.conventions.intro}
            </p>
          </EditorialProse>
          <div className={styles.conventionsTable}>
            <div className={styles.conventionsHeader}>
              <span>Tipo</span>
              <span>Quando usar</span>
              <span>Exemplo</span>
            </div>
            {data.conventions.items.map((c) => (
              <div key={c.type} className={styles.conventionsRow}>
                <code className={styles.conventionType}>{c.type}</code>
                <span className={styles.conventionPurpose}>{c.purpose}</span>
                <code className={styles.conventionExample}>{c.example}</code>
              </div>
            ))}
          </div>
        </EditorialSection>

        <EditorialSection
          id="faq"
          label={data.faq.label}
          eyebrow="09 · FAQ"
          wide
        >
          <div className={styles.faq}>
            {data.faq.items.map((item, i) => (
              <article key={i} className={styles.faqItem}>
                <h3 className={styles.faqQuestion}>{item.question}</h3>
                <p className={styles.faqAnswer}>{item.answer}</p>
              </article>
            ))}
          </div>
        </EditorialSection>

        <EditorialSection
          id="suporte"
          label={data.support.label}
          eyebrow="10 · Suporte"
        >
          <EditorialProse>
            {data.support.paragraphs.map((p, i) => (
              <p key={i} data-comment-block={`contribuir.suporte.p${i + 1}`}>
                {p}
              </p>
            ))}
          </EditorialProse>
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
      </Comments>
    </div>
  );
}
