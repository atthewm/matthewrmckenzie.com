// ============================================================================
// POST /api/whoop/auth/disconnect
// ============================================================================
// Clears all stored WHOOP tokens and cached data. After this, the dashboard
// falls back to the static screenshot collage.
// ============================================================================

import { NextResponse } from "next/server";
import { clearTokens } from "@/lib/whoop/tokens";
import { clearDashboardCache } from "@/lib/whoop/client";
import { isOwnerRequest, NO_STORE } from "@/lib/owner";

export async function POST(request: Request) {
  if (!isOwnerRequest(request)) {
    return NextResponse.json({ error: "Not found" }, { status: 404, headers: NO_STORE });
  }
  try {
    await Promise.all([clearTokens(), clearDashboardCache()]);

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("WHOOP disconnect error:", message);
    return NextResponse.json(
      { error: "Failed to disconnect WHOOP" },
      { status: 500 },
    );
  }
}
