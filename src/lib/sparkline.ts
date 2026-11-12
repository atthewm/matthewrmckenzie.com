// ============================================================================
// SPARKLINE GEOMETRY
// ============================================================================
// Turns a series of numbers into an SVG path. Pure, so it can be tested and
// used on the server or the client.
// ============================================================================

export interface SparkPoint {
  readonly x: number;
  readonly y: number;
}

export interface Sparkline {
  readonly path: string;
  readonly points: readonly SparkPoint[];
  readonly min: number;
  readonly max: number;
}

const round = (n: number) => Math.round(n * 100) / 100;

export function buildSparkline(
  values: readonly number[],
  width: number,
  height: number,
  padding = 4,
): Sparkline | null {
  const series = values.filter((v) => Number.isFinite(v));
  if (series.length < 2) return null;

  const min = Math.min(...series);
  const max = Math.max(...series);
  const range = max - min;
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;

  const points = series.map((value, i) => {
    const x = padding + (i / (series.length - 1)) * innerWidth;
    const ratio = range === 0 ? 0.5 : (value - min) / range;
    const y = padding + (1 - ratio) * innerHeight;
    return { x: round(x), y: round(y) };
  });

  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  return { path, points, min, max };
}
