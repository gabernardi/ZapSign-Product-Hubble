import styles from "./SceneBlock.module.css";
import { slugifyForBlockId } from "./_blockId";

type SceneKind = "river" | "ladder" | "pulse";

interface SceneBlockProps {
  kind: SceneKind;
  eyebrow: string;
  title: string;
  body: string;
  caption?: string;
}

export function SceneBlock({
  kind,
  eyebrow,
  title,
  body,
  caption,
}: SceneBlockProps) {
  const prefix = `scene.${slugifyForBlockId(title)}`;
  return (
    <section className={styles.scene}>
      <div className={styles.inner}>
        <div className={styles.art} aria-hidden="true">
          {kind === "river" && <RiverArt />}
          {kind === "ladder" && <LadderArt />}
          {kind === "pulse" && <PulseArt />}
        </div>
        <div className={styles.text}>
          <span
            className={styles.eyebrow}
            data-comment-block={`${prefix}.eyebrow`}
          >
            {eyebrow}
          </span>
          <h3 className={styles.title} data-comment-block={`${prefix}.title`}>
            {title}
          </h3>
          <p className={styles.body} data-comment-block={`${prefix}.body`}>
            {body}
          </p>
          {caption && (
            <p
              className={styles.caption}
              data-comment-block={`${prefix}.caption`}
            >
              {caption}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function RiverArt() {
  return (
    <svg viewBox="0 0 400 420" className={styles.svg}>
      <defs>
        <linearGradient id="riverStroke" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--gw-ink)" stopOpacity={0} />
          <stop offset="30%" stopColor="var(--gw-ink)" stopOpacity={0.9} />
          <stop offset="100%" stopColor="var(--gw-ink)" stopOpacity={0.2} />
        </linearGradient>
      </defs>
      <g fill="none" stroke="url(#riverStroke)" strokeWidth="1.1">
        {Array.from({ length: 22 }, (_, i) => {
          const x = 40 + i * 14;
          return (
            <path
              key={i}
              d={`M ${x} 20 C ${x + 30} 140, ${x - 30} 260, ${x + 12} 400`}
              opacity={0.3 + (i % 4) * 0.12}
            />
          );
        })}
      </g>
      <circle cx="200" cy="210" r="4" fill="var(--gw-ink)" />
      <circle
        cx="200"
        cy="210"
        r="24"
        fill="none"
        stroke="var(--gw-ink)"
        strokeWidth="0.8"
        opacity="0.5"
      />
      <circle
        cx="200"
        cy="210"
        r="56"
        fill="none"
        stroke="var(--gw-ink)"
        strokeWidth="0.6"
        opacity="0.28"
      />
    </svg>
  );
}

function LadderArt() {
  return (
    <svg viewBox="0 0 400 420" className={styles.svg}>
      <g fill="none" stroke="var(--gw-ink-3)" strokeWidth="1">
        {Array.from({ length: 6 }, (_, i) => {
          const y = 60 + i * 56;
          const len = 80 + i * 40;
          return (
            <g key={i}>
              <line x1="80" y1={y} x2={80 + len} y2={y} opacity="0.6" />
              <circle
                cx={80 + len}
                cy={y}
                r={6 - i * 0.4}
                fill="var(--gw-ink)"
                stroke="none"
                opacity={0.9 - i * 0.1}
              />
            </g>
          );
        })}
      </g>
      <text
        x="80"
        y="40"
        fontSize="11"
        fontWeight="500"
        letterSpacing="1.5"
        fill="var(--gw-ink-3)"
        fontFamily="var(--gw-font-body)"
      >
        D1 · D3 · D7 · D14 · D30 · D90
      </text>
    </svg>
  );
}

function PulseArt() {
  return (
    <svg viewBox="0 0 400 420" className={styles.svg}>
      <g fill="none" strokeLinecap="round" strokeWidth="1.4">
        <path
          d="M 20 240 L 120 240 L 140 200 L 170 280 L 200 140 L 230 300 L 260 220 L 290 240 L 380 240"
          stroke="var(--gw-ink-2)"
        />
        <path
          d="M 20 280 L 380 280"
          stroke="var(--gw-rule)"
          strokeDasharray="4 4"
        />
      </g>
      <g fontFamily="var(--gw-font-body)" fontSize="11" fill="var(--gw-ink-3)">
        <text x="20" y="360">início</text>
        <text x="195" y="360" textAnchor="middle">D7</text>
        <text x="380" y="360" textAnchor="end">D30</text>
      </g>
      <circle cx="200" cy="140" r="5" fill="var(--gw-ink)" />
      <circle
        cx="200"
        cy="140"
        r="14"
        fill="none"
        stroke="var(--gw-ink)"
        strokeWidth="1"
        opacity="0.45"
      />
    </svg>
  );
}
