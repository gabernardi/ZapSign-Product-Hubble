import styles from "./TimelineChart.module.css";

interface TimelinePoint {
  label: string;
  value: number;
  caption?: string;
}

interface TimelineChartProps {
  title: string;
  description?: string;
  series: TimelinePoint[];
  unit?: string;
  yMax?: number;
}

export function TimelineChart({
  title,
  description,
  series,
  unit = "%",
  yMax,
}: TimelineChartProps) {
  const width = 720;
  const height = 320;
  const padLeft = 48;
  const padRight = 32;
  const padTop = 28;
  const padBottom = 56;

  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const max = yMax ?? Math.max(...series.map((p) => p.value), 100);

  const xFor = (i: number) =>
    padLeft + (i / (series.length - 1)) * chartW;
  const yFor = (v: number) => padTop + chartH - (v / max) * chartH;

  const linePath = series
    .map((p, i) => `${i === 0 ? "M" : "L"} ${xFor(i)} ${yFor(p.value)}`)
    .join(" ");

  const areaPath = `${linePath} L ${xFor(series.length - 1)} ${
    padTop + chartH
  } L ${xFor(0)} ${padTop + chartH} Z`;

  const gridLines = [0, 0.25, 0.5, 0.75, 1].map(
    (f) => padTop + chartH - f * chartH,
  );

  return (
    <figure className={styles.chart}>
      <figcaption className={styles.caption}>
        <h3 className={styles.title}>{title}</h3>
        {description && <p className={styles.description}>{description}</p>}
      </figcaption>

      <div className={styles.svgWrap}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className={styles.svg}
          role="img"
          aria-label={title}
        >
          <defs>
            <linearGradient id="gwTlArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--gw-ink)" stopOpacity={0.16} />
              <stop offset="100%" stopColor="var(--gw-ink)" stopOpacity={0} />
            </linearGradient>
          </defs>

          {gridLines.map((y, i) => (
            <line
              key={i}
              x1={padLeft}
              x2={width - padRight}
              y1={y}
              y2={y}
              stroke="var(--gw-rule)"
              strokeWidth="1"
              strokeDasharray={i === gridLines.length - 1 ? "0" : "3 5"}
            />
          ))}

          {[0, 0.5, 1].map((f, i) => {
            const v = Math.round(f * max);
            const y = padTop + chartH - f * chartH;
            return (
              <text
                key={i}
                x={padLeft - 14}
                y={y + 4}
                textAnchor="end"
                fontSize="11"
                fill="var(--gw-ink-3)"
                fontFamily="var(--gw-font-body)"
              >
                {v}
                {unit}
              </text>
            );
          })}

          <path d={areaPath} fill="url(#gwTlArea)" />

          <path
            d={linePath}
            fill="none"
            stroke="var(--gw-ink)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {series.map((p, i) => (
            <g key={p.label}>
              <circle
                cx={xFor(i)}
                cy={yFor(p.value)}
                r="5"
                fill="var(--gw-bg)"
                stroke="var(--gw-ink)"
                strokeWidth="2"
              />
              <text
                x={xFor(i)}
                y={yFor(p.value) - 14}
                textAnchor="middle"
                fontSize="14"
                fontWeight="500"
                fill="var(--gw-ink)"
                fontFamily="var(--gw-font-display)"
                style={{ fontVariationSettings: '"opsz" 36' }}
              >
                {p.value}
                {unit}
              </text>
              <text
                x={xFor(i)}
                y={padTop + chartH + 24}
                textAnchor="middle"
                fontSize="12"
                fontWeight="500"
                fill="var(--gw-ink-3)"
                fontFamily="var(--gw-font-body)"
              >
                {p.label}
              </text>
              {p.caption && (
                <text
                  x={xFor(i)}
                  y={padTop + chartH + 42}
                  textAnchor="middle"
                  fontSize="11"
                  fill="var(--gw-ink-4)"
                  fontFamily="var(--gw-font-body)"
                >
                  {p.caption}
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>
    </figure>
  );
}
