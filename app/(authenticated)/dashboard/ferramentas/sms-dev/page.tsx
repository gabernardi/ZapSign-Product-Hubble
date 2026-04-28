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
  const hasEnvKey = Boolean(process.env.SMSDEV_API_KEY?.trim());

  return (
    <div className={`${styles.page} ${fraunces.variable}`}>
      <Comments pageId={PAGE_ID} initialThreads={threads}>
        <GlasswingShell
          brand="ZapSign | Product Hubble"
          navItems={getGlasswingNav("ferramentas-sms-dev")}
        >
          <GlasswingHero
            eyebrow="Ferramenta · SMS Dev"
            title="Verificador de saldo SMS Dev."
            subtitle="Consulta direta à API do SMS Dev e alerta automático quando o saldo está abaixo do limite. A chave fica no servidor (env var) ou apenas neste navegador — você escolhe."
            continueLabel="Verificar saldo"
            continueHref="#consulta"
          />

          <EditorialSection
            id="consulta"
            label="Consulte o saldo da conta."
            eyebrow="01 · Consulta"
            wide
          >
            <SmsDevTool hasEnvKey={hasEnvKey} />
          </EditorialSection>

          <EditorialSection
            id="sobre"
            label="Como esta ferramenta funciona."
            eyebrow="02 · Como funciona"
          >
            <EditorialProse>
              <p data-comment-block="ferramentas.smsdev.como.p1">
                A consulta é feita pelo servidor do Hubble, que chama o
                endpoint <code>api.smsdev.com.br/v1/balance</code> e retorna o
                saldo já validado. Isso evita problemas de CORS e mantém a
                chave fora do navegador quando ela está configurada como
                variável de ambiente.
              </p>
              <p data-comment-block="ferramentas.smsdev.como.p2">
                Se o admin tiver definido <code>SMSDEV_API_KEY</code> no
                servidor, qualquer pessoa autorizada pode consultar com um
                clique. Caso contrário, dá pra colar a chave no formulário —
                ela fica salva apenas no <em>localStorage</em> deste navegador
                e nunca é persistida no servidor.
              </p>
              <p data-comment-block="ferramentas.smsdev.como.p3">
                O alerta de saldo baixo dispara quando o saldo está abaixo do
                limite (padrão: 500 SMS). Use isso antes de campanhas com
                volume alto ou como check-up periódico.
              </p>
            </EditorialProse>
          </EditorialSection>
        </GlasswingShell>
      </Comments>
    </div>
  );
}
