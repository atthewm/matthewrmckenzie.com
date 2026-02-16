// ============================================================================
// GET /api/whoop/auth/callback
// ============================================================================
// Handles the OAuth callback from WHOOP. Validates the state parameter,
// exchanges the authorization code for tokens, encrypts and stores them.
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { WHOOP_TOKEN_URL, getEnvVar } from "@/lib/whoop/config";
import { storeTokens, type TokenSet } from "@/lib/whoop/tokens";
import { kvGet, kvDel } from "@/lib/whoop/kv";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    // Check for OAuth errors
    if (error) {
      const desc = searchParams.get("error_description") || "Authorization denied";
      return redirectWithMessage(`WHOOP authorization failed: ${desc}`, "error");
    }

    // Validate required params
    if (!code || !state) {
      return redirectWithMessage("Missing authorization code or state parameter", "error");
    }

    // Verify CSRF state
    const storedState = await kvGet("whoop:oauth_state");
    if (!storedState || storedState !== state) {
      return redirectWithMessage("Invalid state parameter. Please try connecting again.", "error");
    }

    // Clean up used state
    await kvDel("whoop:oauth_state");

    // Exchange code for tokens
    const clientId = getEnvVar("WHOOP_CLIENT_ID");
    const clientSecret = getEnvVar("WHOOP_CLIENT_SECRET");
    const redirectUri = getEnvVar("WHOOP_REDIRECT_URI");

    const tokenRes = await fetch(WHOOP_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    if (!tokenRes.ok) {
      const errorText = await tokenRes.text();
      console.error("WHOOP token exchange failed:", tokenRes.status, errorText);
      return redirectWithMessage("Failed to exchange authorization code for tokens", "error");
    }

    const tokenData = await tokenRes.json();

    const now = Math.floor(Date.now() / 1000);
    const tokens: TokenSet = {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt: now + (tokenData.expires_in || 3600),
    };

    if (!tokens.accessToken) {
      return redirectWithMessage("No access token received from WHOOP", "error");
    }

    // Encrypt and store
    await storeTokens(tokens);

    return redirectWithMessage("WHOOP connected successfully!", "success");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("WHOOP callback error:", message);
    return redirectWithMessage("An unexpected error occurred during authentication", "error");
  }
}

function redirectWithMessage(message: string, status: "success" | "error"): NextResponse {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "https://matthewrmckenzie.com";
  const url = new URL(base);
  url.searchParams.set("whoop_auth", status);
  url.searchParams.set("whoop_message", message);
  return NextResponse.redirect(url.toString());
}
