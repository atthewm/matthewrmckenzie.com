import { NextResponse } from "next/server";

const ADMIN_USER = "atthewm";
const ADMIN_PASS = "12qwaszx";
const GUEST_USER = "guest";
const GUEST_PASS = "urawesome2026";
const AUTH_COOKIE = "mckenzie_auth";
const AUTH_VALUE = "mck_gate_2026";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    const isAdmin = username === ADMIN_USER && password === ADMIN_PASS;
    const isGuest = username === GUEST_USER && password === GUEST_PASS;
    if (isAdmin || isGuest) {
      const response = NextResponse.json({ success: true });
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
