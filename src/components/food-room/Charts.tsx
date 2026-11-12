import React from "react";

// ============================================================================
// FOOD ROOM: small inline SVG charts (no chart library)
// ============================================================================
// Colours are the reading site's tokens, so the charts follow light and dark.
// ============================================================================

export const PALETTE = {
  protein: "var(--site-chart-2)",
  carbs: "var(--site-gold)",
  fat: "var(--site-link)",
  fiber: "var(--site-chart-1)",
  calories: "var(--site-ink)",
};

export function HBars({
  rows,
  color = "var(--site-ink)",
  unit = "",
  digits = 0,
}: {
  rows: { label: string; value: number; note?: string }[];
  color?: string;
  unit?: string;
  digits?: number;
}) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <ul className="food-bars">
      {rows.map((r) => (
        <li key={r.label}>
          <div className="food-bars-row">
            <span className="food-bars-label">{r.label}</span>
            <span className="food-bars-value">
              {r.value.toFixed(digits)}
              {unit}
              {r.note ? ` · ${r.note}` : ""}
            </span>
          </div>
          <div className="food-bars-track">
            <span style={{ width: `${(r.value / max) * 100}%`, background: color }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function Donut({ parts, size = 120 }: { parts: { label: string; value: number; color: string }[]; size?: number }) {
  const total = parts.reduce((s, p) => s + p.value, 0) || 1;
  const r = 40;
  const c = 2 * Math.PI * r;
  const lengths = parts.map((p) => (p.value / total) * c);
  const offsets = lengths.map((_, i) => lengths.slice(0, i).reduce((a, b) => a + b, 0));
  return (
    <div className="food-donut">
      <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label={parts.map((p) => `${p.label} ${Math.round((p.value / total) * 100)}%`).join(", ")}>
        <circle cx={50} cy={50} r={r} fill="none" stroke="var(--site-rule)" strokeWidth={12} />
        {parts.map((p, i) => (
          <circle
            key={p.label}
            cx={50}
            cy={50}
            r={r}
            fill="none"
            stroke={p.color}
            strokeWidth={12}
            strokeDasharray={`${lengths[i]} ${c - lengths[i]}`}
            strokeDashoffset={-offsets[i]}
            transform="rotate(-90 50 50)"
          />
        ))}
      </svg>
      <ul className="food-legend">
        {parts.map((p) => (
          <li key={p.label}>
            <i style={{ background: p.color }} />
            {p.label} <span>{Math.round((p.value / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Daily series with an optional target line. Values may be null (gaps). */
export function TrendLine({
  points,
  target,
  color,
  height = 110,
  unit = "",
}: {
  points: { label: string; value: number | null }[];
  target?: number | null;
  color: string;
  height?: number;
  unit?: string;
}) {
  const vals = points.map((p) => p.value).filter((v): v is number => v != null);
  if (!vals.length) return <p className="food-panel-empty">No days logged yet.</p>;
  const max = Math.max(...vals, target ?? 0) * 1.1;
  const w = 300;
  const step = points.length > 1 ? w / (points.length - 1) : w;
  const y = (v: number) => height - (v / max) * (height - 10) - 4;
  const d = points
    .map((p, i) => (p.value == null ? "" : `${i > 0 && points[i - 1]?.value != null ? "L" : "M"}${(i * step).toFixed(1)} ${y(p.value).toFixed(1)}`))
    .filter(Boolean)
    .join(" ");
  const last = [...points].reverse().find((p) => p.value != null);
  return (
    <div>
      <svg viewBox={`0 0 ${w} ${height}`} className="w-full" style={{ height }} preserveAspectRatio="none" role="img" aria-label={`Latest ${last?.value ?? ""}${unit}`}>
        {target != null && (
          <line x1={0} x2={w} y1={y(target)} y2={y(target)} stroke="var(--site-muted)" strokeDasharray="4 4" strokeWidth={1} vectorEffect="non-scaling-stroke" />
        )}
        <path d={d} fill="none" stroke={color} strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="food-trend-axis">
        <span>{points[0]?.label}</span>
        {target != null && (
          <span>
            dashed line: target {Math.round(target)}
            {unit}
          </span>
        )}
        <span>{points[points.length - 1]?.label}</span>
      </div>
    </div>
  );
}
