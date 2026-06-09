// ============================================================================
// GET /api/notion/data?dataset=<key>  — read synced data for the UI
// ============================================================================
// Public datasets (films, tv, audiobooks, favorite-foods) are served to anyone,
// with sensitive fields stripped (those live in `private_data`). Private
// datasets (nutrition) require the admin gate cookie and 401 otherwise.
//
// `_private` fields are merged in only for an authenticated admin.
// ============================================================================

import { NextResponse } from "next/server";
import { getDataset } from "@/lib/notion/datasets";
import { readDataset } from "@/lib/notion/cache";
import type { DatasetResponse } from "@/data/notion/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const AUTH_COOKIE = "mckenzie_auth";
const AUTH_VALUE = process.env.SITE_LOCK_COOKIE_VALUE ?? "mck_gate_2026";

function isAuthed(req: Request): boolean {
  const cookie = req.headers.get("cookie") || "";
  return cookie
    .split(";")
    .map((c) => c.trim())
    .some((c) => c === `${AUTH_COOKIE}=${AUTH_VALUE}`);
}

export async function GET(req: Request) {
  const key = new URL(req.url).searchParams.get("dataset") || "";
  const def = getDataset(key);
  if (!def) {
    return NextResponse.json({ error: `unknown dataset: ${key}` }, { status: 404 });
  }

  const authed = isAuthed(req);
  if (def.visibility === "private" && !authed) {
    return NextResponse.json(
      { error: "private dataset — admin only", key, authed: false },
      { status: 401 }
    );
  }

  const { items, syncedAt } = await readDataset(def.key, {
    includePrivate: authed,
    descending: def.sortDescending !== false,
  });

  const body: DatasetResponse = {
    key: def.key,
    visibility: def.visibility,
    authed,
    syncedAt,
    count: items.length,
    items,
  };

  const headers: Record<string, string> =
    def.visibility === "public" && !authed
      ? { "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600" }
      : { "Cache-Control": "private, no-store" };

  return NextResponse.json(body, { headers });
}
