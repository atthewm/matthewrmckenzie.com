// ============================================================================
// GET /api/whoop/data
// ============================================================================
// WHOOP dashboard data, served from the hourly cache when fresh.
//
//   /api/whoop/data              the public view: headline scores only (see
//                                src/lib/whoop/public.ts). Ignores cookies, so
//                                the CDN can hold it for every visitor.
//   /api/whoop/data?view=day-strain  the business card's current score only.
//   /api/whoop/data?scope=owner  the full payload, for the owner cookie only.
//                                Never cached.
//
// Separate URLs rather than one that varies by cookie: a shared cache can then
// never hand the owner's data to a visitor, whatever it keys on.
// ============================================================================

import { NextResponse } from "next/server";
import { fetchDashboardData } from "@/lib/whoop/client";
import { currentDayStrain, toPublicWhoop } from "@/lib/whoop/public";
import { isOwnerRequest, NO_STORE } from "@/lib/owner";

export const dynamic = "force-dynamic";

const PUBLIC_CACHE = { "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600" } as const;

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const ownerScope = params.get("scope") === "owner";
  if (ownerScope && !await isOwnerRequest(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403, headers: NO_STORE });
  }

  try {
    const data = await fetchDashboardData();
    if (params.get("view") === "day-strain") {
      return NextResponse.json({ dayStrain: currentDayStrain(data) }, { headers: NO_STORE });
    }
    return ownerScope
      ? NextResponse.json(data, { headers: NO_STORE })
      : NextResponse.json(toPublicWhoop(data), { headers: PUBLIC_CACHE });
  } catch (error) {
    if (params.get("view") === "day-strain") {
      return NextResponse.json({ dayStrain: null }, { status: 503, headers: NO_STORE });
    }
    // The detail stays in the server log: it can name configuration.
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("WHOOP data fetch error:", message);
    return NextResponse.json(
      { connected: false, error: "WHOOP data is unavailable" },
      { status: 500, headers: NO_STORE },
    );
  }
}
