import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ---------------------------------------------------------------------------
// Authentication middleware — PUBLIC by default, admin-only routes gated.
//
// The site is publicly accessible. The `mckenzie_auth` cookie is set when
// Matthew logs in via /gate, enabling admin features (guestbook moderation,
// etc.). If `SITE_LOCK_ENABLED` is set to "true", ALL routes are gated again
// (useful for taking the site private temporarily).
// ---------------------------------------------------------------------------

const AUTH_COOKIE = "mckenzie_auth";
const AUTH_VALUE = process.env.SITE_LOCK_COOKIE_VALUE ?? "mck_gate_2026";

export function middleware(request: NextRequest) {
  // Full site lock mode — redirect unauthenticated users to /gate
  if (process.env.SITE_LOCK_ENABLED === "true") {
    // Bypass token: allows dev/preview access via ?token=<value>
    const bypassToken = process.env.SITE_LOCK_BYPASS_TOKEN;
    if (bypassToken && bypassToken.length > 0) {
      const url = new URL(request.url);
      const tokenParam = url.searchParams.get("token");
      if (tokenParam === bypassToken) {
        url.searchParams.delete("token");
        const response = NextResponse.redirect(url);
        response.cookies.set(AUTH_COOKIE, AUTH_VALUE, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 30,
        });
        return response;
      }
    }

    const auth = request.cookies.get(AUTH_COOKIE);
    if (auth?.value !== AUTH_VALUE) {
      return NextResponse.redirect(new URL("/gate", request.url));
    }
  }

  // Site is public — allow all requests through.
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!gate|api/auth|_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp4|webm|mp3|wav|ogg|woff|woff2|ttf|eot)$).*)",
  ],
};
