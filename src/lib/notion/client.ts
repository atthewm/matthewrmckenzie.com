// ============================================================================
// NOTION SYNC — REST CLIENT
// ============================================================================
// Minimal fetch-based client for the Notion API. No SDK dependency (mirrors the
// direct-REST approach in src/lib/whoop/kv.ts), so the bundle stays lean and
// the build never depends on an uninstalled package.
// ============================================================================

import { NOTION_API_BASE, NOTION_API_VERSION, getNotionToken } from "./config";
import type { NotionPage } from "./properties";

interface QueryBody {
  page_size?: number;
  start_cursor?: string;
  filter?: unknown;
  sorts?: unknown;
}

async function notionFetch(path: string, body: unknown): Promise<any> {
  const token = getNotionToken();
  if (!token) throw new Error("NOTION_TOKEN is not configured");

  const res = await fetch(`${NOTION_API_BASE}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": NOTION_API_VERSION,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body ?? {}),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Notion ${path} failed (${res.status}): ${text.slice(0, 300)}`);
  }
  return res.json();
}

/**
 * Query a database, following pagination until all rows are retrieved.
 * `max` caps the number of rows (safety valve for very large DBs).
 */
export async function queryDatabase(
  databaseId: string,
  opts: { filter?: unknown; sorts?: unknown; max?: number } = {}
): Promise<NotionPage[]> {
  const { filter, sorts, max = 2000 } = opts;
  const results: NotionPage[] = [];
  let cursor: string | undefined;

  do {
    const body: QueryBody = { page_size: 100 };
    if (cursor) body.start_cursor = cursor;
    if (filter) body.filter = filter;
    if (sorts) body.sorts = sorts;

    const json = await notionFetch(`/databases/${databaseId}/query`, body);
    const batch: NotionPage[] = Array.isArray(json?.results) ? json.results : [];
    results.push(...batch);
    cursor = json?.has_more ? json?.next_cursor : undefined;
  } while (cursor && results.length < max);

  return results.slice(0, max);
}
