import styles from "./GuideHeader.module.css";

export type JourneyTint = "blue" | "amber" | "green" | "deep";

export interface JourneyStep {
  id: string;
  label: string;
  tint: JourneyTint;
}

interface GuideHeaderProps {
  pill: string;
  title: string;
  description: string;
  meta: {
    label: string;
    detail: string;
  };
  journey?: {
    label?: string;
    duration?: string;
    steps: JourneyStep[];
  };
}

const DEFAULT_JOURNEY: JourneyStep[] = [
  { id: "01", label: "Problema", tint: "blue" },
  { id: "02", label: "Solução", tint: "amber" },
  { id: "03", label: "Entrega", tint: "green" },
];

export function GuideHeader({
  pill,
  title,
  description,
  meta,
  journey,
}: GuideHeaderProps) {
  const steps = journey?.steps ?? DEFAULT_JOURNEY;
  const journeyLabel = journey?.label ?? "Mapa da jornada";
  const duration = journey?.duration ?? "~ 2 a 4 semanas por iniciativa";

  return (
    <header className={styles.header}>
      <div className={styles.sheen} aria-hidden="true" />

      <div className={styles.top}>
        <div className={styles.pill}>
          <span className={styles.dot} />
          {pill}
        </div>
        <div className={styles.version}>
          <span className={styles.versionLabel}>{meta.label}</span>
          <span className={styles.versionDetail}>{meta.detail}</span>
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.lead}>
          <h1 className={styles.title}>
            <span className={styles.titleMain}>{title}</span>
            <span className={styles.titleAccent} aria-hidden="true">
              .
            </span>
          </h1>
          <p className={styles.desc}>{description}</p>
        </div>

        <aside className={styles.journey} aria-label={journeyLabel}>
          <div className={styles.journeyHead}>
            <span className={styles.journeyLabel}>{journeyLabel}</span>
            <span className={styles.journeyCount}>
              {String(steps.length).padStart(2, "0")} fases
            </span>
          </div>
          <ol className={styles.journeyTrack}>
            <div className={styles.journeyLine} aria-hidden="true" />
            {steps.map((step, i) => (
              <li
                key={step.id}
                className={`${styles.journeyNode} ${styles[`t_${step.tint}`]}`}
                style={{ "--node-index": i } as React.CSSProperties}
              >
                <span className={styles.journeyDot} aria-hidden="true" />
                <span className={styles.journeyMeta}>
                  <span className={styles.journeyIndex}>{step.id}</span>
                  <span className={styles.journeyName}>{step.label}</span>
                </span>
              </li>
            ))}
          </ol>
          <div className={styles.journeyFoot}>
            <svg
              className={styles.journeyClock}
              width="11"
              height="11"
              viewBox="0 0 11 11"
              fill="none"
              aria-hidden="true"
            >
              <circle
                cx="5.5"
                cy="5.5"
                r="4.3"
                stroke="currentColor"
                strokeWidth="1"
              />
              <path
                d="M5.5 3v2.6l1.6 1"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className={styles.journeyDuration}>{duration}</span>
          </div>
        </aside>
      </div>
    </header>
  );
}
