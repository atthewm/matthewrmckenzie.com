// ============================================================================
// PAGE DATES: when each page last changed
// ============================================================================
// The sitemap and the feed need a real "last changed" date per page. Stamping
// the build time on everything tells crawlers that every page changed on every
// deploy, so dates come from the content instead:
//   - markdown pages carry `updated:` (or `date:`) in their frontmatter
//   - pages written in code use the fixed dates below
// Bump a date in the same change that edits the page.
// ============================================================================

import fs from "fs";
import path from "path";
import matter from "gray-matter";

const contentDirectory = path.join(process.cwd(), "src/content");

/** Pages whose content lives in code rather than markdown. */
export const PAGE_UPDATED = {
  home: "2026-11-17",
  card: "2026-11-17",
  /** Also printed on /privacy as the policy's "Last updated" date. */
  privacy: "2026-03-12",
} as const;

/** Used when a content file has no usable date. Never the build time. */
export const FALLBACK_DATE = PAGE_UPDATED.home;

const ISO_DAY = /^\d{4}-\d{2}-\d{2}/;

/**
 * Normalize a frontmatter date to YYYY-MM-DD. YAML turns an unquoted
 * 2026-11-02 into a Date, a quoted one stays a string; both are accepted.
 */
export function toIsoDay(value: unknown): string | null {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.toISOString().slice(0, 10);
  }
  if (typeof value === "string" && ISO_DAY.test(value)) {
    const day = value.slice(0, 10);
    return Number.isNaN(new Date(`${day}T00:00:00Z`).getTime()) ? null : day;
  }
  return null;
}

/** First usable date among `updated`, `dateModified` and `date`. */
export function frontmatterDate(data: Record<string, unknown>): string | null {
  return toIsoDay(data.updated) ?? toIsoDay(data.dateModified) ?? toIsoDay(data.date);
}

/** Last changed date of a markdown file under src/content, e.g. "about". */
export function contentDate(slug: string): string {
  try {
    const raw = fs.readFileSync(path.join(contentDirectory, `${slug}.md`), "utf8");
    return frontmatterDate(matter(raw).data) ?? FALLBACK_DATE;
  } catch {
    return FALLBACK_DATE;
  }
}

/** The most recent of several YYYY-MM-DD dates. */
export function latestDate(dates: readonly string[]): string {
  return dates.reduce((latest, d) => (d > latest ? d : latest), "") || FALLBACK_DATE;
}

/** "2026-03-12" -> "March 12, 2026", for dates shown in page copy. */
export function formatLongDate(isoDay: string): string {
  return new Date(`${isoDay}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

/** RFC 822 date for RSS, taken at midnight UTC so the weekday is always right. */
export function toRssDate(isoDay: string): string {
  return new Date(`${isoDay}T00:00:00Z`).toUTCString();
}
