// ============================================================================
// GET /api/whoop/status
// ============================================================================
// Lightweight check: is WHOOP currently connected, and is this request from
// the owner? Returns { connected: bool, owner: bool }. owner is false for
// every visitor; only the owner cookie set at the admin sign-in makes it true.
// Does NOT trigger a data fetch or token refresh.
// ============================================================================

import { NextResponse } from "next/server";
import { isConnected } from "@/lib/whoop/tokens";
import { isOwnerRequest, NO_STORE } from "@/lib/owner";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const owner = isOwnerRequest(request);
  try {
    const connected = await isConnected();
    return NextResponse.json({ connected, owner }, { headers: NO_STORE });
  } catch {
    return NextResponse.json({ connected: false, owner }, { headers: NO_STORE });
  }
}
