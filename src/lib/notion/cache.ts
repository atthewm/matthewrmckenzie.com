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

let cached: SupabaseClient | null | undefined;

/** Service-role client for reads + writes. Null when not configured. */
export function getServiceClient(): SupabaseClient | null {
  if (cached !== undefined) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  cached = url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;
  return cached;
}

/** Replace all cached rows for a dataset. Returns the number of rows written. */
export async function writeDataset(dataset: string, rows: CacheRow[]): Promise<number> {
  const supabase = getServiceClient();
  if (!supabase) throw new Error("Supabase service client not configured");

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

  // Replace strategy: clear the dataset, then insert the fresh set. Keeps the
  // cache consistent with Notion (handles deletions) for these modest sizes.
  const del = await supabase.from(CACHE_TABLE).delete().eq("dataset", dataset);
  if (del.error) throw new Error(`cache delete failed: ${del.error.message}`);

  if (records.length === 0) return 0;
  const ins = await supabase.from(CACHE_TABLE).insert(records);
  if (ins.error) throw new Error(`cache insert failed: ${ins.error.message}`);
  return records.length;
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
  const syncedAt = rows.length ? rows[0].synced_at : null;
  return { items, syncedAt };
}
