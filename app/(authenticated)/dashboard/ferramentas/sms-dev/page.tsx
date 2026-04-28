import { Fraunces } from "next/font/google";
import Link from "next/link";
import { GlasswingShell } from "@/components/glasswing/GlasswingShell";
import { getGlasswingNav } from "@/lib/data/glasswing-nav";
import { Comments } from "@/components/comments/Comments";
import { loadPageCommentsForSsr } from "@/lib/comments/ssr";
import { SmsDevTool } from "./SmsDevTool";
import styles from "./page.module.css";

const PAGE_ID = "/dashboard/ferramentas/sms-dev";

const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
  axes: ["opsz", "SOFT"],
});

export const metadata = {
  title: "Saldo SMS Dev · Ferramentas · Hubble",
  description:
    "Consulta o saldo da conta SMS Dev e alerta quando está abaixo do limite configurado.",
};

export default async function SmsDevPage() {
  const threads = await loadPageCommentsForSsr(PAGE_ID);

  return (
    <div className={`${styles.page} ${fraunces.variable}`}>
      <Comments pageId={PAGE_ID} initialThreads={threads}>
        <GlasswingShell
          brand="ZapSign | Product Hubble"
          navItems={getGlasswingNav("ferramentas-sms-dev")}
        >
          <main className={styles.container}>
            <nav className={styles.crumbs} aria-label="Navegação">
              <Link href="/dashboard/ferramentas" className={styles.crumbLink}>
                Ferramentas
              </Link>
              <span className={styles.crumbSep} aria-hidden="true">
                /
              </span>
              <span className={styles.crumbCurrent}>Saldo SMS Dev</span>
            </nav>

            <header className={styles.head}>
              <h1 className={styles.title}>Saldo SMS Dev</h1>
              <p className={styles.lede}>
                Consulta direta do saldo da conta SMS Dev. Alerta quando está
                abaixo do limite (padrão: 500 SMS).
              </p>
            </header>

            <SmsDevTool />
          </main>
        </GlasswingShell>
      </Comments>
    </div>
  );
}
