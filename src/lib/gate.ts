// ============================================================================
// GATE: admin and guest cookies (server only)
// ============================================================================
// Signing in at /gate sets one of two httpOnly cookies:
//   admin  mckenzie_auth   value from SITE_LOCK_COOKIE_VALUE. Unlocks guestbook
//                          moderation and the private Notion fields.
//   guest  mckenzie_guest  its own value, derived from the guest password
//                          alone. It says nothing about the admin secret, so
//                          a guest cannot use it to work that secret out, and
//                          it unlocks nothing an anonymous visitor cannot see.
//
// Everything here fails closed. There is no built-in cookie value: when
// SITE_LOCK_COOKIE_VALUE is missing, or too short to be a real secret, nobody
// is an admin and admin sign-in is refused; with no guest password there is no
// guest. This repository is public, so a default in the code would be a
// password anyone could read.
// ============================================================================

import { createHmac } from "node:crypto";
import { readCookie, safeEqual } from "./cookies";

export const ADMIN_COOKIE = "mckenzie_auth";
export const GUEST_COOKIE = "mckenzie_guest";
/**
 * Readable by page scripts, unlike the two above, and worth nothing on its
 * own: it only tells the browser that asking /api/auth who it is might be
 * worth a request. Every protected route checks the httpOnly cookies itself.
 */
export const SESSION_HINT_COOKIE = "mmck_session";
export const GATE_MAX_AGE = 60 * 60 * 24 * 30;

/** Shorter values are treated as unset: too easy to guess to guard anything. */
const MIN_COOKIE_VALUE_LENGTH = 16;

/** The value an admin cookie must carry, or null when none is configured. */
export function adminCookieValue(): string | null {
  const value = process.env.SITE_LOCK_COOKIE_VALUE ?? "";
  return value.length >= MIN_COOKIE_VALUE_LENGTH ? value : null;
}

/**
 * The value a guest cookie must carry, or null when there is no guest account.
 * Keyed by the guest password, which the guest already knows: changing that
 * password signs every guest out, and the admin secret is never an input.
 */
export function guestCookieValue(): string | null {
  const password = process.env.SITE_LOCK_GUEST_PASSWORD ?? "";
  if (!password) return null;
  return createHmac("sha256", password).update("mmck-guest-v1").digest("hex");
}

function carries(req: Request, cookie: string, expected: string | null): boolean {
  if (!expected) return false;
  const got = readCookie(req.headers.get("cookie"), cookie);
  return got !== null && safeEqual(got, expected);
}

/** True only when the request carries the configured admin cookie value. */
export function isAdminRequest(req: Request): boolean {
  return carries(req, ADMIN_COOKIE, adminCookieValue());
}

/** True only when the request carries the guest cookie value. */
export function isGuestRequest(req: Request): boolean {
  return carries(req, GUEST_COOKIE, guestCookieValue());
}
