// ============================================================================
// POST/GET /api/notion/sync  — scheduled Notion -> Supabase sync
// ============================================================================
// Triggered by Vercel Cron (see vercel.json) or manually with the shared
// secret. Protected so the public cannot trigger expensive syncs.
//
//   Manual:  curl -X POST https://matthewrmckenzie.com/api/notion/sync \
//              -H "Authorization: Bearer $NOTION_SYNC_SECRET"
//   One DB:  .../api/notion/sync?only=films
// ============================================================================

import { NextResponse } from "next/server";
import { getCronSecret, isNotionConfigured } from "@/lib/notion/config";
import { getServiceClient, readRecentRuns } from "@/lib/notion/cache";
import { runSync } from "@/lib/notion/sync";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// A full run now walks the whole meal log (several thousand paginated rows) on
// top of the media databases, which does not reliably fit in 60s.
export const maxDuration = 300;

function authorized(req: Request): boolean {
  const auth = req.headers.get("authorization") || "";

  // Vercel Cron requests carry this header and originate from Vercel infra;
  // `x-vercel-*` headers are stripped from inbound public requests.
  if (req.headers.get("x-vercel-cron")) return true;

  // Vercel also signs cron invocations with CRON_SECRET when it is set.
  const vercelSecret = process.env.CRON_SECRET;
  if (vercelSecret && auth === `Bearer ${vercelSecret}`) return true;

  const secret = getCronSecret();
  if (!secret) return false; // no secret configured -> refuse manual triggers
  const fromQuery = new URL(req.url).searchParams.get("secret");
  return auth === `Bearer ${secret}` || fromQuery === secret;
}

async function handle(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!isNotionConfigured()) {
    return NextResponse.json(
      { error: "NOTION_TOKEN not configured" },
      { status: 503 }
    );
  }
  if (!getServiceClient()) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY not configured" },
      { status: 503 }
    );
  }

  const url = new URL(req.url);

  // `?status=1` reports what the cron has been doing without triggering a run,
  // so a stalled or partially failing schedule is diagnosable.
  if (url.searchParams.get("status")) {
    return NextResponse.json({ runs: await readRecentRuns() });
  }

  const only = url.searchParams.get("only") || undefined;
  const summary = await runSync(only);
  return NextResponse.json(summary, { status: summary.ok ? 200 : 207 });
}

export async function POST(req: Request) {
  return handle(req);
}

export async function GET(req: Request) {
  return handle(req);
}
