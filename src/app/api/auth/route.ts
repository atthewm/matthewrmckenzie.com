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
//
// Accounts:
//   admin  SITE_LOCK_ADMIN_PASSWORD, 16 characters or more. A shorter one turns
//          admin sign-in off instead of guarding it weakly.
//          SITE_LOCK_ADMIN_USER is optional. When it is unset there is no
//          username to match: the password alone signs in, whatever is typed
//          in the username box. There is no built-in "admin" username.
//   guest  SITE_LOCK_GUEST_PASSWORD, optional. SITE_LOCK_GUEST_USER follows
//          the same rule as the admin username.
//
// Wrong passwords are limited per client address, or per IPv6 /64
// (src/lib/sign-in-limit.ts, in memory, per instance): after five, the next
// try waits, and the wait doubles with each further miss. Only an admin
// sign-in clears the count.
// ============================================================================

import { NextResponse } from "next/server";
import { safeEqual } from "@/lib/cookies";
import {
  ADMIN_COOKIE,
  GATE_MAX_AGE,
  GUEST_COOKIE,
  MIN_ADMIN_PASSWORD_LENGTH,
  SESSION_HINT_COOKIE,
  adminCookieValue,
  guestCookieValue,
  isAdminRequest,
  isGuestRequest,
} from "@/lib/gate";
import { NO_STORE, OWNER_COOKIE, OWNER_MAX_AGE, isOwnerRequest, ownerCookieValue } from "@/lib/owner";
import { clientAddress, signInLimiter } from "@/lib/sign-in-limit";

export const dynamic = "force-dynamic";

interface Account {
  /** Null: no username to match, the password alone signs in. */
  user: string | null;
  /** Null: the account is off. */
  password: string | null;
}

let warnedShortPassword = false;

/** Read at request time so nothing about the credentials is fixed at build. */
function accounts(): { admin: Account; guest: Account } {
  const adminPassword = process.env.SITE_LOCK_ADMIN_PASSWORD ?? "";
  const adminPasswordOk = adminPassword.length >= MIN_ADMIN_PASSWORD_LENGTH;
  if (adminPassword && !adminPasswordOk && !warnedShortPassword) {
    warnedShortPassword = true;
    console.warn(
      `Admin sign-in is off: SITE_LOCK_ADMIN_PASSWORD is shorter than ${MIN_ADMIN_PASSWORD_LENGTH} characters.`
    );
  }
  return {
    admin: {
      user: process.env.SITE_LOCK_ADMIN_USER || null,
      password: adminPasswordOk ? adminPassword : null,
    },
    guest: {
      user: process.env.SITE_LOCK_GUEST_USER || null,
      password: process.env.SITE_LOCK_GUEST_PASSWORD || null,
    },
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

function refuse(status: number, error: string, headers: Record<string, string> = {}) {
  return NextResponse.json({ success: false, error }, { status, headers: { ...NO_STORE, ...headers } });
}

function tooManyAttempts(retryAfterSeconds: number) {
  return refuse(429, "Too many attempts. Try again later.", { "Retry-After": String(retryAfterSeconds) });
}

function matches(username: string, password: string, account: Account): boolean {
  if (account.password === null) return false;
  // Both comparisons run in constant time whatever the input.
  const userOk = account.user === null ? true : safeEqual(username, account.user);
  const passwordOk = safeEqual(password, account.password);
  return userOk && passwordOk;
}

export async function POST(request: Request) {
  const address = clientAddress(request);
  // Cheap early answer for an address that is already waiting.
  const early = signInLimiter.check(address);
  if (!early.allowed) return tooManyAttempts(early.retryAfterSeconds);

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

  // From here to the end of the attempt nothing awaits, so the check, the
  // comparison and the count happen as one step. A burst of parallel guesses
  // from one address cannot all slip past the check before the first miss
  // is counted.
  const allowed = signInLimiter.check(address);
  if (!allowed.allowed) return tooManyAttempts(allowed.retryAfterSeconds);

  const { admin, guest } = accounts();
  const isAdmin = matches(username, password, admin);
  const isGuest = !isAdmin && matches(username, password, guest);
  if (!isAdmin && !isGuest) {
    signInLimiter.recordFailure(address);
    return refuse(401, "Invalid credentials");
  }
  // Only the admin password clears the count. A guest sign-in leaves it, so
  // whoever knows the guest password cannot use it to reset admin guessing.
  if (isAdmin) signInLimiter.recordSuccess(address);

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
