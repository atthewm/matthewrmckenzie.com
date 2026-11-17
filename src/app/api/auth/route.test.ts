import { beforeEach, describe, expect, test, vi } from "vitest";
import { GET, POST } from "./route";
import { ADMIN_COOKIE, GUEST_COOKIE, SESSION_HINT_COOKIE, guestCookieValue } from "@/lib/gate";
import { OWNER_COOKIE, ownerCookieValue } from "@/lib/owner";

const COOKIE_VALUE = "0123456789abcdef0123456789abcdef";
const OWNER_SECRET = "owner-secret-owner-secret-owner-secret-00";
const ADMIN = { username: "matt", password: "correct horse battery staple" };
const GUEST = { username: "guest", password: "guest pass phrase" };

function post(body: unknown): Request {
  return new Request("https://matthewrmckenzie.com/api/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

function setCookieNames(response: Response): string[] {
  return response.headers.getSetCookie().map((line) => line.split("=")[0]);
}

function setCookie(response: Response, name: string): string | undefined {
  return response.headers.getSetCookie().find((line) => line.startsWith(`${name}=`));
}

/** Set the gate environment for a test. `undefined` leaves a variable unset. */
function configure(overrides: Record<string, string | undefined> = {}) {
  const env: Record<string, string | undefined> = {
    SITE_LOCK_ADMIN_USER: ADMIN.username,
    SITE_LOCK_ADMIN_PASSWORD: ADMIN.password,
    SITE_LOCK_GUEST_USER: GUEST.username,
    SITE_LOCK_GUEST_PASSWORD: GUEST.password,
    SITE_LOCK_COOKIE_VALUE: COOKIE_VALUE,
    OWNER_COOKIE_SECRET: OWNER_SECRET,
    WHOOP_ENCRYPTION_KEY: "",
    SITE_LOCK_ENABLED: "",
    ...overrides,
  };
  for (const [name, value] of Object.entries(env)) vi.stubEnv(name, value);
}

beforeEach(() => configure());

describe("POST /api/auth fails closed", () => {
  test("hands out nothing when no secret is configured at all", async () => {
    configure({
      SITE_LOCK_ADMIN_USER: undefined,
      SITE_LOCK_ADMIN_PASSWORD: undefined,
      SITE_LOCK_GUEST_USER: undefined,
      SITE_LOCK_GUEST_PASSWORD: undefined,
      SITE_LOCK_COOKIE_VALUE: undefined,
      OWNER_COOKIE_SECRET: undefined,
    });

    for (const body of [{ username: "admin", password: "" }, { username: "", password: "" }, { username: "guest", password: "" }, ADMIN]) {
      const response = await POST(post(body));
      expect(response.status).toBe(401);
      expect(response.headers.getSetCookie()).toEqual([]);
    }
  });

  test("does not hand out the admin cookie when the lock is switched off", async () => {
    // The old route answered any POST with the admin cookie in this state.
    configure({ SITE_LOCK_ENABLED: "false" });

    const anonymous = await POST(post({}));
    expect(anonymous.status).toBe(400);
    expect(anonymous.headers.getSetCookie()).toEqual([]);

    const wrong = await POST(post({ username: "anyone", password: "anything" }));
    expect(wrong.status).toBe(401);
    expect(wrong.headers.getSetCookie()).toEqual([]);
  });

  test("refuses the right password when no cookie value is configured", async () => {
    configure({ SITE_LOCK_COOKIE_VALUE: "" });
    const response = await POST(post(ADMIN));
    expect(response.status).toBe(503);
    expect(response.headers.getSetCookie()).toEqual([]);
    expect(await response.json()).toEqual({ success: false, error: "Sign-in is not configured" });
  });

  test("refuses the right password when the cookie value is too short to be a secret", async () => {
    configure({ SITE_LOCK_COOKIE_VALUE: "x".repeat(13) });
    for (const body of [ADMIN, GUEST]) {
      const response = await POST(post(body));
      expect(response.status).toBe(503);
      expect(response.headers.getSetCookie()).toEqual([]);
    }
  });

  test("rejects wrong credentials without setting a cookie", async () => {
    for (const body of [
      { username: ADMIN.username, password: "wrong" },
      { username: "someone", password: ADMIN.password },
      { username: ADMIN.username, password: "" },
      { username: GUEST.username, password: ADMIN.password },
    ]) {
      const response = await POST(post(body));
      expect(response.status, JSON.stringify(body)).toBe(401);
      expect(response.headers.getSetCookie()).toEqual([]);
      expect(response.headers.get("cache-control")).toBe("private, no-store");
    }
  });

  test("rejects a body that is not JSON or not two strings", async () => {
    for (const body of ["not json", { username: ADMIN.username }, { username: 1, password: 2 }, null, [ADMIN]]) {
      const response = await POST(post(body));
      expect(response.status).toBe(400);
      expect(response.headers.getSetCookie()).toEqual([]);
    }
  });

  test("keeps an account disabled while its password is unset", async () => {
    configure({ SITE_LOCK_GUEST_PASSWORD: "" });
    const response = await POST(post({ username: GUEST.username, password: "" }));
    expect(response.status).toBe(401);
    expect(response.headers.getSetCookie()).toEqual([]);
  });
});

describe("POST /api/auth, admin", () => {
  test("sets the admin cookie, the owner cookie and the readable hint", async () => {
    const response = await POST(post(ADMIN));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true, role: "admin" });
    expect(setCookieNames(response).sort()).toEqual([ADMIN_COOKIE, OWNER_COOKIE, SESSION_HINT_COOKIE].sort());
    expect(setCookie(response, ADMIN_COOKIE)).toContain(`${ADMIN_COOKIE}=${COOKIE_VALUE}`);
    expect(setCookie(response, OWNER_COOKIE)).toContain(`${OWNER_COOKIE}=${ownerCookieValue()}`);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
  });

  test("keeps the real cookies out of reach of page scripts", async () => {
    const response = await POST(post(ADMIN));
    expect(setCookie(response, ADMIN_COOKIE)?.toLowerCase()).toContain("httponly");
    expect(setCookie(response, OWNER_COOKIE)?.toLowerCase()).toContain("httponly");
    expect(setCookie(response, OWNER_COOKIE)?.toLowerCase()).toContain("samesite=strict");
    // The hint is readable on purpose and carries no secret.
    expect(setCookie(response, SESSION_HINT_COOKIE)?.toLowerCase()).not.toContain("httponly");
    expect(setCookie(response, SESSION_HINT_COOKIE)).toContain(`${SESSION_HINT_COOKIE}=1`);
  });

  test("skips the owner cookie when no owner secret is set", async () => {
    configure({ OWNER_COOKIE_SECRET: "" });
    const response = await POST(post(ADMIN));
    expect(response.status).toBe(200);
    expect(setCookieNames(response)).not.toContain(OWNER_COOKIE);
  });
});

describe("POST /api/auth, guest", () => {
  test("gets its own cookie, not the admin one", async () => {
    const response = await POST(post(GUEST));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true, role: "guest" });
    expect(setCookieNames(response)).toEqual([GUEST_COOKIE]);
    expect(setCookie(response, GUEST_COOKIE)).toContain(`${GUEST_COOKIE}=${guestCookieValue()}`);
    expect(setCookie(response, GUEST_COOKIE)?.toLowerCase()).toContain("httponly");
    const everything = response.headers.getSetCookie().join("\n");
    expect(everything).not.toContain(COOKIE_VALUE);
    expect(everything).not.toContain(ownerCookieValue() as string);
  });
});

describe("GET /api/auth", () => {
  function get(cookie?: string): Request {
    return new Request("https://matthewrmckenzie.com/api/auth", { headers: cookie ? { cookie } : {} });
  }

  test("reports a signed-out browser, and is never cached", async () => {
    const response = await GET(get());
    expect(await response.json()).toEqual({ admin: false, owner: false, guest: false });
    expect(response.headers.get("cache-control")).toBe("private, no-store");
  });

  test("is not fooled by the readable hint cookie", async () => {
    const response = await GET(get(`${SESSION_HINT_COOKIE}=1; ${ADMIN_COOKIE}=guess; ${OWNER_COOKIE}=guess`));
    expect(await response.json()).toEqual({ admin: false, owner: false, guest: false });
  });

  test("reports each valid cookie on its own", async () => {
    const admin = await GET(get(`${ADMIN_COOKIE}=${COOKIE_VALUE}`));
    expect(await admin.json()).toEqual({ admin: true, owner: false, guest: false });

    const owner = await GET(get(`${ADMIN_COOKIE}=${COOKIE_VALUE}; ${OWNER_COOKIE}=${ownerCookieValue()}`));
    expect(await owner.json()).toEqual({ admin: true, owner: true, guest: false });

    const guest = await GET(get(`${GUEST_COOKIE}=${guestCookieValue()}`));
    expect(await guest.json()).toEqual({ admin: false, owner: false, guest: true });
  });
});
