// ============================================================================
// NOTION SYNC: REST CLIENT
// ============================================================================
// Minimal fetch-based client for the Notion API. No SDK dependency (mirrors the
// direct-REST approach in src/lib/whoop/kv.ts), so the bundle stays lean and
// the build never depends on an uninstalled package.
// ============================================================================

import { NOTION_API_BASE, NOTION_API_VERSION, getNotionToken } from "./config";
import type { NotionPage } from "./properties";

/**
 * Default row cap. Was 2000, which the Films database quietly outgrew: it
 * holds 2485 titles, so the shelf served exactly 2000 and lost the rest with
 * no error anywhere. High enough now that reaching it signals a real problem.
 */
const DEFAULT_MAX_ROWS = 20000;

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

/** Rows from one database, plus whether the row cap cut the result short. */
export interface QueryResult {
  pages: NotionPage[];
  /**
   * True when `max` stopped pagination while Notion still had rows to give.
   * Callers must surface this: a truncated pull looks exactly like a complete
   * one downstream, which is how the film shelf sat 485 titles short without
   * anything reporting a problem.
   */
  truncated: boolean;
}

/**
 * Query a database, following pagination until all rows are retrieved.
 *
 * `max` is a safety valve against a runaway database, not an expected limit:
 * it is set high enough that hitting it means something is wrong, and hitting
 * it is reported rather than swallowed.
 */
export async function queryDatabase(
  databaseId: string,
  opts: { filter?: unknown; sorts?: unknown; max?: number } = {}
): Promise<QueryResult> {
  const { filter, sorts, max = DEFAULT_MAX_ROWS } = opts;
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

  // Either Notion still had more rows when we stopped, or the final page
  // carried us past the cap and the slice below drops the overflow.
  const truncated = Boolean(cursor) || results.length > max;
  return { pages: results.slice(0, max), truncated };
}
