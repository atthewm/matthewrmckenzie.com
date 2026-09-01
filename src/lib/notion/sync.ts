// ============================================================================
// NOTION SYNC — ORCHESTRATION
// ============================================================================
// Pulls every (or one) dataset from Notion, normalizes rows, and writes them to
// the Supabase cache. Called by the scheduled /api/notion/sync route.
//
// Everything the site reads is served from that cache, so this is the only
// place that talks to Notion. Each dataset is isolated: one failing database
// leaves the others (and the cached copy of the failing one) intact.
// ============================================================================

import { queryDatabase } from "./client";
import { NOTION_DB } from "./config";
import { DATASET_LIST, getDataset, type CacheRow, type SyncContext } from "./datasets";
import { writeDataset, recordSyncRuns, type SyncRunRecord } from "./cache";
import { getDate, type NotionPage } from "./properties";

/** Find a page's title text regardless of which property holds the title. */
function primaryTitle(page: NotionPage): string {
  const props = page?.properties ?? {};
  for (const key of Object.keys(props)) {
    const p = props[key];
    if (p?.type === "title" && Array.isArray(p.title)) {
      return p.title.map((t: any) => t?.plain_text ?? "").join("").trim();
    }
  }
  return "";
}

/**
 * Per-run query memo.
 *
 * Daily Logs is read twice in a full run: once to build the meal-entry day map
 * and once as the nutrition dataset itself. Caching it avoids paying for the
 * same pagination twice. Only the small reference databases are retained; the
 * meal log runs to thousands of rows and is read exactly once, so holding it
 * would cost memory for nothing.
 */
function makeQueryCache() {
  const cache = new Map<string, NotionPage[]>();
  const retain = new Set<string>([NOTION_DB.nutrition, NOTION_DB.people]);

  return async function cachedQuery(databaseId: string, max?: number) {
    const hit = cache.get(databaseId);
    if (hit) return hit;
    const pages = await queryDatabase(databaseId, { max });
    if (retain.has(databaseId)) cache.set(databaseId, pages);
    return pages;
  };
}

type CachedQuery = ReturnType<typeof makeQueryCache>;

async function buildPeopleMap(query: CachedQuery): Promise<Record<string, string>> {
  const map: Record<string, string> = {};
  try {
    const people = await query(NOTION_DB.people, 5000);
    for (const p of people) map[p.id] = primaryTitle(p);
  } catch {
    // People DB optional — relations just won't resolve to names.
  }
  return map;
}

/**
 * Daily Log page id -> ISO date. Meal entries relate to a Daily Log rather than
 * carrying their own date, and the log's created_time is unreliable because a
 * lot of history was backfilled in bulk. The Log Date property (falling back to
 * the page title, which is the date) is the real day the food was eaten.
 */
async function buildDayMap(query: CachedQuery): Promise<Record<string, string>> {
  const map: Record<string, string> = {};
  try {
    const days = await query(NOTION_DB.nutrition, 5000);
    for (const d of days) {
      const date = getDate(d, "Log Date") || primaryTitle(d);
      if (date) map[d.id] = date;
    }
  } catch {
    // Optional: without it, "days logged" just under-counts.
  }
  return map;
}

export interface DatasetResult {
  key: string;
  count: number;
  ms: number;
  error?: string;
}

export interface SyncSummary {
  ok: boolean;
  ms: number;
  results: DatasetResult[];
}

/** Run the sync for all datasets, or just one when `only` is provided. */
export async function runSync(only?: string): Promise<SyncSummary> {
  const start = Date.now();
  const defs = only ? [getDataset(only)].filter(Boolean) : DATASET_LIST;

  const query = makeQueryCache();

  // Only pay for the relation maps the selected datasets actually need.
  const needsPeople = defs.some((d) => d?.key !== "top-foods");
  const needsDays = defs.some((d) => d?.key === "top-foods");
  const [peopleById, dayById] = await Promise.all([
    needsPeople ? buildPeopleMap(query) : Promise.resolve({}),
    needsDays ? buildDayMap(query) : Promise.resolve({}),
  ]);
  const ctx: SyncContext = { peopleById, dayById };

  const results: DatasetResult[] = [];

  for (const def of defs) {
    if (!def) continue;
    const began = Date.now();
    try {
      const pages = await query(def.databaseId, def.maxRows);
      const filtered = def.rowFilter ? pages.filter(def.rowFilter) : pages;

      let rows: CacheRow[];
      if (def.aggregate) {
        rows = def.aggregate(filtered, ctx);
      } else if (def.transform) {
        const mapped: CacheRow[] = [];
        for (const page of filtered) {
          const row = def.transform(page, ctx);
          if (row) mapped.push(row);
        }
        rows = mapped;
      } else {
        throw new Error(`dataset "${def.key}" defines neither transform nor aggregate`);
      }

      const count = await writeDataset(def.key, rows);
      results.push({ key: def.key, count, ms: Date.now() - began });
    } catch (err: any) {
      results.push({
        key: def.key,
        count: 0,
        ms: Date.now() - began,
        error: String(err?.message ?? err),
      });
    }
  }

  const runs: SyncRunRecord[] = results.map((r) => ({
    dataset: r.key,
    ok: !r.error,
    rowCount: r.count,
    ms: r.ms,
    error: r.error ?? null,
  }));
  await recordSyncRuns(runs);

  return {
    ok: results.every((r) => !r.error),
    ms: Date.now() - start,
    results,
  };
}
