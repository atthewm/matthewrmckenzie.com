// ============================================================================
// /api/auth: sign in at /gate, and ask who the current browser is
// ============================================================================
// POST  { username, password }  checks the credentials and sets cookies:
//         admin  the admin cookie, the owner cookie (when an owner secret is
//                set) and a readable hint that a session exists
//         guest  the guest cookie only, never the admin one
// GET   reports which of those cookies the request carries and are valid.
//
// Credentials are always required. There is no "lock off" shortcut and no
// built-in cookie value: with the secrets unset, sign-in is refused.
// ============================================================================

import { NextResponse } from "next/server";
import { safeEqual } from "@/lib/cookies";
import {
  ADMIN_COOKIE,
  GATE_MAX_AGE,
  GUEST_COOKIE,
  SESSION_HINT_COOKIE,
  adminCookieValue,
  guestCookieValue,
  isAdminRequest,
  isGuestRequest,
} from "@/lib/gate";
import { NO_STORE, OWNER_COOKIE, OWNER_MAX_AGE, isOwnerRequest, ownerCookieValue } from "@/lib/owner";

export const dynamic = "force-dynamic";

/** Read at request time so nothing about the credentials is fixed at build. */
function credentials() {
  return {
    adminUser: process.env.SITE_LOCK_ADMIN_USER ?? "admin",
    adminPassword: process.env.SITE_LOCK_ADMIN_PASSWORD ?? "",
    guestUser: process.env.SITE_LOCK_GUEST_USER ?? "guest",
    guestPassword: process.env.SITE_LOCK_GUEST_PASSWORD ?? "",
  };
}

function cookieOptions(overrides: { httpOnly?: boolean; sameSite?: "lax" | "strict"; maxAge?: number } = {}) {
  return {
    httpOnly: overrides.httpOnly ?? true,
    secure: process.env.NODE_ENV === "production",
    sameSite: overrides.sameSite ?? ("lax" as const),
    maxAge: overrides.maxAge ?? GATE_MAX_AGE,
    path: "/",
  };
}

function refuse(status: number, error: string) {
  return NextResponse.json({ success: false, error }, { status, headers: NO_STORE });
}

function matches(username: string, password: string, expectedUser: string, expectedPassword: string): boolean {
  // An unset password disables the account. Both comparisons always run.
  const userOk = safeEqual(username, expectedUser);
  const passwordOk = safeEqual(password, expectedPassword);
  return expectedPassword.length > 0 && userOk && passwordOk;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return refuse(400, "Bad request");
  }
  const { username, password } = (body ?? {}) as { username?: unknown; password?: unknown };
  if (typeof username !== "string" || typeof password !== "string") {
    return refuse(400, "Bad request");
  }

  const c = credentials();
  const isAdmin = matches(username, password, c.adminUser, c.adminPassword);
  const isGuest = !isAdmin && matches(username, password, c.guestUser, c.guestPassword);
  if (!isAdmin && !isGuest) return refuse(401, "Invalid credentials");

  if (isAdmin) {
    const adminValue = adminCookieValue();
    if (!adminValue) return refuse(503, "Sign-in is not configured");

    const response = NextResponse.json({ success: true, role: "admin" }, { headers: NO_STORE });
    response.cookies.set(ADMIN_COOKIE, adminValue, cookieOptions());
    // Owner flag: only the admin account gets it, and only with a secret set.
    const owner = ownerCookieValue();
    if (owner) {
      response.cookies.set(OWNER_COOKIE, owner, cookieOptions({ sameSite: "strict", maxAge: OWNER_MAX_AGE }));
    }
    response.cookies.set(SESSION_HINT_COOKIE, "1", cookieOptions({ httpOnly: false }));
    return response;
  }

  const guestValue = guestCookieValue();
  if (!guestValue) return refuse(503, "Sign-in is not configured");

  const response = NextResponse.json({ success: true, role: "guest" }, { headers: NO_STORE });
  response.cookies.set(GUEST_COOKIE, guestValue, cookieOptions());
  return response;
}

export async function GET(request: Request) {
  return NextResponse.json(
    {
      admin: isAdminRequest(request),
      owner: isOwnerRequest(request),
      guest: isGuestRequest(request),
    },
    { headers: NO_STORE }
  );
}
