import "server-only";

// ============================================================================
// OWNER FLAG (server only)
// ============================================================================
// Account controls (WHOOP connect, refresh, disconnect), the full WHOOP feed,
// the Nutrition dataset and the Life and Nutrition apps are for Matt only.
// Signing in at /gate with the admin account sets an httpOnly cookie whose
// value is an HMAC of OWNER_COOKIE_SECRET. The secret itself never reaches a
// browser, and the value is never readable from script. Guests and visitors
// never get it.
//
// OWNER_COOKIE_SECRET is required: 32 characters or more, its own random
// value. There is no fallback to another key. Unset or shorter means nobody
// is owner.
// ============================================================================

import { createHmac } from "node:crypto";
import { readCookie, safeEqual } from "./cookies";

export const OWNER_COOKIE = "mmck_owner";
export const OWNER_MAX_AGE = 60 * 60 * 24 * 30;

export const MIN_OWNER_SECRET_LENGTH = 32;

/** Purpose label. The version voids every owner cookie made before it. */
const OWNER_SESSION_LABEL = "owner-session-v2";

function ownerSecret(): string | null {
  const secret = process.env.OWNER_COOKIE_SECRET ?? "";
  return secret.length >= MIN_OWNER_SECRET_LENGTH ? secret : null;
}

/** The cookie value an owner carries, or null when no secret is configured. */
export function ownerCookieValue(): string | null {
  const secret = ownerSecret();
  if (!secret) return null;
  return createHmac("sha256", secret).update(OWNER_SESSION_LABEL).digest("hex");
}

/** True only when the request carries a valid owner cookie. */
export function isOwnerRequest(req: Request): boolean {
  const expected = ownerCookieValue();
  if (!expected) return false;
  const got = readCookie(req.headers.get("cookie"), OWNER_COOKIE);
  return got !== null && safeEqual(got, expected);
}

export const NO_STORE = { "Cache-Control": "private, no-store" } as const;
