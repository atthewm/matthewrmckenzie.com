// ============================================================================
// WHOOP DAY STRAIN SERIES
// ============================================================================
// Reduces recent WHOOP cycles to a small public series: one day strain number
// per scored day, oldest first. WHOOP only; nothing else is mixed in.
// ============================================================================

export interface StrainPoint {
  /** Day the cycle started, as YYYY-MM-DD. */
  readonly date: string;
  /** Day strain on WHOOP's 0 to 21 scale, one decimal. */
  readonly strain: number;
}

interface CycleLike {
  readonly start: string;
  readonly score_state: string;
  readonly score?: { readonly strain: number };
}

/** How many recent cycles to ask WHOOP for (its page limit is 25). */
export const STRAIN_SERIES_DAYS = 14;

export function toStrainSeries(cycles: readonly CycleLike[] | null | undefined): StrainPoint[] {
  if (!cycles) return [];
  return cycles
    .filter((c) => c.score_state === "SCORED" && Number.isFinite(c.score?.strain))
    .map((c) => ({
      date: c.start.slice(0, 10),
      strain: Math.round((c.score?.strain ?? 0) * 10) / 10,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
