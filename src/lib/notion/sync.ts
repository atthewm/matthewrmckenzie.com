// ============================================================================
// NOTION SYNC — ORCHESTRATION
// ============================================================================
// Pulls every (or one) dataset from Notion, normalizes rows, and writes them to
// the Supabase cache. Called by the scheduled /api/notion/sync route.
// ============================================================================

import { queryDatabase } from "./client";
import { NOTION_DB } from "./config";
import { DATASET_LIST, getDataset, type CacheRow, type SyncContext } from "./datasets";
import { writeDataset } from "./cache";
import type { NotionPage } from "./properties";

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

async function buildPeopleMap(): Promise<Record<string, string>> {
  const map: Record<string, string> = {};
  try {
    const people = await queryDatabase(NOTION_DB.people, { max: 5000 });
    for (const p of people) map[p.id] = primaryTitle(p);
  } catch {
    // People DB optional — relations just won't resolve to names.
  }
  return map;
}

export interface DatasetResult {
  key: string;
  count: number;
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
  const ctx: SyncContext = { peopleById: await buildPeopleMap() };
  const results: DatasetResult[] = [];

  for (const def of defs) {
    if (!def) continue;
    try {
      const pages = await queryDatabase(def.databaseId);
      const filtered = def.rowFilter ? pages.filter(def.rowFilter) : pages;
      const rows: CacheRow[] = [];
      for (const page of filtered) {
        const row = def.transform(page, ctx);
        if (row) rows.push(row);
      }
      const count = await writeDataset(def.key, rows);
      results.push({ key: def.key, count });
    } catch (err: any) {
      results.push({ key: def.key, count: 0, error: String(err?.message ?? err) });
    }
  }

  return {
    ok: results.every((r) => !r.error),
    ms: Date.now() - start,
    results,
  };
}
