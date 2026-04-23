import { Fraunces } from "next/font/google";
import {
  roadmap1T26Data as data,
  type DeliveryStatus,
} from "@/lib/data/roadmap-1t26";
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
import { getGlasswingNav } from "@/lib/data/glasswing-nav";
import { Comments } from "@/components/comments/Comments";
import { loadPageCommentsForSsr } from "@/lib/comments/ssr";
import styles from "./page.module.css";

const PAGE_ID = "/dashboard/roadmap/1t26";

const tocItems = [
  { id: "introducao", label: "Abertura" },
  { id: "contexto", label: "O momento" },
  { id: "resultados", label: "Resultados" },
  { id: "entregas", label: "Entregas" },
  { id: "aprendizados", label: "Aprendizados" },
  { id: "continuacoes", label: "Do 1T para o 2T" },
  { id: "ano", label: "O ano" },
  { id: "appendix", label: "Appendix" },
];

const DELIVERY_STATUS_LABEL: Record<DeliveryStatus, string> = {
  production: "Em produção",
  in_progress: "Em progresso",
  validated: "Validado",
  impact: "Impacto alto",
};

const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
  axes: ["opsz", "SOFT"],
});

export const metadata = {
  title: "Roadmap 1T26 · Hubble",
  description:
    "Retrospectiva do primeiro trimestre de 2026 da ZapSign: resultados, entregas e aprendizados do trimestre encerrado.",
};

export default async function Roadmap1T26Page() {
  const threads = await loadPageCommentsForSsr(PAGE_ID);
  return (
    <div className={`${styles.page} ${fraunces.variable}`}>
      <Comments pageId={PAGE_ID} initialThreads={threads}>
      <GlasswingShell
        brand={data.topbar.brand}
        navItems={getGlasswingNav("roadmap", "1T26")}
      >
        <TableOfContents items={tocItems} label="Neste retrato" />

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
              <p key={i} data-comment-block={`roadmap1t26.introducao.p${i + 1}`}>
                {p}
              </p>
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
              <p key={i} data-comment-block={`roadmap1t26.contexto.p${i + 1}`}>
                {p}
              </p>
            ))}
          </EditorialProse>
        </EditorialSection>

        <EditorialSection
          id="resultados"
          label={data.results.label}
          eyebrow="03 · Resultados"
          wide
        >
          <EditorialProse>
            <p data-comment-block="roadmap1t26.resultados.intro">
              {data.results.intro}
            </p>
          </EditorialProse>
          <div className={styles.results}>
            {data.results.items.map((r, i) => (
              <article
                key={i}
                className={`${styles.result} ${styles[`status_${r.status}`]}`}
              >
                <div className={styles.resultHeader}>
                  <span className={styles.resultSquad}>{r.squad}</span>
                  <h3 className={styles.resultMetric}>{r.metric}</h3>
                  <p className={styles.resultMovement}>
                    <span className={styles.resultFrom}>{r.from}</span>
                    <span className={styles.resultArrow} aria-hidden="true">
                      →
                    </span>
                    <span className={styles.resultTo}>{r.to}</span>
                  </p>
                </div>
                <div className={styles.attainment}>
                  <span
                    className={styles.attainmentValue}
                    aria-label={`Atingimento: ${r.attainment}%`}
                  >
                    {r.attainment}
                    <span aria-hidden="true">%</span>
                  </span>
                  <span className={styles.attainmentTrack} aria-hidden="true">
                    <span
                      className={styles.attainmentBar}
                      style={{ width: `${Math.min(r.attainment, 100)}%` }}
                    />
                  </span>
                </div>
                {r.note && <p className={styles.resultNote}>{r.note}</p>}
              </article>
            ))}
          </div>
          <div
            className={styles.statusLegend}
            aria-label="Legenda de atingimento"
          >
            <span className={styles.statusLegendItem}>
              <span
                className={`${styles.statusLegendDot} ${styles.met}`}
                aria-hidden="true"
              />
              Meta batida (≥ 100%)
            </span>
            <span className={styles.statusLegendItem}>
              <span
                className={`${styles.statusLegendDot} ${styles.partial}`}
                aria-hidden="true"
              />
              Parcial (50 – 99%)
            </span>
            <span className={styles.statusLegendItem}>
              <span
                className={`${styles.statusLegendDot} ${styles.missed}`}
                aria-hidden="true"
              />
              Abaixo de 50%
            </span>
          </div>
        </EditorialSection>

        <EditorialSection
          id="entregas"
          label={data.deliveries.label}
          eyebrow="04 · Entregas"
          wide
        >
          <EditorialProse>
            <p data-comment-block="roadmap1t26.entregas.intro">
              {data.deliveries.intro}
            </p>
          </EditorialProse>
          <div className={styles.groups}>
            {data.deliveries.groups.map((group) => (
              <section key={group.id} className={styles.group}>
                <header className={styles.groupHead}>
                  <h3 className={styles.groupTitle}>{group.title}</h3>
                  <p className={styles.groupSubtitle}>{group.subtitle}</p>
                </header>
                <ul className={styles.deliveries}>
                  {group.items.map((item) => (
                    <li key={item.id} className={styles.delivery}>
                      <span className={styles.deliveryTheme}>{item.theme}</span>
                      <div className={styles.deliveryMain}>
                        <h4 className={styles.deliveryTitle}>
                          {item.title}
                          {item.unplanned && (
                            <span className={styles.unplannedTag}>
                              Não previsto
                            </span>
                          )}
                        </h4>
                        <p className={styles.deliveryDesc}>
                          {item.description}
                        </p>
                      </div>
                      <span
                        className={`${styles.deliveryStatus} ${styles[`status_${item.status}`]}`}
                      >
                        {DELIVERY_STATUS_LABEL[item.status]}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </EditorialSection>

        <EditorialSection
          id="aprendizados"
          label={data.learnings.label}
          eyebrow="05 · Aprendizados"
          wide
        >
          <EditorialProse>
            <p data-comment-block="roadmap1t26.aprendizados.intro">
              {data.learnings.intro}
            </p>
          </EditorialProse>
          <div className={styles.learnings}>
            <section className={styles.learningColumn}>
              <h3 className={styles.learningTitle}>
                {data.learnings.good.title}
              </h3>
              <ul className={styles.learningList}>
                {data.learnings.good.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </section>
            <section className={styles.learningColumn}>
              <h3 className={styles.learningTitle}>
                {data.learnings.challenges.title}
              </h3>
              <ul className={styles.learningList}>
                {data.learnings.challenges.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </section>
          </div>
        </EditorialSection>

        <SceneBlock
          kind={data.intermission.kind}
          eyebrow={data.intermission.eyebrow}
          title={data.intermission.title}
          body={data.intermission.body}
        />

        <EditorialSection
          id="continuacoes"
          label={data.continuations.label}
          eyebrow="06 · Do 1T para o 2T"
          wide
        >
          <EditorialProse>
            <p data-comment-block="roadmap1t26.continuacoes.intro">
              {data.continuations.intro}
            </p>
          </EditorialProse>
          <ol className={styles.continuations}>
            {data.continuations.items.map((item, i) => (
              <li key={i} className={styles.continuation}>
                <span className={styles.continuationSquad}>{item.squad}</span>
                <div className={styles.continuationBody}>
                  <h4 className={styles.continuationTitle}>
                    {item.title}
                    <span className={styles.continuationTag}>1T → 2T</span>
                  </h4>
                  <p className={styles.continuationDesc}>{item.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </EditorialSection>

        <EditorialSection
          id="ano"
          label={data.quarters.label}
          eyebrow="07 · O ano em perspectiva"
          wide
        >
          <EditorialProse>
            <p data-comment-block="roadmap1t26.ano.intro">
              {data.quarters.intro}
            </p>
          </EditorialProse>
          <QuarterStrip items={data.quarters.items} />
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
      </Comments>
    </div>
  );
}
