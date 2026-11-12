// ============================================================================
// PROSE HELPERS
// ============================================================================
// Pure string helpers for the reading layout. The markdown loader returns one
// HTML string; the page layout needs the title, the intro and each h2 section
// separately so headings can hang in the left columns.
// The HTML comes from this repo's own markdown, never from user input.
// ============================================================================

export interface ProseSection {
  readonly id: string;
  /** Inner HTML of the h2 (may contain inline tags and entities). */
  readonly heading: string;
  readonly html: string;
}

export interface SplitProse {
  readonly title: string | null;
  readonly intro: string;
  readonly sections: readonly ProseSection[];
}

const H1_PATTERN = /<h1[^>]*>([\s\S]*?)<\/h1>/;
const H2_PATTERN = /<h2[^>]*>([\s\S]*?)<\/h2>/g;

export function slugifyHeading(heading: string): string {
  const slug = heading
    .replace(/<[^>]+>/g, "")
    .replace(/&[#\w]+;/g, " ")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "section";
}

function uniqueId(base: string, used: ReadonlyMap<string, number>): string {
  const count = used.get(base) ?? 0;
  return count === 0 ? base : `${base}-${count + 1}`;
}

export function splitProse(html: string): SplitProse {
  const titleMatch = html.match(H1_PATTERN);
  const title = titleMatch ? titleMatch[1].trim() : null;
  const body = titleMatch ? html.replace(H1_PATTERN, "") : html;

  const headings = [...body.matchAll(H2_PATTERN)];
  if (headings.length === 0) {
    return { title, intro: body.trim(), sections: [] };
  }

  const intro = body.slice(0, headings[0].index).trim();
  const used = new Map<string, number>();
  const sections = headings.map((match, i) => {
    const start = (match.index ?? 0) + match[0].length;
    const end = i + 1 < headings.length ? headings[i + 1].index : body.length;
    const heading = match[1].trim();
    const base = slugifyHeading(heading);
    const id = uniqueId(base, used);
    used.set(base, (used.get(base) ?? 0) + 1);
    return { id, heading, html: body.slice(start, end).trim() };
  });

  return { title, intro, sections };
}

// Matches, in order: a whole heading element, any tag, an entity, or a number
// (integers, decimals, fractions and ranges like 1/2 or 2.5). Only the number
// branch is rewritten.
const NUMBER_PATTERN = /(<h[1-6][^>]*>[\s\S]*?<\/h[1-6]>)|(<[^>]+>)|(&[#\w]+;)|(\d+(?:[.,/]\d+)*)/g;

/** Wraps numbers in running text with span.num so they can be set in mono. */
export function monoNumbers(html: string): string {
  return html.replace(NUMBER_PATTERN, (match, heading, tag, entity, num) =>
    num ? `<span class="num">${num}</span>` : match,
  );
}

const DESKTOP_OPEN_LINK = /href="\/desktop\?open=([a-z0-9-]+)"/g;

/**
 * The markdown links recipes to the desktop (/desktop?open=slug) because the
 * desktop reads the same files. On the reading site, point those links at the
 * recipe's own page instead. Links to anything else are left as they are.
 */
export function linkRecipesOnSite(html: string, recipeSlugs: ReadonlySet<string>): string {
  return html.replace(DESKTOP_OPEN_LINK, (match, slug: string) =>
    recipeSlugs.has(slug) ? `href="/recipes/${slug}"` : match,
  );
}
