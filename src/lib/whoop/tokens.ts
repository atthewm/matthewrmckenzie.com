// ============================================================================
// TOKEN STORAGE
// ============================================================================
// Stores and retrieves WHOOP OAuth tokens in Vercel KV with AES-256-GCM
// encryption at rest. Handles token refresh automatically when needed.
// ============================================================================

import { encrypt, decrypt } from "./crypto";
import { kvGet, kvSet, kvDel } from "./kv";
import {
  WHOOP_TOKEN_URL,
  TOKEN_REFRESH_BUFFER_SECONDS,
  getEnvVar,
} from "./config";

// KV keys
const KEY_ACCESS_TOKEN = "whoop:access_token";
const KEY_REFRESH_TOKEN = "whoop:refresh_token";
const KEY_TOKEN_EXPIRY = "whoop:token_expiry";
const KEY_CONNECTED = "whoop:connected";

export interface TokenSet {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // Unix timestamp in seconds
}

/**
 * Store tokens after initial OAuth exchange or refresh.
 * Tokens are encrypted before writing to KV.
 */
export async function storeTokens(tokens: TokenSet): Promise<void> {
  await Promise.all([
    kvSet(KEY_ACCESS_TOKEN, encrypt(tokens.accessToken)),
    kvSet(KEY_REFRESH_TOKEN, encrypt(tokens.refreshToken)),
    kvSet(KEY_TOKEN_EXPIRY, String(tokens.expiresAt)),
    kvSet(KEY_CONNECTED, "true"),
  ]);
}

/**
 * Retrieve tokens from KV and decrypt them.
 * Returns null if not connected.
 */
export async function getTokens(): Promise<TokenSet | null> {
  const [encAccess, encRefresh, expiryStr, connected] = await Promise.all([
    kvGet(KEY_ACCESS_TOKEN),
    kvGet(KEY_REFRESH_TOKEN),
    kvGet(KEY_TOKEN_EXPIRY),
    kvGet(KEY_CONNECTED),
  ]);

  if (!connected || connected !== "true" || !encAccess || !encRefresh || !expiryStr) {
    return null;
  }

  return {
    accessToken: decrypt(encAccess),
    refreshToken: decrypt(encRefresh),
    expiresAt: parseInt(expiryStr, 10),
  };
}

/**
 * Check if WHOOP is connected (tokens exist).
 */
export async function isConnected(): Promise<boolean> {
  const val = await kvGet(KEY_CONNECTED);
  return val === "true";
}

/**
 * Delete all tokens and cached data. Called on disconnect.
 */
export async function clearTokens(): Promise<void> {
  await kvDel(
    KEY_ACCESS_TOKEN,
    KEY_REFRESH_TOKEN,
    KEY_TOKEN_EXPIRY,
    KEY_CONNECTED,
  );
}

/**
 * Get a valid access token, refreshing if needed.
 * Returns null if not connected or refresh fails.
 */
export async function getValidAccessToken(): Promise<string | null> {
  const tokens = await getTokens();
  if (!tokens) return null;

  const now = Math.floor(Date.now() / 1000);
  const needsRefresh = tokens.expiresAt - now < TOKEN_REFRESH_BUFFER_SECONDS;

  if (!needsRefresh) {
    return tokens.accessToken;
  }

  // Refresh the token
  try {
    const clientId = getEnvVar("WHOOP_CLIENT_ID");
    const clientSecret = getEnvVar("WHOOP_CLIENT_SECRET");

    const res = await fetch(WHOOP_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: tokens.refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    if (!res.ok) {
      // Refresh failed; token might be revoked
      await clearTokens();
      return null;
    }

    const data = await res.json();
    const newTokens: TokenSet = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || tokens.refreshToken,
      expiresAt: now + (data.expires_in || 3600),
    };

    await storeTokens(newTokens);
    return newTokens.accessToken;
  } catch {
    return null;
  }
}
