import { NextResponse } from "next/server";

const VALID_USER = "atthewm";
const VALID_PASS = "12qwaszx";
const AUTH_COOKIE = "mckenzie_auth";
const AUTH_VALUE = "mck_gate_2026";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    if (username === VALID_USER && password === VALID_PASS) {
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
