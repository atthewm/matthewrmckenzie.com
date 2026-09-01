// ============================================================================
// NOTION SYNC — SUPABASE CACHE
// ============================================================================
// The sync writes normalized rows here; the read API serves from here. Using a
// cache (instead of hitting Notion on every page view) keeps reads fast, avoids
// Notion rate limits, and lets the site work even if Notion is briefly down.
//
// Writes require the service-role key (server only). Reads also run server-side.
// Everything degrades gracefully when env vars are absent.
// ============================================================================

// @ts-ignore - types provided by @supabase/supabase-js at runtime
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { CacheRow } from "./datasets";

export const CACHE_TABLE = "notion_cache";
export const RUNS_TABLE = "notion_sync_runs";

/**
 * Sentinel `dataset` value for a run that never got as far as a dataset,
 * because the deployment was misconfigured. Kept distinct from every real
 * dataset key so it cannot collide with one.
 */
export const CONFIG_DATASET = "_config";

/** Supabase rejects very large payloads, so upserts go up in batches. */
const BATCH_SIZE = 500;

let cached: SupabaseClient | null | undefined;

/** Service-role client for reads + writes. Null when not configured. */
export function getServiceClient(): SupabaseClient | null {
  if (cached !== undefined) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  cached = url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;
  return cached;
}

/** Number of rows currently cached for a dataset. */
async function countDataset(supabase: SupabaseClient, dataset: string): Promise<number> {
  const { count, error } = await supabase
    .from(CACHE_TABLE)
    .select("id", { count: "exact", head: true })
    .eq("dataset", dataset);
  if (error) throw new Error(`cache count failed: ${error.message}`);
  return count ?? 0;
}

/**
 * Write a dataset's rows. Returns the number of rows written.
 *
 * Upsert-then-prune rather than delete-then-insert. The old order left the
 * dataset empty between the two statements, so a failed insert (or a function
 * timeout landing in the gap) blanked the app until the next successful cron
 * run. Here the fresh rows go in first, stamped with this run's `synced_at`,
 * and only rows left over from an earlier run are deleted afterwards, so a
 * partial failure degrades to stale data instead of no data.
 */
export async function writeDataset(dataset: string, rows: CacheRow[]): Promise<number> {
  const supabase = getServiceClient();
  if (!supabase) throw new Error("Supabase service client not configured");

  // An empty pull is almost always an upstream hiccup (revoked integration
  // access, a renamed filter property) rather than a genuine deletion of every
  // row. Refuse to turn that into an empty app; keep serving what we have.
  if (rows.length === 0) {
    const existing = await countDataset(supabase, dataset);
    if (existing > 0) {
      throw new Error(
        `refusing to clear ${existing} cached rows for "${dataset}": source returned 0 rows`
      );
    }
    return 0;
  }

  const now = new Date().toISOString();
  const records = rows.map((r) => ({
    id: `${dataset}:${r.notionId}`,
    dataset,
    notion_id: r.notionId,
    title: r.title,
    sort_key: r.sortKey,
    data: r.data ?? null,
    private_data: r.privateData ?? null,
    synced_at: now,
  }));

  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);
    const up = await supabase.from(CACHE_TABLE).upsert(batch, { onConflict: "id" });
    if (up.error) throw new Error(`cache upsert failed: ${up.error.message}`);
  }

  // Anything still carrying an older stamp is gone from Notion.
  const del = await supabase
    .from(CACHE_TABLE)
    .delete()
    .eq("dataset", dataset)
    .lt("synced_at", now);
  if (del.error) throw new Error(`cache prune failed: ${del.error.message}`);

  return records.length;
}

// ---------------------------------------------------------------------------
// Sync run log
// ---------------------------------------------------------------------------

export interface SyncRunRecord {
  dataset: string;
  ok: boolean;
  rowCount: number;
  ms: number;
  error?: string | null;
}

/**
 * Record the outcome of each dataset in a sync run.
 *
 * Without this a broken cron is invisible: the cache still answers, just with
 * data that quietly stops moving. Logging failures separately from row writes
 * means a red run is visible even though the cache kept its previous contents.
 * Best-effort by design; a logging failure must never fail the sync itself.
 */
export async function recordSyncRuns(runs: SyncRunRecord[]): Promise<void> {
  const supabase = getServiceClient();
  if (!supabase || runs.length === 0) return;

  const startedAt = new Date().toISOString();
  const rows = runs.map((r) => ({
    dataset: r.dataset,
    ok: r.ok,
    row_count: r.rowCount,
    duration_ms: r.ms,
    error: r.error ?? null,
    ran_at: startedAt,
  }));

  const { error } = await supabase.from(RUNS_TABLE).insert(rows);
  if (error) {
    console.error(`[notion-sync] could not record run log: ${error.message}`);
  }
}

export interface LastRun {
  dataset: string;
  ok: boolean;
  rowCount: number;
  error: string | null;
  ranAt: string;
}

/** Most recent run per dataset, newest first. Empty when unavailable. */
export async function readRecentRuns(limit = 50): Promise<LastRun[]> {
  const supabase = getServiceClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from(RUNS_TABLE)
    .select("dataset, ok, row_count, error, ran_at")
    .order("ran_at", { ascending: false })
    .limit(limit);

  if (error) return [];
  return ((data ?? []) as any[]).map((r) => ({
    dataset: r.dataset,
    ok: r.ok,
    rowCount: r.row_count,
    error: r.error,
    ranAt: r.ran_at,
  }));
}

export interface ReadResult {
  items: any[];
  syncedAt: string | null;
}

/** Read a dataset's items, newest first. Merges privateData when authed. */
export async function readDataset(
  dataset: string,
  opts: { includePrivate?: boolean; descending?: boolean } = {}
): Promise<ReadResult> {
  const { includePrivate = false, descending = true } = opts;
  const supabase = getServiceClient();
  if (!supabase) return { items: [], syncedAt: null };

  const { data, error } = await supabase
    .from(CACHE_TABLE)
    .select("data, private_data, sort_key, synced_at")
    .eq("dataset", dataset)
    .order("sort_key", { ascending: !descending, nullsFirst: false });

  if (error) throw new Error(`cache read failed: ${error.message}`);
  const rows = (data ?? []) as Array<{
    data: any;
    private_data: any;
    synced_at: string;
  }>;

  const items = rows.map((row) =>
    includePrivate && row.private_data
      ? { ...row.data, _private: row.private_data }
      : row.data
  );
  // Rows are ordered by sort_key, not freshness, so scan for the newest stamp
  // rather than trusting the first row.
  const syncedAt = rows.reduce<string | null>(
    (max, row) => (!max || row.synced_at > max ? row.synced_at : max),
    null
  );
  return { items, syncedAt };
}
