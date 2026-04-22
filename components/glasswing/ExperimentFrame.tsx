import Link from "next/link";
import styles from "./ExperimentFrame.module.css";

export interface ExperimentFrameProps {
  id: string;
  title: string;
  host: string;
  status?: string;
  backHref?: string;
  backLabel?: string;
  footnote?: string;
  children: React.ReactNode;
}

export function ExperimentFrame({
  id,
  title,
  host,
  status,
  backHref = "/dashboard/contribuir",
  backLabel = "Laboratório",
  footnote,
  children,
}: ExperimentFrameProps) {
  return (
    <div className={styles.stage}>
      <div className={styles.stageBg} aria-hidden="true" />
      <div className={styles.window} role="group" aria-label={title}>
        <div className={styles.chrome}>
          <div className={styles.chromeLeft} aria-hidden="true">
            <span className={`${styles.dot} ${styles.dot1}`} />
            <span className={`${styles.dot} ${styles.dot2}`} />
            <span className={`${styles.dot} ${styles.dot3}`} />
          </div>

          <div className={styles.chromeCenter}>
            <div className={styles.urlBar}>
              <span className={styles.urlLock} aria-hidden="true">
                <svg
                  width="10"
                  height="12"
                  viewBox="0 0 10 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2 5V3.5a3 3 0 0 1 6 0V5"
                    stroke="currentColor"
                    strokeWidth="1.1"
                    strokeLinecap="round"
                  />
                  <rect
                    x="1.25"
                    y="5"
                    width="7.5"
                    height="6"
                    rx="1.2"
                    stroke="currentColor"
                    strokeWidth="1.1"
                  />
                </svg>
              </span>
              <span className={styles.urlScheme}>https://</span>
              <span className={styles.urlHost}>{host}</span>
              <span className={styles.urlDivider} aria-hidden="true">
                ·
              </span>
              <span className={styles.urlChip}>
                LAB · {id}
                {status ? ` · ${status.toUpperCase()}` : ""}
              </span>
            </div>
          </div>

          <div className={styles.chromeRight}>
            <Link
              href={backHref}
              className={styles.exit}
              aria-label={`Sair do experimento e voltar para ${backLabel}`}
            >
              <span className={styles.exitIcon} aria-hidden="true">
                ×
              </span>
              <span className={styles.exitLabel}>{backLabel}</span>
            </Link>
          </div>
        </div>

        <div className={styles.surface}>{children}</div>

        {footnote && (
          <div className={styles.status}>
            <span className={styles.statusDot} aria-hidden="true" />
            <span className={styles.statusText}>{footnote}</span>
          </div>
        )}
      </div>
    </div>
  );
}
