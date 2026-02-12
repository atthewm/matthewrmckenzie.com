import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_COOKIE = "mckenzie_auth";
const AUTH_VALUE = "mck_gate_2026";

export function middleware(request: NextRequest) {
  const auth = request.cookies.get(AUTH_COOKIE);
  if (auth?.value !== AUTH_VALUE) {
    return NextResponse.redirect(new URL("/gate", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!gate|api/auth|_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp4|webm|mp3|wav|ogg|woff|woff2|ttf|eot)$).*)",
  ],
};
