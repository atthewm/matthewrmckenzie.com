// ============================================================================
// GET /api/whoop/data
// ============================================================================
// Returns aggregated WHOOP dashboard data. Serves cached data when fresh,
// otherwise fetches from the WHOOP API. Returns { connected: false } when
// no valid tokens exist.
// ============================================================================

import { NextResponse } from "next/server";
import { fetchDashboardData } from "@/lib/whoop/client";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await fetchDashboardData();
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("WHOOP data fetch error:", message);
    return NextResponse.json(
      { connected: false, error: message },
      { status: 500 },
    );
  }
}
