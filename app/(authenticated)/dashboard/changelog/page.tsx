import { Fraunces } from "next/font/google";
import { GlasswingShell } from "@/components/glasswing/GlasswingShell";
import { GlasswingHero } from "@/components/glasswing/GlasswingHero";
import { ExperimentFrame } from "@/components/glasswing/ExperimentFrame";
import {
  EditorialSection,
  EditorialProse,
} from "@/components/glasswing/EditorialSection";
import { getGlasswingNav } from "@/lib/data/glasswing-nav";
import {
  CHANGELOG,
  CHANGELOG_GENERATED_AT,
} from "@/lib/data/changelog.generated";
import { decorateAll } from "@/lib/data/changelog-review";
import { loadReviewStore } from "@/lib/data/changelog-review-store";
import { Comments } from "@/components/comments/Comments";
import { loadCommentsStore } from "@/lib/data/comments-store";
import { getPageThreads } from "@/lib/data/comments";
import { ProductExperiment } from "./ProductExperiment";
import styles from "./page.module.css";

const PAGE_ID = "/dashboard/changelog";

const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
  axes: ["opsz", "SOFT"],
});

export const metadata = {
  title: "Changelog · Hubble",
  description:
    "Simulação de changelog do produto ZapSign, gerado automaticamente a partir dos pull requests mergeados em truora/web e truora/api, com leitura humana escrita por IA.",
};

const FULL_DATE_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export default async function ChangelogPage() {
  const store = await loadReviewStore();
  const entries = decorateAll(CHANGELOG, store);
  const generatedAt = FULL_DATE_FORMATTER.format(
    new Date(CHANGELOG_GENERATED_AT),
  );
  const threads = getPageThreads(await loadCommentsStore(), PAGE_ID);

  return (
    <div className={`${styles.page} ${fraunces.variable}`}>
      <Comments pageId={PAGE_ID} initialThreads={threads}>
      <GlasswingShell
        brand="ZapSign | Product Hubble"
        navItems={getGlasswingNav("changelog")}
      >
        <GlasswingHero
          eyebrow="Experimento do laboratório · 001"
          title="Changelog generativo."
          subtitle="Pull requests mergeados em truora/web e truora/api, lidos por uma IA que decide o que é visível pro cliente e reescreve cada entrada em linguagem humana."
          continueLabel="Abrir experimento"
          continueHref="#experimento"
          tone="lab"
        />

        <section id="origem" className={styles.origin}>
          <div className={styles.originInner}>
            <div className={styles.originBadge}>
              <span className={styles.originDot} aria-hidden="true" />
              Experimento do laboratório · 001
            </div>
            <h2 className={styles.originTitle}>
              Essa página é, ela mesma, um experimento.
            </h2>
            <div className={styles.originProse}>
              <p data-comment-block="changelog.origem.p1">
                Construída pelo Gabriel em uma tarde, junto com o Cursor e o
                Claude, pra validar uma hipótese simples:{" "}
                <strong>
                  dá pra ter um changelog do ZapSign genuinamente útil para o
                  cliente, zero esforço manual, direto dos pull requests
                  mergeados em produção?
                </strong>
              </p>
              <p data-comment-block="changelog.origem.p2">
                O script consulta a API do Bitbucket, puxa os PRs mergeados na{" "}
                <code>main</code> de <code>truora/web</code> e{" "}
                <code>truora/api</code> nos últimos 90 dias, e pede a um modelo
                (<code>gpt-4o-mini</code>) pra fazer duas coisas de uma vez:
                decidir se aquela mudança é visível para o cliente final e, em
                caso positivo, reescrever título, descrição e impacto em
                linguagem humana. Refactor, teste, infra e bump de dependência
                ficam fora. O resultado é cacheado por PR no repositório, então
                só PRs novos ou editados custam tokens.
              </p>
              <p data-comment-block="changelog.origem.p3">
                Se funcionou? Parcialmente. Você está vendo o resultado logo
                abaixo, enquadrado como se fosse um produto de verdade. Se
                pode melhorar? Muito. Por isso está em{" "}
                <strong>beta</strong> —{" "}
                <a href="/dashboard/contribuir">abre um PR</a> se tiver ideia.
              </p>
            </div>
          </div>
        </section>

        <EditorialSection
          id="introducao"
          label="Como ler o experimento."
          eyebrow="Leitura"
        >
          <EditorialProse>
            <p data-comment-block="changelog.introducao.p1">
              Logo abaixo, uma janela encapsula o experimento. Tudo o que
              aparece dentro dela é o produto em si — com sua própria
              identidade, fora das guidelines deste guia. A moldura serve só
              pra lembrar: é uma simulação, não uma página do guia.
            </p>
            <p data-comment-block="changelog.introducao.p2">
              Cada linha dentro do experimento é um pull request real,
              mergeado na <code>main</code> de <code>truora/web</code> ou{" "}
              <code>truora/api</code>. Uma IA lê o título e a descrição do PR,
              decide se a mudança é visível para o cliente final (refactor,
              teste e infra ficam de fora) e, quando é, reescreve em
              linguagem humana o que mudou e o que isso afeta no dia a dia
              de quem usa o ZapSign.
            </p>
            <p data-comment-block="changelog.introducao.p3">
              <strong>Quer que sua mudança apareça aqui?</strong> Abra um pull
              request descrevendo o efeito para o cliente. Em questão de horas
              ele é revisado, mergeado e deployado — e, se a IA classificar
              como user-facing, a entrada aparece nesta página
              automaticamente. Como contribuir está no{" "}
              <a href="/dashboard/contribuir">laboratório de produto</a>.
            </p>
          </EditorialProse>
        </EditorialSection>

        <div id="experimento">
        <ExperimentFrame
          id="001"
          title="Changelog generativo"
          host="zapsign.lab/changelog"
          status="Beta"
          footnote="experimento em andamento · 001 · construído com Cursor + Claude"
        >
          <ProductExperiment
            entries={entries}
            generatedAt={generatedAt}
          />
        </ExperimentFrame>
        </div>
      </GlasswingShell>
      </Comments>
    </div>
  );
}
