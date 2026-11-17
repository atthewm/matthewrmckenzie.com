// ============================================================================
// NOTION SYNC: PROPERTY EXTRACTORS
// ============================================================================
// Tiny, dependency-free helpers that read values out of the raw property
// objects returned by the Notion REST API (version 2022-06-28). Each helper is
// null-safe and never throws on a missing/blank property.
//
// Text read here is what the site later shows, so the text helpers also
// replace em and en dashes on the way in (see normalizeDashes).
// ============================================================================

export type NotionPage = {
  id: string;
  url?: string;
  properties: Record<string, any>;
  [k: string]: any;
};

function prop(page: NotionPage, name: string): any {
  return page?.properties?.[name];
}

// ---------------------------------------------------------------------------
// Dash normalizing
// ---------------------------------------------------------------------------
// The site's copy uses no em or en dashes. Notion text is typed by hand (and
// Notion itself turns "--" into an em dash), so the dashes are replaced when
// the text is read, before it is written to the cache:
//
//   an en dash between digits, a range   "7\u201311"        -> "7 to 11"
//   a dash set off by spaces, a break    "A \u2013 B"       -> "A, B"
//   an em dash, spaced or not            "A\u2014B"         -> "A, B"
//   an en dash inside a word             "Austin\u2013Waco" -> "Austin-Waco"
//
// A break next to punctuation or at either end adds no comma of its own.
// Plain hyphens are never touched.
//
// Written with escapes so this file carries no dash characters itself:
// \u2012 figure dash, \u2013 en dash, \u2014 em dash, \u2015 horizontal bar.
// ---------------------------------------------------------------------------

const ANY_DASH = /[\u2012-\u2015]/;
/** Two or more dashes in a row, with or without spaces between them. */
const DASH_RUN = /[\u2012-\u2015](?:\s*[\u2012-\u2015])+/g;
/** An unspaced en dash between digits: "2019\u20132021". */
const RANGE_DASH = /(\d)[\u2012\u2013](?=\d)/g;
/** A dash that marks a break: any em dash, or an en dash with space on both sides. */
const BREAK_DASH = /\s*[\u2014\u2015]\s*|\s+[\u2012\u2013]\s+/g;
/** What is left: an en dash joining two words. */
const JOINING_DASH = /[\u2012\u2013]/g;

/** Replace em and en dashes in text from Notion. */
export function normalizeDashes(text: string): string {
  if (!ANY_DASH.test(text)) return text;
  return text
    .replace(DASH_RUN, "\u2014")
    .replace(RANGE_DASH, "$1 to ")
    .replace(BREAK_DASH, (match: string, offset: number, whole: string) => {
      const before = whole.slice(0, offset).trimEnd();
      const after = whole.slice(offset + match.length).trimStart();
      if (!before || !after || before.endsWith("(")) return "";
      if (/[.,;:!?]$/.test(before)) return " ";
      if (/^[.,;:!?)]/.test(after)) return "";
      return ", ";
    })
    .replace(JOINING_DASH, "-")
    .trim();
}

/**
 * Title property text. `raw` skips dash normalizing, for titles that are read
 * as data rather than shown: a date, or a name that is parsed before display.
 */
export function getTitle(page: NotionPage, name: string, opts: { raw?: boolean } = {}): string {
  const p = prop(page, name);
  const parts = p?.title;
  if (!Array.isArray(parts)) return "";
  const text = parts.map((t: any) => t?.plain_text ?? "").join("").trim();
  return opts.raw ? text : normalizeDashes(text);
}

export function getRichText(page: NotionPage, name: string): string | null {
  const p = prop(page, name);
  const parts = p?.rich_text;
  if (!Array.isArray(parts) || parts.length === 0) return null;
  const out = normalizeDashes(parts.map((t: any) => t?.plain_text ?? "").join("").trim());
  return out.length ? out : null;
}

export function getNumber(page: NotionPage, name: string): number | null {
  const p = prop(page, name);
  // Plain number, or a formula/rollup that resolves to a number.
  const candidate =
    p?.number ?? p?.formula?.number ?? p?.rollup?.number ?? null;
  return typeof candidate === "number" ? candidate : null;
}

/** Option names are shown as labels, so they are normalized like other text. */
function optionName(option: any): string | null {
  return typeof option?.name === "string" ? normalizeDashes(option.name) : null;
}

export function getSelect(page: NotionPage, name: string): string | null {
  const p = prop(page, name);
  return optionName(p?.select);
}

export function getStatus(page: NotionPage, name: string): string | null {
  const p = prop(page, name);
  return optionName(p?.status);
}

export function getMultiSelect(page: NotionPage, name: string): string[] {
  const p = prop(page, name);
  const arr = p?.multi_select;
  if (!Array.isArray(arr)) return [];
  return arr.map(optionName).filter((n): n is string => Boolean(n));
}

export function getCheckbox(page: NotionPage, name: string): boolean {
  const p = prop(page, name);
  return Boolean(p?.checkbox);
}

export function getDate(page: NotionPage, name: string): string | null {
  const p = prop(page, name);
  return p?.date?.start ?? null;
}

/**
 * created_time / last_edited_time property -> ISO string.
 * These are system properties, so the value sits directly on the property
 * object rather than under `date`.
 */
export function getTimestamp(page: NotionPage, name: string): string | null {
  const p = prop(page, name);
  const v = p?.created_time ?? p?.last_edited_time ?? null;
  return typeof v === "string" && v.length ? v : null;
}

export function getUrl(page: NotionPage, name: string): string | null {
  const p = prop(page, name);
  const v = p?.url;
  return v && String(v).length ? v : null;
}

/** Files property: prefer external URL, fall back to Notion-hosted file URL. */
export function getFileUrl(page: NotionPage, name: string): string | null {
  const p = prop(page, name);
  const files = p?.files;
  if (!Array.isArray(files) || files.length === 0) return null;
  const f = files[0];
  return f?.external?.url ?? f?.file?.url ?? null;
}

/** Relation property -> array of related page IDs. */
export function getRelationIds(page: NotionPage, name: string): string[] {
  const p = prop(page, name);
  const arr = p?.relation;
  if (!Array.isArray(arr)) return [];
  return arr.map((r: any) => r?.id).filter(Boolean);
}

/**
 * Parse a star-string select ("★★★★½") into a 0 to 5 number.
 * Returns null for non-rating values like "DNF".
 */
export function parseStars(stars: string | null): number | null {
  if (!stars) return null;
  const full = (stars.match(/★/g) || []).length;
  const half = stars.includes("½") ? 0.5 : 0;
  const value = full + half;
  return value > 0 ? value : null;
}
