import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import styles from "./login.module.css";

const IS_DEV = process.env.NODE_ENV === "development";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logoMark}>
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="10" fill="var(--blue)" />
            <path
              d="M12 20.5L17 25.5L28 14.5"
              stroke="white"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h1 className={styles.title}>ZapSign</h1>
        <p className={styles.subtitle}>Product Guidelines</p>
        <div className={styles.divider} />
        <GoogleSignInButton error={error} showDevBypass={IS_DEV} />
      </div>
      <p className={styles.footer}>
        Acesso restrito ao time ZapSign
      </p>
    </div>
  );
}
