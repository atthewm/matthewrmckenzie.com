// ============================================================================
// GET /api/whoop/status
// ============================================================================
// Lightweight check: is WHOOP currently connected? Returns { connected: bool }.
// Does NOT trigger a data fetch or token refresh.
// ============================================================================

import { NextResponse } from "next/server";
import { isConnected } from "@/lib/whoop/tokens";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const connected = await isConnected();
    return NextResponse.json({ connected });
  } catch {
    return NextResponse.json({ connected: false });
  }
}
