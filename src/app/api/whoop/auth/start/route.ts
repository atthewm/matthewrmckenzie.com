// ============================================================================
// GET /api/whoop/auth/start
// ============================================================================
// Redirects the user to the WHOOP OAuth authorization page.
// Generates a random state parameter for CSRF protection.
// ============================================================================

import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { WHOOP_AUTH_URL, WHOOP_SCOPES, getEnvVar } from "@/lib/whoop/config";
import { kvSet } from "@/lib/whoop/kv";
import { isOwnerRequest, NO_STORE } from "@/lib/owner";

export async function GET(request: Request) {
  if (!isOwnerRequest(request)) {
    return NextResponse.json({ error: "Not found" }, { status: 404, headers: NO_STORE });
  }
  try {
    const clientId = getEnvVar("WHOOP_CLIENT_ID");
    const redirectUri = getEnvVar("WHOOP_REDIRECT_URI");

    // Generate CSRF state (at least 8 chars per WHOOP docs)
    const state = randomBytes(32).toString("hex");

    // Store state in KV with 10-minute TTL for verification in callback
    await kvSet("whoop:oauth_state", state, 600);

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: WHOOP_SCOPES.join(" "),
      state,
    });

    const authUrl = `${WHOOP_AUTH_URL}?${params.toString()}`;
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error("WHOOP auth start error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Failed to start WHOOP authentication" },
      { status: 500 },
    );
  }
}
