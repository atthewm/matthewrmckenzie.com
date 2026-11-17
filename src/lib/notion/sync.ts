// ============================================================================
// NOTION SYNC: ORCHESTRATION
// ============================================================================
// Pulls every (or one) dataset from Notion, normalizes rows, and writes them to
// the Supabase cache. Called by the scheduled /api/notion/sync route.
//
// Everything the site reads is served from that cache, so this is the only
// place that talks to Notion. Each dataset is isolated: one failing database
// leaves the others (and the cached copy of the failing one) intact.
//
// Two kinds of run (see incremental.ts for the rules):
//   incremental  ask Notion only for rows edited since the dataset's last
//                successful run and upsert those. The everyday case.
//   full         read the whole database, upsert it and prune what is gone.
//                Once a week per dataset, and whenever there is no earlier
//                run to be incremental against.
// A dataset that aggregates a whole table (top-foods) cannot be patched from a
// few changed rows, so it is skipped on incremental runs and recomputed by the
// weekly full run.
// ============================================================================

import { queryDatabase, type QueryResult } from "./client";
import { NOTION_DB } from "./config";
import {
  DATASET_LIST,
  getDataset,
  type CacheRow,
  type DatasetDef,
  type SyncContext,
} from "./datasets";
import {
  writeDataset,
  upsertRows,
  deleteRows,
  readSyncState,
  writeSyncState,
  recordSyncRuns,
  type SyncRunRecord,
} from "./cache";
import {
  chooseMode,
  incrementalSince,
  lastEditedSinceFilter,
  type DatasetSyncState,
  type RequestedMode,
} from "./incremental";
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
 * Per-run memo for whole-database reads.
 *
 * Daily Logs is read twice in a full run: once to build the meal-entry day map
 * and once as the nutrition dataset itself. Caching it avoids paying for the
 * same pagination twice. Only the small reference databases are retained; the
 * meal log runs to thousands of rows and is read exactly once, so holding it
 * would cost memory for nothing. Filtered (incremental) queries never go
 * through here.
 */
function makeQueryCache() {
  const cache = new Map<string, QueryResult>();
  const retain = new Set<string>([NOTION_DB.nutrition, NOTION_DB.people]);

  return async function cachedQuery(databaseId: string, max?: number) {
    const hit = cache.get(databaseId);
    if (hit) return hit;
    const result = await queryDatabase(databaseId, { max });
    if (retain.has(databaseId)) cache.set(databaseId, result);
    return result;
  };
}

type CachedQuery = ReturnType<typeof makeQueryCache>;

async function buildPeopleMap(query: CachedQuery): Promise<Record<string, string>> {
  const map: Record<string, string> = {};
  try {
    const { pages, truncated } = await query(NOTION_DB.people);
    if (truncated) {
      console.warn("[notion-sync] People hit the row cap; some relations will not resolve");
    }
    for (const p of pages) map[p.id] = primaryTitle(p);
  } catch {
    // People DB optional: relations just won't resolve to names.
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
    const { pages, truncated } = await query(NOTION_DB.nutrition);
    if (truncated) {
      console.warn("[notion-sync] Daily Logs hit the row cap; day counts will under-report");
    }
    for (const d of pages) {
      const date = getDate(d, "Log Date") || primaryTitle(d);
      if (date) map[d.id] = date;
    }
  } catch {
    // Optional: without it, "days logged" just under-counts.
  }
  return map;
}

/**
 * Relation lookup tables, each built at most once per run and only when a
 * dataset that needs it actually has rows to map. On a quiet incremental run
 * neither is fetched.
 */
function makeContextLoader(query: CachedQuery) {
  let people: Promise<Record<string, string>> | undefined;
  let days: Promise<Record<string, string>> | undefined;

  return async function contextFor(def: DatasetDef): Promise<SyncContext> {
    const needs = def.needs ?? [];
    const [peopleById, dayById] = await Promise.all([
      needs.includes("people") ? (people ??= buildPeopleMap(query)) : Promise.resolve({}),
      needs.includes("days") ? (days ??= buildDayMap(query)) : Promise.resolve({}),
    ]);
    return { peopleById, dayById };
  };
}

type ContextLoader = ReturnType<typeof makeContextLoader>;

export type DatasetRunMode = "full" | "incremental" | "skipped";

export interface DatasetResult {
  key: string;
  mode: DatasetRunMode;
  /** Rows written (full: the whole dataset; incremental: the changed rows). */
  count: number;
  ms: number;
  error?: string;
}

export interface SyncSummary {
  ok: boolean;
  ms: number;
  results: DatasetResult[];
}

export interface SyncOptions {
  /** "auto" (default) lets each dataset decide; "full" forces a rebuild. */
  mode?: RequestedMode;
  /** Clock override for tests. */
  now?: Date;
}

interface Outcome {
  count: number;
  error?: string;
}

/** Whole database in, upsert everything, prune what Notion no longer has. */
async function runFull(def: DatasetDef, query: CachedQuery, contextFor: ContextLoader): Promise<Outcome> {
  const { pages, truncated } = await query(def.databaseId, def.maxRows);
  const filtered = def.rowFilter ? pages.filter(def.rowFilter) : pages;
  const ctx = await contextFor(def);

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

  // The rows that did arrive are still written: stale-but-partial beats
  // dropping the dataset. The run is marked failed so a silent shortfall
  // cannot hide behind a green status the way the film shelf did.
  const error = truncated
    ? `row cap reached: wrote ${count} rows but the source has more`
    : undefined;
  return { count, error };
}

/** Only the rows edited since `since`: upsert the ones that still belong, drop the rest. */
async function runIncremental(def: DatasetDef, since: string, contextFor: ContextLoader): Promise<Outcome> {
  if (!def.transform) {
    throw new Error(`dataset "${def.key}" has no per-row transform and cannot sync incrementally`);
  }
  const { pages, truncated } = await queryDatabase(def.databaseId, {
    filter: lastEditedSinceFilter(since),
    max: def.maxRows,
  });
  if (pages.length === 0) return { count: 0 };

  const ctx = await contextFor(def);
  const rows: CacheRow[] = [];
  const gone: string[] = [];
  for (const page of pages) {
    const row = !def.rowFilter || def.rowFilter(page) ? def.transform(page, ctx) : null;
    if (row) rows.push(row);
    // Edited, and no longer part of this dataset: make sure it is not cached.
    else gone.push(page.id);
  }

  const count = await upsertRows(def.key, rows);
  if (gone.length) await deleteRows(def.key, gone);

  const error = truncated
    ? `row cap reached: wrote ${count} changed rows but more were edited`
    : undefined;
  return { count, error };
}

/** Run the sync for all datasets, or just one when `only` is provided. */
export async function runSync(only?: string, options: SyncOptions = {}): Promise<SyncSummary> {
  const startedAt = options.now ?? new Date();
  const startedIso = startedAt.toISOString();
  const requested = options.mode ?? "auto";
  const defs = (only ? [getDataset(only)] : DATASET_LIST).filter(
    (d): d is DatasetDef => Boolean(d)
  );

  const states = await readSyncState(defs.map((d) => d.key));
  const query = makeQueryCache();
  const contextFor = makeContextLoader(query);

  const results: DatasetResult[] = [];

  for (const def of defs) {
    const began = Date.now();
    const state: DatasetSyncState | undefined = states[def.key];
    const mode = chooseMode({ requested, state, now: startedAt });

    if (mode === "incremental" && def.aggregate) {
      results.push({ key: def.key, mode: "skipped", count: 0, ms: 0 });
      continue;
    }

    try {
      const outcome =
        mode === "incremental" && state?.lastRunAt
          ? await runIncremental(def, incrementalSince(state.lastRunAt), contextFor)
          : await runFull(def, query, contextFor);

      // Only a clean run moves the window forward. The run's start time is
      // recorded, not its end, so edits made while it ran are picked up next
      // time.
      if (!outcome.error) {
        await writeSyncState(def.key, {
          lastRunAt: startedIso,
          lastFullAt: mode === "full" ? startedIso : state?.lastFullAt ?? null,
        });
      }
      results.push({ key: def.key, mode, count: outcome.count, ms: Date.now() - began, error: outcome.error });
    } catch (err: any) {
      results.push({
        key: def.key,
        mode,
        count: 0,
        ms: Date.now() - began,
        error: String(err?.message ?? err),
      });
    }
  }

  const runs: SyncRunRecord[] = results
    .filter((r) => r.mode !== "skipped")
    .map((r) => ({
      dataset: r.key,
      ok: !r.error,
      rowCount: r.count,
      ms: r.ms,
      error: r.error ?? null,
    }));
  await recordSyncRuns(runs);

  return {
    ok: results.every((r) => !r.error),
    ms: Date.now() - startedAt.getTime(),
    results,
  };
}
