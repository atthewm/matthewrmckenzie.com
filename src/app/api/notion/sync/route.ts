// ============================================================================
// POST/GET /api/notion/sync : scheduled Notion -> Supabase sync
// ============================================================================
// Triggered by Vercel Cron (see vercel.json) or by hand. Every request, the
// status report included, must carry `Authorization: Bearer <CRON_SECRET>`,
// which is what Vercel sends on each cron run when CRON_SECRET is set on the
// project. It is compared in constant time. Nothing else is accepted: not an
// x-vercel-cron header (anyone can send one), and not a secret in the query
// string (query strings end up in logs). With CRON_SECRET unset or shorter
// than 16 characters every request is refused.
//
//   Manual:  curl -X POST https://matthewrmckenzie.com/api/notion/sync \
//              -H "Authorization: Bearer $CRON_SECRET"
//   One DB:  .../api/notion/sync?only=films
//   Rebuild: .../api/notion/sync?mode=full
//   Status:  .../api/notion/sync?status=1
//
// The scheduled run is incremental: each dataset asks Notion only for rows
// edited since its last successful run. Once a week (and on the first run)
// a dataset is rebuilt in full instead, which is also what prunes rows that
// were deleted in Notion. `?mode=full` forces that rebuild by hand.
// ============================================================================

import { NextResponse } from "next/server";
import { safeEqual } from "@/lib/cookies";
import { isNotionConfigured } from "@/lib/notion/config";
import {
  getServiceClient,
  readRecentRuns,
  readSyncState,
  recordSyncRuns,
  CONFIG_DATASET,
} from "@/lib/notion/cache";
import { DATASET_LIST } from "@/lib/notion/datasets";
import { parseRequestedMode } from "@/lib/notion/incremental";
import { runSync } from "@/lib/notion/sync";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// The weekly full rebuild walks the whole meal log (several thousand paginated
// rows) on top of the media databases, which does not reliably fit in 60s.
// Incremental runs finish in seconds.
export const maxDuration = 300;

const MIN_CRON_SECRET_LENGTH = 16;
const NO_STORE = { "Cache-Control": "private, no-store" } as const;

/** Vercel's documented cron guard, in constant time, and nothing else. */
function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET ?? "";
  if (secret.length < MIN_CRON_SECRET_LENGTH) return false;
  return safeEqual(req.headers.get("authorization") ?? "", `Bearer ${secret}`);
}

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: NO_STORE });
}

/**
 * Config failures are recorded like any other run outcome so the status
 * endpoint explains itself. The dataset column carries a sentinel rather than
 * a real dataset name, since nothing was synced.
 *
 * Best effort by design: when Supabase itself is the missing piece there is
 * nowhere to write, and `recordSyncRuns` no-ops. That one case is only visible
 * in the Vercel logs and in this route's response body.
 */
async function recordConfigFailure(error: string) {
  await recordSyncRuns([
    { dataset: CONFIG_DATASET, ok: false, rowCount: 0, ms: 0, error },
  ]);
}

async function handle(req: Request) {
  if (!authorized(req)) {
    return json({ error: "unauthorized" }, 401);
  }

  const url = new URL(req.url);

  // `?status=1` reports what the cron has been doing without triggering a run.
  // It is answered before the config guards below on purpose: a misconfigured
  // deployment is exactly when someone reaches for this, and gating it behind
  // the checks it is meant to explain would make it useless. It still sits
  // behind the same secret as everything else.
  if (url.searchParams.get("status")) {
    const [runs, state] = await Promise.all([
      readRecentRuns(),
      readSyncState(DATASET_LIST.map((d) => d.key)),
    ]);
    return json({ runs, state });
  }

  if (!isNotionConfigured()) {
    const error = "NOTION_TOKEN not configured";
    await recordConfigFailure(error);
    return json({ error }, 503);
  }
  if (!getServiceClient()) {
    // Nothing to record against: the run log lives in the database this key
    // would have opened.
    return json({ error: "SUPABASE_SERVICE_ROLE_KEY not configured" }, 503);
  }

  const only = url.searchParams.get("only") || undefined;
  const mode = parseRequestedMode(url.searchParams.get("mode"));
  const summary = await runSync(only, { mode });
  return json(summary, summary.ok ? 200 : 207);
}

export async function POST(req: Request) {
  return handle(req);
}

export async function GET(req: Request) {
  return handle(req);
}
