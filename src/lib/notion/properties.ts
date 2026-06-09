// ============================================================================
// NOTION SYNC — PROPERTY EXTRACTORS
// ============================================================================
// Tiny, dependency-free helpers that read values out of the raw property
// objects returned by the Notion REST API (version 2022-06-28). Each helper is
// null-safe and never throws on a missing/blank property.
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

export function getTitle(page: NotionPage, name: string): string {
  const p = prop(page, name);
  const parts = p?.title;
  if (!Array.isArray(parts)) return "";
  return parts.map((t: any) => t?.plain_text ?? "").join("").trim();
}

export function getRichText(page: NotionPage, name: string): string | null {
  const p = prop(page, name);
  const parts = p?.rich_text;
  if (!Array.isArray(parts) || parts.length === 0) return null;
  const out = parts.map((t: any) => t?.plain_text ?? "").join("").trim();
  return out.length ? out : null;
}

export function getNumber(page: NotionPage, name: string): number | null {
  const p = prop(page, name);
  // Plain number, or a formula/rollup that resolves to a number.
  const candidate =
    p?.number ?? p?.formula?.number ?? p?.rollup?.number ?? null;
  return typeof candidate === "number" ? candidate : null;
}

export function getSelect(page: NotionPage, name: string): string | null {
  const p = prop(page, name);
  return p?.select?.name ?? null;
}

export function getStatus(page: NotionPage, name: string): string | null {
  const p = prop(page, name);
  return p?.status?.name ?? null;
}

export function getMultiSelect(page: NotionPage, name: string): string[] {
  const p = prop(page, name);
  const arr = p?.multi_select;
  if (!Array.isArray(arr)) return [];
  return arr.map((o: any) => o?.name).filter(Boolean);
}

export function getCheckbox(page: NotionPage, name: string): boolean {
  const p = prop(page, name);
  return Boolean(p?.checkbox);
}

export function getDate(page: NotionPage, name: string): string | null {
  const p = prop(page, name);
  return p?.date?.start ?? null;
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
 * Parse a star-string select ("★★★★½") into a 0–5 number.
 * Returns null for non-rating values like "DNF".
 */
export function parseStars(stars: string | null): number | null {
  if (!stars) return null;
  const full = (stars.match(/★/g) || []).length;
  const half = stars.includes("½") ? 0.5 : 0;
  const value = full + half;
  return value > 0 ? value : null;
}
