import { issueLockSession, lockCookies } from "@/lib/lock-session";
import { NextResponse } from "next/server";
import { OWNER_COOKIE, OWNER_MAX_AGE, ownerCookieValue } from "@/lib/owner";

// ---------------------------------------------------------------------------
// Credentials are read from environment variables so they never live in code.
// ---------------------------------------------------------------------------
const ADMIN_USER = process.env.SITE_LOCK_ADMIN_USER ?? "admin";
const ADMIN_PASS = process.env.SITE_LOCK_ADMIN_PASSWORD ?? "";
const GUEST_USER = process.env.SITE_LOCK_GUEST_USER ?? "guest";
const GUEST_PASS = process.env.SITE_LOCK_GUEST_PASSWORD ?? "";

export async function POST(request: Request) {

  try {
    const { username, password } = await request.json();

    const isAdmin =
      ADMIN_PASS.length > 0 &&
      username === ADMIN_USER &&
      password === ADMIN_PASS;

    const isGuest =
      GUEST_PASS.length > 0 &&
      username === GUEST_USER &&
      password === GUEST_PASS;

    if (isAdmin || isGuest) {
      const role = isAdmin ? "admin" : "guest";
      const session = await issueLockSession(role);
      if (!session) return NextResponse.json({ success: false, error: "Sign-in is unavailable" }, { status: 503 });
      const response = NextResponse.json({ success: true, role: isAdmin ? "admin" : "guest" });
      response.cookies.set(lockCookies[role], session, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30,
      });
      // Owner flag: only the admin account gets it, and only with a secret set.
      const owner = isAdmin ? ownerCookieValue() : null;
      if (owner) {
        response.cookies.set(OWNER_COOKIE, owner, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: OWNER_MAX_AGE,
        });
      }
      return response;
    }

    return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
  } catch {
    return NextResponse.json({ success: false, error: "Bad request" }, { status: 400 });
  }
}
