import { Fraunces } from "next/font/google";
import Link from "next/link";
import { GlasswingShell } from "@/components/glasswing/GlasswingShell";
import { getGlasswingNav } from "@/lib/data/glasswing-nav";
import { Comments } from "@/components/comments/Comments";
import { loadPageCommentsForSsr } from "@/lib/comments/ssr";
import { auth } from "@/lib/auth";
import { canDeleteOpenAIKeys } from "@/lib/tools/openai-keys";
import { OpenAIKeysTool } from "./OpenAIKeysTool";
import styles from "./page.module.css";

const PAGE_ID = "/dashboard/ferramentas/openai-keys";

const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
  axes: ["opsz", "SOFT"],
});

export const metadata = {
  title: "Limpeza de keys OpenAI · Ferramentas · Hubble",
  description:
    "Lista todas as API keys da organização OpenAI, sinaliza as ociosas e remove em massa.",
};

export default async function OpenAIKeysPage() {
  const [threads, session] = await Promise.all([
    loadPageCommentsForSsr(PAGE_ID),
    auth(),
  ]);
  const userEmail = session?.user?.email ?? null;
  const canDelete = canDeleteOpenAIKeys(userEmail);

  return (
    <div className={`${styles.page} ${fraunces.variable}`}>
      <Comments pageId={PAGE_ID} initialThreads={threads}>
        <GlasswingShell
          brand="ZapSign | Product Hubble"
          navItems={getGlasswingNav("ferramentas-openai-keys")}
        >
          <main className={styles.container}>
            <nav className={styles.crumbs} aria-label="Navegação">
              <Link href="/dashboard/ferramentas" className={styles.crumbLink}>
                Ferramentas
              </Link>
              <span className={styles.crumbSep} aria-hidden="true">
                /
              </span>
              <span className={styles.crumbCurrent}>Limpeza de keys OpenAI</span>
            </nav>

            <header className={styles.head}>
              <h1 className={styles.title}>Limpeza de keys OpenAI</h1>
              <p className={styles.lede}>
                Lista todas as API keys de todos os projetos da organização e
                sinaliza as ociosas (não usadas há mais de N dias) e nunca
                usadas. Use para revisar e remover em massa.
              </p>
            </header>

            <OpenAIKeysTool canDelete={canDelete} />
          </main>
        </GlasswingShell>
      </Comments>
    </div>
  );
}
