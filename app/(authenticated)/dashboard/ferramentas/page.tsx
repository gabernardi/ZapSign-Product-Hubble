import Link from "next/link";
import { Fraunces } from "next/font/google";
import { GlasswingShell } from "@/components/glasswing/GlasswingShell";
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

interface Tool {
  name: string;
  scope: string;
  description: string;
  href?: string;
  status: "ready" | "soon";
  icon: React.ReactNode;
  meta?: string;
}

function MessageIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

const TOOLS: Tool[] = [
  {
    name: "Saldo SMS Dev",
    scope: "SMS Dev",
    description:
      "Consulta o saldo da conta e alerta quando está abaixo do limite. Cron envia card no Google Chat 2x/dia.",
    href: "/dashboard/ferramentas/sms-dev",
    status: "ready",
    icon: <MessageIcon />,
    meta: "auto · 09:00 e 21:00 BRT",
  },
  {
    name: "Próxima ferramenta",
    scope: "Em breve",
    description:
      "Sugira utilitários do dia a dia que valem ser automatizados.",
    status: "soon",
    icon: <PlusIcon />,
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
          <main className={styles.container}>
            <header className={styles.head}>
              <div className={styles.headTop}>
                <h1 className={styles.title}>Ferramentas</h1>
                <span className={styles.count}>
                  {TOOLS.filter((t) => t.status === "ready").length}{" "}
                  {TOOLS.filter((t) => t.status === "ready").length === 1
                    ? "ativa"
                    : "ativas"}
                </span>
              </div>
              <p className={styles.lede}>
                Utilitários internos do time. Cada ferramenta resolve uma
                coisa só, sem cerimônia.
              </p>
            </header>

            <ul className={styles.grid}>
              {TOOLS.map((tool) => {
                const isSoon = tool.status === "soon";
                const Card = (
                  <article
                    className={`${styles.card} ${isSoon ? styles.cardSoon : ""}`}
                  >
                    <div className={styles.cardHead}>
                      <span className={styles.cardIcon} aria-hidden="true">
                        {tool.icon}
                      </span>
                      <span
                        className={`${styles.tag} ${isSoon ? styles.tagSoon : styles.tagReady}`}
                      >
                        {isSoon ? "Em breve" : "Ativa"}
                      </span>
                    </div>
                    <div className={styles.cardBody}>
                      <h2 className={styles.cardName}>{tool.name}</h2>
                      <p className={styles.cardScope}>{tool.scope}</p>
                      <p className={styles.cardDesc}>{tool.description}</p>
                    </div>
                    <footer className={styles.cardFoot}>
                      {tool.meta && (
                        <span className={styles.cardMeta}>{tool.meta}</span>
                      )}
                      {!isSoon && (
                        <span className={styles.cardCta}>
                          Abrir
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 16 16"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path d="M9 3.5l-1 1 2.8 2.8H2v1.4h8.8L8 11.5l1 1 4.5-4.5z" />
                          </svg>
                        </span>
                      )}
                    </footer>
                  </article>
                );

                return (
                  <li key={tool.name} className={styles.gridItem}>
                    {tool.href && !isSoon ? (
                      <Link href={tool.href} className={styles.cardLink}>
                        {Card}
                      </Link>
                    ) : (
                      Card
                    )}
                  </li>
                );
              })}
            </ul>
          </main>
        </GlasswingShell>
      </Comments>
    </div>
  );
}
