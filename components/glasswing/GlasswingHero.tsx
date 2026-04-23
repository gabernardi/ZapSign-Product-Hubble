import styles from "./GlasswingHero.module.css";

interface GlasswingHeroProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  continueLabel: string;
  continueHref?: string;
  tone?: "default" | "lab";
}

export function GlasswingHero({
  eyebrow,
  title,
  subtitle,
  continueLabel,
  continueHref = "#introducao",
  tone = "default",
}: GlasswingHeroProps) {
  const heroClass = [styles.hero, tone === "lab" && styles.lab]
    .filter(Boolean)
    .join(" ");
  return (
    <section className={heroClass} data-tone={tone}>
      <div className={styles.artLayer} aria-hidden="true">
        <FlowArt tone={tone} />
      </div>
      <div className={styles.inner}>
        <div className={styles.content}>
          <span className={styles.eyebrow} data-comment-block="hero.eyebrow">
            <span className={styles.eyebrowDot} aria-hidden="true" />
            {eyebrow}
          </span>
          <h1 className={styles.title} data-comment-block="hero.title">
            {title}
          </h1>
          <p className={styles.subtitle} data-comment-block="hero.subtitle">
            {subtitle}
          </p>
          <a href={continueHref} className={styles.continue}>
            <span>{continueLabel}</span>
            <span aria-hidden="true" className={styles.arrow}>
              ↓
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}

function FlowArt({ tone }: { tone: "default" | "lab" }) {
  const rows = 18;
  const lines = Array.from({ length: rows }, (_, i) => i);
  const isLab = tone === "lab";

  return (
    <svg
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMid slice"
      className={styles.flowSvg}
    >
      <defs>
        <linearGradient id="gwFlowFade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="currentColor" stopOpacity={0} />
          <stop offset="35%" stopColor="currentColor" stopOpacity={0.08} />
          <stop offset="70%" stopColor="currentColor" stopOpacity={0.22} />
          <stop offset="100%" stopColor="currentColor" stopOpacity={0} />
        </linearGradient>
        <radialGradient id="gwFlowGlow" cx="0.78" cy="0.5" r="0.6">
          <stop offset="0%" stopColor="currentColor" stopOpacity={0.06} />
          <stop offset="70%" stopColor="currentColor" stopOpacity={0} />
        </radialGradient>

        {/* Lab: gradiente colorido highlighter */}
        <linearGradient id="gwFlowLab" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(182,255,122,0)" />
          <stop offset="22%" stopColor="rgba(182,255,122,0.22)" />
          <stop offset="52%" stopColor="rgba(123,233,255,0.28)" />
          <stop offset="82%" stopColor="rgba(199,164,255,0.24)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
        <radialGradient id="gwFlowLabGlow" cx="0.78" cy="0.45" r="0.65">
          <stop offset="0%" stopColor="rgba(123,233,255,0.1)" />
          <stop offset="55%" stopColor="rgba(199,164,255,0.05)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>

      <rect
        width="1200"
        height="800"
        fill={isLab ? "url(#gwFlowLabGlow)" : "url(#gwFlowGlow)"}
      />
      <g
        strokeWidth="1"
        fill="none"
        stroke={isLab ? "url(#gwFlowLab)" : "url(#gwFlowFade)"}
      >
        {lines.map((i) => {
          const y = 120 + i * 32;
          const amp = 32 + (i % 4) * 8;
          const phase = (i % 3) * 40;
          return (
            <path
              key={i}
              d={`M -50 ${y} C ${200 + phase} ${y - amp}, ${500 - phase} ${
                y + amp
              }, ${800} ${y} S ${1100 + phase} ${y - amp / 2}, 1300 ${y}`}
              opacity={0.3 + (i % 5) * 0.08}
            />
          );
        })}
      </g>
    </svg>
  );
}
