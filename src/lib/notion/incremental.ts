// ============================================================================
// NOTION SYNC: INCREMENTAL RUNS
// ============================================================================
// The daily cron used to walk every database in full. Most days almost nothing
// has changed, so a run now asks Notion only for the rows edited since the
// last successful run of that dataset (a last_edited_time filter) and upserts
// those. A full rebuild still runs once a week, because a filtered query can
// never see a page that was deleted or archived in Notion: only a full pass
// can prune it from the cache.
//
// These helpers are pure so the rules can be tested without Notion.
// ============================================================================

export type SyncMode = "full" | "incremental";
export type RequestedMode = SyncMode | "auto";

/** What the last successful runs of one dataset looked like. */
export interface DatasetSyncState {
  /** Start time (ISO) of the last successful run, full or incremental. */
  lastRunAt: string | null;
  /** Start time (ISO) of the last successful full rebuild. */
  lastFullAt: string | null;
}

const MINUTE_MS = 60 * 1000;
const DAY_MS = 24 * 60 * MINUTE_MS;

/**
 * A full rebuild is due once the last one is this old. Half a day short of a
 * week, so a cron that fires a little early on day seven still rebuilds.
 */
export const FULL_REBUILD_INTERVAL_MS = 6.5 * DAY_MS;

/**
 * How far before the last run the incremental window opens. Notion rounds
 * last_edited_time down to the minute, so the window is floored to the minute
 * first; the extra minutes cover clock skew and slow indexing. Rows inside the
 * overlap are simply upserted again.
 */
export const SINCE_OVERLAP_MS = 5 * MINUTE_MS;

function parseTime(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const ms = Date.parse(iso);
  return Number.isNaN(ms) ? null : ms;
}

/** Notion database query filter: pages edited at or after `since`. */
export function lastEditedSinceFilter(since: string) {
  return {
    timestamp: "last_edited_time",
    last_edited_time: { on_or_after: since },
  } as const;
}

/** Start of the incremental window for a dataset last synced at `lastRunAt`. */
export function incrementalSince(lastRunAt: string): string {
  const ms = parseTime(lastRunAt);
  if (ms === null) throw new Error(`not a timestamp: ${lastRunAt}`);
  const flooredToMinute = Math.floor(ms / MINUTE_MS) * MINUTE_MS;
  return new Date(flooredToMinute - SINCE_OVERLAP_MS).toISOString();
}

/**
 * Decide how one dataset syncs on this run.
 *
 * Full when it is asked for, when there is nothing to be incremental against
 * (no recorded run, or a state row that does not parse), and in "auto" when
 * the last full rebuild is a week old. Otherwise incremental.
 */
export function chooseMode(args: {
  requested: RequestedMode;
  state: DatasetSyncState | null | undefined;
  now: Date;
}): SyncMode {
  const { requested, state, now } = args;
  if (requested === "full") return "full";

  const lastRun = parseTime(state?.lastRunAt);
  const lastFull = parseTime(state?.lastFullAt);
  if (lastRun === null || lastFull === null) return "full";
  // A clock that went backwards makes the stored times untrustworthy.
  if (lastRun > now.getTime() || lastFull > now.getTime()) return "full";

  if (requested === "incremental") return "incremental";
  return now.getTime() - lastFull >= FULL_REBUILD_INTERVAL_MS ? "full" : "incremental";
}

/** Read `?mode=` from the sync route. Anything unknown means "auto". */
export function parseRequestedMode(value: string | null | undefined): RequestedMode {
  return value === "full" || value === "incremental" ? value : "auto";
}
