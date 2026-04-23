import { Fraunces } from "next/font/google";
import { rolesGlasswingData as data } from "@/lib/data/roles-glasswing";
import { GlasswingShell } from "@/components/glasswing/GlasswingShell";
import { GlasswingHero } from "@/components/glasswing/GlasswingHero";
import {
  EditorialSection,
  EditorialProse,
} from "@/components/glasswing/EditorialSection";
import { SceneBlock } from "@/components/glasswing/SceneBlock";
import { StakeholderGrid } from "@/components/glasswing/StakeholderGrid";
import { DecisionMatrix } from "@/components/glasswing/DecisionMatrix";
import { QuoteCarousel } from "@/components/glasswing/QuoteCarousel";
import { Footnotes } from "@/components/glasswing/Footnotes";
import { TableOfContents } from "@/components/glasswing/TableOfContents";
import { RolesTable } from "@/components/glasswing/RolesTable";
import { getGlasswingNav } from "@/lib/data/glasswing-nav";
import { Comments } from "@/components/comments/Comments";
import { loadPageCommentsForSsr } from "@/lib/comments/ssr";
import styles from "./page.module.css";

const PAGE_ID = "/dashboard/papeis";

const tocItems = [
  { id: "introducao", label: "Abertura" },
  { id: "contexto", label: "Contexto" },
  { id: "papeis", label: "Os papéis" },
  { id: "extensao", label: "Quem mais aparece" },
  { id: "fronteiras", label: "Fronteiras" },
  { id: "vozes", label: "Vozes" },
  { id: "contratos", label: "Contratos" },
  { id: "appendix", label: "Appendix" },
];

const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
  axes: ["opsz", "SOFT"],
});

export const metadata = {
  title: "Papéis & Responsabilidades · Hubble",
  description:
    "Guia de papéis e responsabilidades do time de produto da ZapSign: PM, Product Designer, Tech Lead, Engineering Manager e Engineers.",
};

export default async function PapeisPage() {
  const threads = await loadPageCommentsForSsr(PAGE_ID);
  return (
    <div className={`${styles.page} ${fraunces.variable}`}>
      <Comments pageId={PAGE_ID} initialThreads={threads}>
        <GlasswingShell
          brand={data.topbar.brand}
          navItems={getGlasswingNav("papeis")}
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
                <p key={i} data-comment-block={`papeis.introducao.p${i + 1}`}>
                  {p}
                </p>
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
                <p key={i} data-comment-block={`papeis.contexto.p${i + 1}`}>
                  {p}
                </p>
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
            id="papeis"
            label={data.phases.label}
            eyebrow="03 · Os papéis"
            wide
          >
            <EditorialProse>
              <p data-comment-block="papeis.papeis.intro">
                {data.phases.intro}
              </p>
            </EditorialProse>
            <RolesTable items={data.phases.items} />
          </EditorialSection>

          <StakeholderGrid
            id="extensao"
            eyebrow={data.stakeholders.eyebrow}
            title={data.stakeholders.title}
            description={data.stakeholders.description}
            items={data.stakeholders.items}
          />

          <EditorialSection
            id="fronteiras"
            label={data.decisions.label}
            eyebrow="04 · Fronteiras"
            wide
          >
            <EditorialProse>
              <p data-comment-block="papeis.fronteiras.intro">
                {data.decisions.intro}
              </p>
            </EditorialProse>
            <DecisionMatrix
              roles={data.decisions.roles}
              rows={data.decisions.rows}
              legend={data.decisions.legend}
            />
          </EditorialSection>

          <EditorialSection
            id="vozes"
            label={data.voices.label}
            eyebrow="05 · Vozes"
          >
            <EditorialProse>
              <p data-comment-block="papeis.vozes.intro">
                {data.voices.intro}
              </p>
            </EditorialProse>
            <QuoteCarousel quotes={data.voices.quotes} />
          </EditorialSection>

          <EditorialSection
            id="contratos"
            label={data.plans.label}
            eyebrow="06 · Contratos"
          >
            <EditorialProse>
              <p data-comment-block="papeis.contratos.intro">
                {data.plans.intro}
              </p>
            </EditorialProse>
            <div className={styles.plans}>
              {data.plans.items.map((item) => (
                <article key={item.number} className={styles.plan}>
                  <div className={styles.planNumber}>{item.number}</div>
                  <div className={styles.planBody}>
                    <h3
                      className={styles.planTitle}
                      data-comment-block={`papeis.contratos.${item.number}.title`}
                    >
                      {item.title}
                    </h3>
                    <p
                      className={styles.planText}
                      data-comment-block={`papeis.contratos.${item.number}.body`}
                    >
                      {item.body}
                    </p>
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
              <p
                className={styles.footerQuote}
                data-comment-block="papeis.footer.quote"
              >
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
