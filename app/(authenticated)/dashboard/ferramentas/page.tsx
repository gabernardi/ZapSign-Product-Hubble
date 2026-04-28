import Link from "next/link";
import { Fraunces } from "next/font/google";
import { GlasswingShell } from "@/components/glasswing/GlasswingShell";
import { GlasswingHero } from "@/components/glasswing/GlasswingHero";
import {
  EditorialSection,
  EditorialProse,
} from "@/components/glasswing/EditorialSection";
import { getGlasswingNav } from "@/lib/data/glasswing-nav";
import { Comments } from "@/components/comments/Comments";
import { loadPageCommentsForSsr } from "@/lib/comments/ssr";
import styles from "./page.module.css";

const PAGE_ID = "/dashboard/ferramentas";

const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
  axes: ["opsz", "SOFT"],
});

export const metadata = {
  title: "Ferramentas · Hubble",
  description:
    "Utilitários internos do time de produto da ZapSign — consultas, atalhos e automações.",
};

interface ToolEntry {
  number: string;
  label: string;
  title: string;
  body: string;
  href?: string;
  cta?: string;
  status: "ready" | "soon";
}

const TOOLS: ToolEntry[] = [
  {
    number: "01",
    label: "SMS Dev · Consulta",
    title: "Saldo SMS Dev",
    body: "Consulta o saldo da conta SMS Dev e alerta quando está abaixo do limite configurado (padrão: 500 SMS). Útil antes de campanhas com volume alto.",
    href: "/dashboard/ferramentas/sms-dev",
    cta: "Abrir ferramenta",
    status: "ready",
  },
  {
    number: "02",
    label: "Em breve",
    title: "Próximas ferramentas",
    body: "Outros utilitários do time entram aqui — sugira o seu via Laboratório.",
    status: "soon",
  },
];

export default async function FerramentasIndexPage() {
  const threads = await loadPageCommentsForSsr(PAGE_ID);

  return (
    <div className={`${styles.page} ${fraunces.variable}`}>
      <Comments pageId={PAGE_ID} initialThreads={threads}>
        <GlasswingShell
          brand="ZapSign | Product Hubble"
          navItems={getGlasswingNav("ferramentas")}
        >
          <GlasswingHero
            eyebrow="Ferramentas"
            title="Utilitários internos do time."
            subtitle="Pequenos atalhos pra consultas e tarefas operacionais que aparecem no dia a dia. Cada ferramenta resolve uma coisa só, bem feita."
            continueLabel="Ver ferramentas"
            continueHref="#catalogo"
          />

          <EditorialSection
            id="catalogo"
            label="Catálogo de ferramentas."
            eyebrow="01 · Catálogo"
            wide
          >
            <EditorialProse>
              <p data-comment-block="ferramentas.intro">
                Comece pela consulta de saldo do SMS Dev. Outras ferramentas
                serão adicionadas conforme o time precisar — se você tem uma
                ideia, abra um experimento no Laboratório.
              </p>
            </EditorialProse>

            <ol className={styles.entries}>
              {TOOLS.map((tool) => {
                const isSoon = tool.status === "soon";

                const body = (
                  <>
                    <div className={styles.entryNumber}>{tool.number}</div>
                    <div className={styles.entryBody}>
                      <header className={styles.entryHead}>
                        <span className={styles.entryLabel}>{tool.label}</span>
                        <h3 className={styles.entryTitle}>{tool.title}</h3>
                      </header>
                      <p className={styles.entryText}>{tool.body}</p>
                      {!isSoon && tool.cta && (
                        <span className={styles.entryCta}>
                          {tool.cta}
                          <span aria-hidden="true" className={styles.entryArrow}>
                            →
                          </span>
                        </span>
                      )}
                    </div>
                  </>
                );

                if (isSoon || !tool.href) {
                  return (
                    <li
                      key={tool.number}
                      className={`${styles.entry} ${styles.entrySoon}`}
                      aria-disabled="true"
                    >
                      {body}
                    </li>
                  );
                }

                return (
                  <li key={tool.number} className={styles.entry}>
                    <Link href={tool.href} className={styles.entryLink}>
                      {body}
                    </Link>
                  </li>
                );
              })}
            </ol>
          </EditorialSection>
        </GlasswingShell>
      </Comments>
    </div>
  );
}
