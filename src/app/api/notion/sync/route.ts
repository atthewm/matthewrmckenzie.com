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
import { getServiceClient } from "@/lib/notion/cache";
import { runSync } from "@/lib/notion/sync";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authorized(req: Request): boolean {
  // Vercel Cron requests carry this header and originate from Vercel infra.
  if (req.headers.get("x-vercel-cron")) return true;
  const secret = getCronSecret();
  if (!secret) return false; // no secret configured -> refuse manual triggers
  const auth = req.headers.get("authorization") || "";
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

  const only = new URL(req.url).searchParams.get("only") || undefined;
  const summary = await runSync(only);
  return NextResponse.json(summary, { status: summary.ok ? 200 : 207 });
}

export async function POST(req: Request) {
  return handle(req);
}

export async function GET(req: Request) {
  return handle(req);
}
