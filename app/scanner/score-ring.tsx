"use client";

export function ScoreRing({ score }: { score: number }) {
  const radius = 54;
  const stroke = 6;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const color =
    score >= 70 ? "var(--success)" : score >= 40 ? "var(--warning)" : "var(--error)";
  const label = score >= 70 ? "Good" : score >= 40 ? "Caution" : "Critical";

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="128" height="128" viewBox="0 0 128 128">
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={stroke}
        />
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 64 64)"
          style={{ transition: "stroke-dashoffset 600ms ease-out" }}
        />
        <text
          x="64"
          y="58"
          textAnchor="middle"
          dominantBaseline="central"
          fill="var(--text-primary)"
          fontSize="32"
          fontFamily="var(--font-geist-mono)"
          fontWeight="700"
        >
          {score}
        </text>
        <text
          x="64"
          y="80"
          textAnchor="middle"
          dominantBaseline="central"
          fill="var(--text-muted)"
          fontSize="11"
          fontFamily="var(--font-geist-sans)"
          letterSpacing="1"
          style={{ textTransform: "uppercase" }}
        >
          / 100
        </text>
      </svg>
      <div
        className="text-[11px] uppercase tracking-[1px] font-semibold"
        style={{ color }}
      >
        {label}
      </div>
    </div>
  );
}
