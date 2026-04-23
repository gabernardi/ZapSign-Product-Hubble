"use client";

import Link from "next/link";
import { Fraunces } from "next/font/google";
import { useSession } from "next-auth/react";
import { GlasswingShell } from "@/components/glasswing/GlasswingShell";
import { GlasswingHero } from "@/components/glasswing/GlasswingHero";
import {
  EditorialSection,
  EditorialProse,
} from "@/components/glasswing/EditorialSection";
import { TableOfContents } from "@/components/glasswing/TableOfContents";
import { getGlasswingNav } from "@/lib/data/glasswing-nav";
import { QUARTERS } from "@/lib/data/roadmap";
import { Comments } from "@/components/comments/Comments";
import styles from "./page.module.css";

const activeQuarter = QUARTERS.find((q) => q.active) ?? QUARTERS[1];

const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
  axes: ["opsz", "SOFT"],
});

interface HomeEntry {
  number: string;
  label: string;
  title: string;
  body: string;
  href?: string;
  cta?: string;
  status?: "ready" | "soon";
}

const ENTRIES: HomeEntry[] = [
  {
    number: "01",
    label: "Guideline",
    title: "Upstream",
    body: "Como o trio formula, valida e prepara o que será construído — da descoberta do problema ao protótipo pronto para entrar em build.",
    href: "/dashboard/upstream",
    cta: "Ler guia",
    status: "ready",
  },
  {
    number: "02",
    label: "Guideline",
    title: "Downstream",
    body: "Como o trio executa, lança e aprende com o que foi construído — do handoff técnico até a medição do impacto em produção.",
    href: "/dashboard/downstream",
    cta: "Ler guia",
    status: "ready",
  },
  {
    number: "03",
    label: `${activeQuarter.period} · Trimestre atual`,
    title: `Roadmap ${activeQuarter.label}`,
    body: "Cinco squads, um trimestre e um contrato público: escopo fechado, métrica combinada, aprendizado registrado.",
    href: "/dashboard/roadmap",
    cta: "Ver trimestre",
    status: "ready",
  },
  {
    number: "04",
    label: "Laboratório",
    title: "Laboratório de produto",
    body: "Espaço livre pro time experimentar qualquer ideia — de uma funcionalidade nova pro core de assinatura a uma aposta que pode virar unidade de negócio nova. Este site é a forma mais acessível; o convite vai até onde a sua ideia for.",
    href: "/dashboard/contribuir",
    cta: "Entrar no laboratório",
    status: "ready",
  },
  {
    number: "05",
    label: "Changelog · LAB-001",
    title: "Histórico automatizado",
    body: "Changelog gerado direto dos commits da main, sem esforço manual. É um dos primeiros experimentos saídos do laboratório — está em beta, ainda evoluindo.",
    href: "/dashboard/changelog",
    cta: "Ver histórico",
    status: "ready",
  },
  {
    number: "06",
    label: "Em breve",
    title: "Árvore de oportunidades",
    body: "Um mapa vivo de onde o produto pode crescer — problemas, apostas e hipóteses organizados pelo impacto que podem gerar.",
    status: "soon",
  },
];

const tocItems = [
  { id: "abertura", label: "Abertura" },
  { id: "conteudos", label: "Conteúdos" },
  { id: "manifesto", label: "Manifesto" },
];

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

export default function DashboardHome() {
  const { data: session } = useSession();
  const firstName = session?.user?.name?.split(" ")[0];
  const heroEyebrow = firstName
    ? `${getGreeting()}, ${firstName}`
    : "ZapSign | Product Hubble";

  return (
    <div className={`${styles.page} ${fraunces.variable}`}>
      <Comments pageId="/dashboard" initialThreads={[]} refreshOnMount>
      <GlasswingShell
        brand="ZapSign | Product Hubble"
        navItems={getGlasswingNav("home")}
      >
        <TableOfContents items={tocItems} label="Nesta página" />

        <GlasswingHero
          eyebrow={heroEyebrow}
          title="Guia interno do time de produto."
          subtitle="Um único lugar para entender como pensamos, decidimos e entregamos. Da formulação do problema ao aprendizado no pós-lançamento."
          continueLabel="Começar"
          continueHref="#abertura"
        />

        <EditorialSection
          id="abertura"
          label="O que você vai encontrar aqui."
          eyebrow="01 · Abertura"
        >
          <EditorialProse>
            <p data-comment-block="home.abertura.p1">
              Este é o lugar onde o time de produto da ZapSign guarda memória.
              Não é um conjunto de regras — é o registro honesto de como
              trabalhamos hoje, o que já aprendemos e o que ainda estamos
              descobrindo.
            </p>
            <p data-comment-block="home.abertura.p2">
              As duas <strong>guidelines</strong> descrevem o ciclo completo de
              uma entrega: do problema ao protótipo (upstream) e do handoff ao
              aprendizado em produção (downstream). O <strong>roadmap</strong>{" "}
              mostra em que estamos apostando agora e por quê. As seções{" "}
              <em>meta</em> explicam como o próprio guia é editado e o que mudou
              desde a primeira versão.
            </p>
            <p data-comment-block="home.abertura.p3">
              Leia por curiosidade, consulte na dúvida, abra um PR quando
              discordar. O guia melhora quando mais gente escreve nele.
            </p>
          </EditorialProse>
        </EditorialSection>

        <EditorialSection
          id="conteudos"
          label="Seis leituras para entender como o produto se move."
          eyebrow="02 · Conteúdos"
          wide
        >
          <EditorialProse>
            <p data-comment-block="home.conteudos.p1">
              Cada leitura é independente — dá pra começar por qualquer uma.
              Mas se esta é a sua primeira visita, a ordem abaixo é o percurso
              mais curto do abstrato (como pensamos) para o concreto (o que
              estamos fazendo agora).
            </p>
          </EditorialProse>
          <ol className={styles.entries}>
            {ENTRIES.map((entry) => {
              const isSoon = entry.status === "soon";

              const body = (
                <>
                  <div className={styles.entryNumber}>{entry.number}</div>
                  <div className={styles.entryBody}>
                    <header className={styles.entryHead}>
                      <span className={styles.entryLabel}>{entry.label}</span>
                      <h3 className={styles.entryTitle}>{entry.title}</h3>
                    </header>
                    <p className={styles.entryText}>{entry.body}</p>
                    {!isSoon && entry.cta && (
                      <span className={styles.entryCta}>
                        {entry.cta}
                        <span aria-hidden="true" className={styles.entryArrow}>
                          →
                        </span>
                      </span>
                    )}
                  </div>
                </>
              );

              if (isSoon || !entry.href) {
                return (
                  <li
                    key={entry.number}
                    className={`${styles.entry} ${styles.entrySoon}`}
                    aria-disabled="true"
                  >
                    {body}
                  </li>
                );
              }

              return (
                <li key={entry.number} className={styles.entry}>
                  <Link href={entry.href} className={styles.entryLink}>
                    {body}
                  </Link>
                </li>
              );
            })}
          </ol>
        </EditorialSection>

        <EditorialSection
          id="manifesto"
          label="Três frases que sustentam o guia."
          eyebrow="03 · Manifesto"
        >
          <EditorialProse>
            <p data-comment-block="home.manifesto.p1">
              <strong>O problema precede o produto.</strong> Nenhuma solução
              entra em build antes de o time entender — com evidência — qual
              dor está sendo resolvida e para quem.
            </p>
            <p data-comment-block="home.manifesto.p2">
              <strong>A entrega não acaba no deploy.</strong> Soltamos, medimos
              e ajustamos. O aprendizado registrado vale mais que a entrega
              silenciosa.
            </p>
            <p data-comment-block="home.manifesto.p3">
              <strong>O guia pertence ao time.</strong> Quem vive o processo
              escreve sobre ele. Toda contribuição — do typo ao capítulo novo
              — é bem-vinda.
            </p>
          </EditorialProse>
        </EditorialSection>

        <footer className={styles.footer}>
          <div className={styles.footerInner}>
            <p className={styles.footerQuote}>
              &ldquo;Guia não é regra. É memória do que já aprendemos.&rdquo;
            </p>
            <div className={styles.footerMeta}>
              <span className={styles.footerBrand}>
                ZapSign · Time de Produto
              </span>
              <span>Guia interno · Abril 2026</span>
            </div>
          </div>
        </footer>
      </GlasswingShell>
      </Comments>
    </div>
  );
}
