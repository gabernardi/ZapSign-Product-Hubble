import { PasswordLoginForm } from "@/components/auth/PasswordLoginForm";
import styles from "./login.module.css";

export default function LoginPage() {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logoMark}>
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden>
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
        <PasswordLoginForm />
      </div>
      <p className={styles.footer}>Acesso restrito ao time ZapSign</p>
    </div>
  );
}
