// ============================================================================
// COOKIE HELPERS (server only)
// ============================================================================
// Reading one cookie out of a request, and comparing secrets without leaking
// how much of them matched. Shared by the gate, admin and owner checks.
// ============================================================================

import { createHash, timingSafeEqual } from "node:crypto";

/**
 * The value of one cookie from a Cookie header, or null when it is absent.
 * Matches the whole cookie name, so "x_mckenzie_auth" never passes for
 * "mckenzie_auth", and decodes the value the way it was encoded when set.
 */
export function readCookie(header: string | null | undefined, name: string): string | null {
  for (const part of (header ?? "").split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key !== name) continue;
    const raw = rest.join("=");
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  }
  return null;
}

/**
 * Constant time string comparison. Both sides are hashed first so the
 * comparison takes the same time whatever their lengths.
 */
export function safeEqual(a: string, b: string): boolean {
  const left = createHash("sha256").update(a).digest();
  const right = createHash("sha256").update(b).digest();
  return timingSafeEqual(left, right);
}
