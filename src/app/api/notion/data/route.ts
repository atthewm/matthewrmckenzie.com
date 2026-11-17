// ============================================================================
// GET /api/notion/data?dataset=<key> : read synced data for the UI
// ============================================================================
// Public datasets (films, tv, audiobooks, favorite-foods, top-foods) are served
// to anyone, with sensitive fields stripped (those live in `private_data`),
// and the CDN may cache that public view. `_private` fields are merged in only
// for an authenticated admin, and that response is never cached.
//
// Private datasets (nutrition) are for the owner cookie only (src/lib/owner.ts):
// a 401 for everyone else, and never cached for anyone.
// ============================================================================

import { NextResponse } from "next/server";
import { getDataset } from "@/lib/notion/datasets";
import { readDataset } from "@/lib/notion/cache";
import type { DatasetResponse } from "@/data/notion/types";
import { isAdminRequest } from "@/lib/gate";
import { NO_STORE, isOwnerRequest } from "@/lib/owner";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PUBLIC_CACHE = { "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600" } as const;

export async function GET(req: Request) {
  const key = new URL(req.url).searchParams.get("dataset") || "";
  const def = getDataset(key);
  if (!def) {
    return NextResponse.json({ error: `unknown dataset: ${key}` }, { status: 404, headers: NO_STORE });
  }

  // Fails closed: with no owner secret configured, nobody is the owner.
  const isPrivate = def.visibility === "private";
  if (isPrivate && !isOwnerRequest(req)) {
    return NextResponse.json(
      { error: "private dataset", key, authed: false },
      { status: 401, headers: NO_STORE }
    );
  }

  // Fails closed too: with no admin cookie value configured, nobody is admin.
  const authed = isPrivate || isAdminRequest(req);

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

  return NextResponse.json(body, { headers: authed ? NO_STORE : PUBLIC_CACHE });
}
