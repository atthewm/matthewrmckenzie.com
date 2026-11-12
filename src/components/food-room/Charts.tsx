import React from "react";

// ============================================================================
// FOOD ROOM: small inline SVG charts (no chart library)
// ============================================================================

export const PALETTE = {
  protein: "#e4572e",
  carbs: "#f3a712",
  fat: "#4e8fd8",
  fiber: "#5cb85c",
  calories: "#9b5de5",
};

export function HBars({
  rows,
  color = "var(--desktop-accent)",
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
    <ul className="space-y-1.5">
      {rows.map((r) => (
        <li key={r.label} className="text-[11px]">
          <div className="flex items-baseline justify-between gap-2">
            <span className="truncate text-desktop-text">{r.label}</span>
            <span className="shrink-0 tabular-nums text-desktop-text-secondary">
              {r.value.toFixed(digits)}
              {unit}
              {r.note ? ` · ${r.note}` : ""}
            </span>
          </div>
          <div className="mt-0.5 h-2 overflow-hidden rounded-full" style={{ background: "var(--desktop-border)" }}>
            <div className="h-full rounded-full" style={{ width: `${(r.value / max) * 100}%`, background: color }} />
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
  let offset = 0;
  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label={parts.map((p) => `${p.label} ${Math.round((p.value / total) * 100)}%`).join(", ")}>
        <circle cx={50} cy={50} r={r} fill="none" stroke="var(--desktop-border)" strokeWidth={14} />
        {parts.map((p) => {
          const len = (p.value / total) * c;
          const el = (
            <circle
              key={p.label}
              cx={50}
              cy={50}
              r={r}
              fill="none"
              stroke={p.color}
              strokeWidth={14}
              strokeDasharray={`${len} ${c - len}`}
              strokeDashoffset={-offset}
              transform="rotate(-90 50 50)"
            />
          );
          offset += len;
          return el;
        })}
      </svg>
      <ul className="space-y-1 text-[11px]">
        {parts.map((p) => (
          <li key={p.label} className="flex items-center gap-2 text-desktop-text">
            <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: p.color }} />
            {p.label} <span className="tabular-nums text-desktop-text-secondary">{Math.round((p.value / total) * 100)}%</span>
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
  if (!vals.length) return <p className="text-[11px] text-desktop-text-secondary">No days logged yet.</p>;
  const max = Math.max(...vals, target ?? 0) * 1.1;
  const w = 300;
  const step = points.length > 1 ? w / (points.length - 1) : w;
  const y = (v: number) => height - (v / max) * (height - 10) - 4;
  let d = "";
  points.forEach((p, i) => {
    if (p.value == null) return;
    d += `${d && points[i - 1]?.value != null ? "L" : "M"}${(i * step).toFixed(1)} ${y(p.value).toFixed(1)} `;
  });
  const last = [...points].reverse().find((p) => p.value != null);
  return (
    <div>
      <svg viewBox={`0 0 ${w} ${height}`} className="w-full" style={{ height }} preserveAspectRatio="none" role="img" aria-label={`Latest ${last?.value ?? ""}${unit}`}>
        {target != null && (
          <line x1={0} x2={w} y1={y(target)} y2={y(target)} stroke="var(--desktop-text-secondary)" strokeDasharray="4 4" strokeWidth={1} vectorEffect="non-scaling-stroke" />
        )}
        <path d={d} fill="none" stroke={color} strokeWidth={2} vectorEffect="non-scaling-stroke" />
        {points.map((p, i) =>
          p.value == null ? null : <circle key={i} cx={i * step} cy={y(p.value)} r={2.5} fill={color} />
        )}
      </svg>
      <div className="mt-1 flex justify-between text-[10px] text-desktop-text-secondary">
        <span>{points[0]?.label}</span>
        {target != null && <span>dashed line: target {Math.round(target)}{unit}</span>}
        <span>{points[points.length - 1]?.label}</span>
      </div>
    </div>
  );
}
