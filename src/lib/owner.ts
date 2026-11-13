// ============================================================================
// OWNER FLAG (server only)
// ============================================================================
// Account controls (WHOOP connect, refresh, disconnect) are for Matt only.
// Signing in at /gate with the admin account sets an httpOnly cookie whose
// value is an HMAC derived from a server secret. The value is never sent to
// the browser in a response body and is never readable from script. Guests
// and visitors never get it, and with no secret configured nobody is owner.
// ============================================================================

import { createHmac, timingSafeEqual } from "node:crypto";

export const OWNER_COOKIE = "mmck_owner";
export const OWNER_MAX_AGE = 60 * 60 * 24 * 30;

function ownerSecret(): string | null {
  const s = process.env.OWNER_COOKIE_SECRET || process.env.WHOOP_ENCRYPTION_KEY || "";
  return s.length >= 32 ? s : null;
}

/** The cookie value an owner carries, or null when no secret is configured. */
export function ownerCookieValue(): string | null {
  const secret = ownerSecret();
  if (!secret) return null;
  return createHmac("sha256", secret).update("mmck-owner-v1").digest("hex");
}

function readCookie(header: string, name: string): string | null {
  for (const part of header.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return v.join("=");
  }
  return null;
}

/** True only when the request carries a valid owner cookie. */
export function isOwnerRequest(req: Request): boolean {
  const expected = ownerCookieValue();
  if (!expected) return false;
  const got = readCookie(req.headers.get("cookie") || "", OWNER_COOKIE);
  if (!got || got.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(got), Buffer.from(expected));
}

export const NO_STORE = { "Cache-Control": "private, no-store" } as const;
