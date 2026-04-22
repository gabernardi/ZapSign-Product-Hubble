import { Fraunces } from "next/font/google";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import styles from "./login.module.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
  axes: ["opsz", "SOFT"],
});

const ERROR_MESSAGES: Record<string, string> = {
  AccessDenied:
    "Este e-mail não tem acesso. Entre com uma conta @zapsign.com.br ou @truora.com.",
  Configuration:
    "Erro de configuração no login. Avise o time de produto.",
  OAuthSignin:
    "Não foi possível iniciar o login com o Google. Tente novamente.",
  OAuthCallback:
    "Não foi possível concluir o login com o Google. Tente novamente.",
  OAuthAccountNotLinked:
    "Esse e-mail já está associado a outro tipo de login.",
  Verification: "O link de verificação não é mais válido.",
  CredentialsSignin:
    "Falha ao entrar. Tente novamente.",
};

interface LoginPageProps {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const errorMessage = params.error
    ? ERROR_MESSAGES[params.error] ??
      "Não foi possível entrar. Tente novamente."
    : null;
  const callbackUrl = params.callbackUrl ?? "/dashboard";

  return (
    <div className={`${styles.page} ${fraunces.variable}`}>
      <header className={styles.top}>
        <div className={styles.brand}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/zapsign-mark-white.png"
            alt=""
            className={styles.brandMark}
          />
          <span className={styles.brandText}>
            <span className={styles.brandCompany}>ZapSign</span>
            <span className={styles.brandSep} aria-hidden="true">
              |
            </span>
            <span className={styles.brandProduct}>Product Hubble</span>
          </span>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.art} aria-hidden="true">
          <FlowArt />
        </div>

        <div className={styles.content}>
          <span className={styles.eyebrow}>
            <span className={styles.eyebrowDot} aria-hidden="true" />
            Acesso restrito
          </span>

          <h1 className={styles.title}>
            Entre com sua conta ZapSign.
          </h1>

          <p className={styles.subtitle}>
            Guia interno do time de produto. Disponível para contas
            corporativas <strong>@zapsign.com.br</strong> e{" "}
            <strong>@truora.com</strong>.
          </p>

          <div className={styles.action}>
            <GoogleSignInButton callbackUrl={callbackUrl} />
          </div>

          {errorMessage && (
            <p role="alert" className={styles.error}>
              {errorMessage}
            </p>
          )}

          <p className={styles.note}>
            Ao entrar, você concorda com o uso interno deste guia pelo time de
            produto. Sessões expiram automaticamente após período de inatividade.
          </p>
        </div>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <span className={styles.footerBrand}>
            ZapSign · Time de Produto
          </span>
          <span className={styles.footerMeta}>Guia interno · Abril 2026</span>
        </div>
      </footer>
    </div>
  );
}

function FlowArt() {
  const rows = 16;
  const lines = Array.from({ length: rows }, (_, i) => i);
  return (
    <svg
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMid slice"
      className={styles.flowSvg}
    >
      <defs>
        <linearGradient id="loginFlowFade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="currentColor" stopOpacity={0} />
          <stop offset="40%" stopColor="currentColor" stopOpacity={0.06} />
          <stop offset="75%" stopColor="currentColor" stopOpacity={0.18} />
          <stop offset="100%" stopColor="currentColor" stopOpacity={0} />
        </linearGradient>
        <radialGradient id="loginFlowGlow" cx="0.82" cy="0.5" r="0.6">
          <stop offset="0%" stopColor="currentColor" stopOpacity={0.05} />
          <stop offset="70%" stopColor="currentColor" stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect width="1200" height="800" fill="url(#loginFlowGlow)" />
      <g strokeWidth="1" fill="none" stroke="url(#loginFlowFade)">
        {lines.map((i) => {
          const y = 120 + i * 36;
          const amp = 28 + (i % 4) * 8;
          const phase = (i % 3) * 40;
          return (
            <path
              key={i}
              d={`M -50 ${y} C ${200 + phase} ${y - amp}, ${500 - phase} ${
                y + amp
              }, ${800} ${y} S ${1100 + phase} ${y - amp / 2}, 1300 ${y}`}
              opacity={0.28 + (i % 5) * 0.08}
            />
          );
        })}
      </g>
    </svg>
  );
}
