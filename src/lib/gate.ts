import "server-only";

// ============================================================================
// GATE: admin and guest cookies (server only)
// ============================================================================
// Signing in at /gate sets one of two httpOnly cookies:
//   admin  mckenzie_auth   unlocks guestbook moderation and the private Notion
//                          fields.
//   guest  mckenzie_guest  unlocks nothing an anonymous visitor cannot see.
//
// Neither cookie carries SITE_LOCK_COOKIE_VALUE itself. Each carries an HMAC of
// it under its own purpose label, so the secret never reaches a browser and a
// guest cookie is worth nothing as an admin cookie. The labels carry a
// version: every cookie issued before v2 (the old ones held the raw secret)
// is refused. Changing SITE_LOCK_COOKIE_VALUE signs everyone out.
//
// Everything here fails closed. There is no built-in value: when
// SITE_LOCK_COOKIE_VALUE is missing, or too short to be a real secret, nobody
// is an admin or a guest and sign-in is refused. With no guest password there
// is no guest. This repository is public, so a default in the code would be
// a password anyone could read.
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
export const MIN_SESSION_SECRET_LENGTH = 16;
/** A shorter SITE_LOCK_ADMIN_PASSWORD turns admin sign-in off (see /api/auth). */
export const MIN_ADMIN_PASSWORD_LENGTH = 16;

/** Purpose labels. A new label or version voids every cookie made under the old one. */
const ADMIN_SESSION_LABEL = "admin-session-v2";
const GUEST_SESSION_LABEL = "guest-session-v2";

function sessionSecret(): string | null {
  const value = process.env.SITE_LOCK_COOKIE_VALUE ?? "";
  return value.length >= MIN_SESSION_SECRET_LENGTH ? value : null;
}

function sessionValue(label: string): string | null {
  const secret = sessionSecret();
  return secret ? createHmac("sha256", secret).update(label).digest("hex") : null;
}

/** The value an admin cookie must carry, or null when none is configured. */
export function adminCookieValue(): string | null {
  return sessionValue(ADMIN_SESSION_LABEL);
}

/** The value a guest cookie must carry, or null when there is no guest account. */
export function guestCookieValue(): string | null {
  if (!process.env.SITE_LOCK_GUEST_PASSWORD) return null;
  return sessionValue(GUEST_SESSION_LABEL);
}

function carries(req: Request, cookie: string, expected: string | null): boolean {
  if (!expected) return false;
  const got = readCookie(req.headers.get("cookie"), cookie);
  return got !== null && safeEqual(got, expected);
}

/** True only when the request carries the current admin cookie value. */
export function isAdminRequest(req: Request): boolean {
  return carries(req, ADMIN_COOKIE, adminCookieValue());
}

/** True only when the request carries the current guest cookie value. */
export function isGuestRequest(req: Request): boolean {
  return carries(req, GUEST_COOKIE, guestCookieValue());
}
