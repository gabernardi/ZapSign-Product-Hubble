import { Fraunces } from "next/font/google";
import { CommentsInboxView } from "@/components/comments/CommentsInboxView";
import { GlasswingShell } from "@/components/glasswing/GlasswingShell";
import { getGlasswingNav } from "@/lib/data/glasswing-nav";
import styles from "./page.module.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
  axes: ["opsz", "SOFT"],
});

export const metadata = {
  title: "Comentários · Hubble",
  description:
    "Inbox global com todos os comentários e discussões abertas do Product Hubble.",
};

export default function ComentariosPage() {
  return (
    <div className={`${styles.page} ${fraunces.variable}`}>
      <GlasswingShell
        brand="ZapSign | Product Hubble"
        navItems={getGlasswingNav("comentarios")}
      >
        <section className={styles.hero}>
          <span className={styles.eyebrow}>
            <span className={styles.eyebrowDot} aria-hidden="true" />
            Inbox global
          </span>
          <h1 className={styles.title}>Comentários de todas as páginas.</h1>
          <p className={styles.subtitle}>
            Acompanhe novas discussões, veja o que ainda está em aberto e entre
            direto na thread certa sem precisar procurar pelo trecho no guia.
          </p>
        </section>

        <CommentsInboxView />
      </GlasswingShell>
    </div>
  );
}
