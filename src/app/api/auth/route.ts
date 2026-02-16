import { NextResponse } from "next/server";

// ---------------------------------------------------------------------------
// Credentials are read from environment variables so they never live in code.
// Fallbacks are provided for local development only.
// ---------------------------------------------------------------------------
const ADMIN_USER = process.env.SITE_LOCK_ADMIN_USER ?? "admin";
const ADMIN_PASS = process.env.SITE_LOCK_ADMIN_PASSWORD ?? "";
const GUEST_USER = process.env.SITE_LOCK_GUEST_USER ?? "guest";
const GUEST_PASS = process.env.SITE_LOCK_GUEST_PASSWORD ?? "";
const AUTH_COOKIE = "mckenzie_auth";
const AUTH_VALUE = process.env.SITE_LOCK_COOKIE_VALUE ?? "mck_gate_2026";

export async function POST(request: Request) {
  // If the site lock is explicitly disabled, let everyone through.
  if (process.env.SITE_LOCK_ENABLED === "false") {
    const response = NextResponse.json({ success: true });
    response.cookies.set(AUTH_COOKIE, AUTH_VALUE, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
    });
    return response;
  }

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
      const response = NextResponse.json({ success: true, role: isAdmin ? "admin" : "guest" });
      response.cookies.set(AUTH_COOKIE, AUTH_VALUE, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30,
      });
      return response;
    }

    return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
  } catch {
    return NextResponse.json({ success: false, error: "Bad request" }, { status: 400 });
  }
}
