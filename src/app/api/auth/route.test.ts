import { beforeEach, describe, expect, test, vi } from "vitest";
import { records, kvDel, kvSet } from "@/test/session-kv";

vi.mock("@/lib/whoop/kv", () => import("@/test/session-kv"));
import { DELETE, GET, POST } from "./route";
import {
  ADMIN_COOKIE,
  GUEST_COOKIE,
  SESSION_HINT_COOKIE,
} from "@/lib/gate";
import { OWNER_COOKIE } from "@/lib/owner";
import { signInLimiter } from "@/lib/sign-in-limit";

const COOKIE_VALUE = "0123456789abcdef0123456789abcdef";
const OWNER_SECRET = "owner-secret-owner-secret-owner-secret-00";
const ADMIN = { username: "matt", password: "correct horse battery staple" };
const GUEST = { username: "guest", password: "guest pass phrase" };

function post(body: unknown, headers: Record<string, string> = {}): Request {
  return new Request("https://matthewrmckenzie.com/api/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
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

beforeEach(() => {
  records.clear();
  configure();
  signInLimiter.clear();
});

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

  test("refuses the right password when no cookie secret is configured", async () => {
    configure({ SITE_LOCK_COOKIE_VALUE: "" });
    const response = await POST(post(ADMIN));
    expect(response.status).toBe(503);
    expect(response.headers.getSetCookie()).toEqual([]);
    expect(await response.json()).toEqual({ success: false, error: "Sign-in is not configured" });
  });

  test("refuses the right password when the cookie secret is too short to be a secret", async () => {
    configure({ SITE_LOCK_COOKIE_VALUE: "x".repeat(15) });
    const response = await POST(post(ADMIN));
    expect(response.status).toBe(503);
    expect(response.headers.getSetCookie()).toEqual([]);
  });

  test("never gives a guest the admin cookie, whatever the cookie secret is", async () => {
    const ok = await POST(post(GUEST));
    expect(ok.status).toBe(200);
    expect(setCookieNames(ok)).toEqual([GUEST_COOKIE]);

    for (const cookieValue of ["x".repeat(15), undefined]) {
      configure({ SITE_LOCK_COOKIE_VALUE: cookieValue });
      const response = await POST(post(GUEST));
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

describe("POST /api/auth, the admin password", () => {
  test("turns admin sign-in off when it is shorter than 16 characters, even typed correctly", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const short = "fifteen chars!!";
    expect(short).toHaveLength(15);
    configure({ SITE_LOCK_ADMIN_PASSWORD: short });

    const response = await POST(post({ username: ADMIN.username, password: short }));
    expect(response.status).toBe(401);
    expect(response.headers.getSetCookie()).toEqual([]);
    // Said in the server log, by name only, never the value.
    expect(warn.mock.calls.flat().join(" ")).not.toContain(short);
  });

  test("works at 16 characters", async () => {
    const sixteen = "sixteen chars!!!";
    expect(sixteen).toHaveLength(16);
    configure({ SITE_LOCK_ADMIN_PASSWORD: sixteen });
    const response = await POST(post({ username: ADMIN.username, password: sixteen }));
    expect(response.status).toBe(200);
  });
});

describe("POST /api/auth, usernames", () => {
  test("with SITE_LOCK_ADMIN_USER unset, the password alone signs in, whatever the username box says", async () => {
    configure({ SITE_LOCK_ADMIN_USER: undefined });
    for (const username of ["", "admin", "anything"]) {
      const response = await POST(post({ username, password: ADMIN.password }));
      expect(response.status, username).toBe(200);
      expect(await response.json()).toEqual({ success: true, role: "admin" });
    }
    const wrong = await POST(post({ username: "", password: "wrong" }));
    expect(wrong.status).toBe(401);
  });

  test("with SITE_LOCK_ADMIN_USER set, the username must match, and \"admin\" is no default", async () => {
    const wrongUser = await POST(post({ username: "admin", password: ADMIN.password }));
    expect(wrongUser.status).toBe(401);
    expect(wrongUser.headers.getSetCookie()).toEqual([]);

    const right = await POST(post(ADMIN));
    expect(right.status).toBe(200);
  });

  test("the guest username follows the same rule", async () => {
    configure({ SITE_LOCK_GUEST_USER: undefined });
    const response = await POST(post({ username: "", password: GUEST.password }));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true, role: "guest" });
  });
});

describe("POST /api/auth, attempt limit", () => {
  const from = (ip: string) => ({ "x-forwarded-for": ip });
  const wrong = { username: ADMIN.username, password: "wrong guess" };

  test("after five wrong tries from one address, the next waits, and the password is not even checked", async () => {
    for (let i = 0; i < 5; i++) {
      expect((await POST(post(wrong, from("203.0.113.9")))).status).toBe(401);
    }

    const blocked = await POST(post(ADMIN, from("203.0.113.9")));
    expect(blocked.status).toBe(429);
    expect(blocked.headers.getSetCookie()).toEqual([]);
    expect(Number(blocked.headers.get("retry-after"))).toBeGreaterThan(0);
    expect(blocked.headers.get("cache-control")).toBe("private, no-store");
    expect(await blocked.json()).toEqual({ success: false, error: "Too many attempts. Try again later." });

    // Another address is not affected.
    expect((await POST(post(ADMIN, from("198.51.100.4")))).status).toBe(200);
  });

  test("a successful sign-in clears the count", async () => {
    for (let i = 0; i < 4; i++) await POST(post(wrong, from("203.0.113.10")));
    expect((await POST(post(ADMIN, from("203.0.113.10")))).status).toBe(200);
    for (let i = 0; i < 4; i++) {
      expect((await POST(post(wrong, from("203.0.113.10")))).status).toBe(401);
    }
  });

  test("malformed requests are refused without counting as guesses", async () => {
    for (let i = 0; i < 8; i++) await POST(post("not json", from("203.0.113.11")));
    expect((await POST(post(ADMIN, from("203.0.113.11")))).status).toBe(200);
  });

  test("a guest sign-in does not reset the count of admin guesses", async () => {
    for (let i = 0; i < 4; i++) await POST(post(wrong, from("203.0.113.12")));
    expect((await POST(post(GUEST, from("203.0.113.12")))).status).toBe(200);
    expect((await POST(post(wrong, from("203.0.113.12")))).status).toBe(401);
    expect((await POST(post(ADMIN, from("203.0.113.12")))).status).toBe(429);
  });

  test("a burst of parallel guesses gets five tries, not one per request", async () => {
    const statuses = await Promise.all(
      Array.from({ length: 12 }, () => POST(post(wrong, from("203.0.113.13"))).then((r) => r.status))
    );
    expect(statuses.filter((s) => s === 401)).toHaveLength(5);
    expect(statuses.filter((s) => s === 429)).toHaveLength(7);
  });

  test("counts an IPv6 /64 as one address", async () => {
    for (let i = 0; i < 5; i++) {
      expect((await POST(post(wrong, from(`2001:db8:1:2::${i + 1}`)))).status).toBe(401);
    }
    expect((await POST(post(ADMIN, from("2001:db8:1:2:aaaa:bbbb:cccc:dddd")))).status).toBe(429);
    expect((await POST(post(ADMIN, from("2001:db8:1:3::1")))).status).toBe(200);
  });
});

describe("POST /api/auth, admin", () => {
  test("sets the admin cookie, the owner cookie and the readable hint", async () => {
    const response = await POST(post(ADMIN));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true, role: "admin" });
    expect(setCookieNames(response).sort()).toEqual([ADMIN_COOKIE, OWNER_COOKIE, SESSION_HINT_COOKIE].sort());
    expect(setCookie(response, ADMIN_COOKIE)).toContain(`${ADMIN_COOKIE}=v3.`);
    expect(setCookie(response, OWNER_COOKIE)).toContain(`${OWNER_COOKIE}=v3.`);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
  });

  test("never sends account passwords or signing secrets to the browser", async () => {
    const response = await POST(post(ADMIN));
    const everything = `${response.headers.getSetCookie().join("\n")}\n${await response.text()}`;
    expect(everything).not.toContain(COOKIE_VALUE);
    expect(everything).not.toContain(OWNER_SECRET);
    expect(everything).not.toContain(ADMIN.password);
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

describe("POST /api/auth, cookie attributes in production", () => {
  test("marks every cookie Secure, site wide, for thirty days", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const response = await POST(post(ADMIN));
    for (const name of [ADMIN_COOKIE, OWNER_COOKIE, SESSION_HINT_COOKIE]) {
      const line = setCookie(response, name)?.toLowerCase() ?? "";
      expect(line, name).toContain("secure");
      expect(line, name).toContain("path=/");
      expect(line, name).toContain("max-age=2592000");
    }
    expect(setCookie(response, ADMIN_COOKIE)?.toLowerCase()).toContain("samesite=lax");

    const guest = await POST(post(GUEST));
    const line = setCookie(guest, GUEST_COOKIE)?.toLowerCase() ?? "";
    expect(line).toContain("secure");
    expect(line).toContain("httponly");
    expect(line).toContain("path=/");
  });

  test("leaves Secure off outside production so sign-in works on http://localhost", async () => {
    vi.stubEnv("NODE_ENV", "development");
    const response = await POST(post(ADMIN));
    expect(setCookie(response, ADMIN_COOKIE)?.toLowerCase()).not.toContain("secure");
  });
});

describe("POST /api/auth, guest", () => {
  test("gets its own cookie, not the admin one", async () => {
    const response = await POST(post(GUEST));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true, role: "guest" });
    expect(setCookieNames(response)).toEqual([GUEST_COOKIE]);
    expect(setCookie(response, GUEST_COOKIE)).toContain(`${GUEST_COOKIE}=v3.`);
    expect(setCookie(response, GUEST_COOKIE)?.toLowerCase()).toContain("httponly");
    const everything = response.headers.getSetCookie().join("\n");
    expect(everything).not.toContain(COOKIE_VALUE);
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

  test("does not accept an old cookie that carries the raw secret", async () => {
    const response = await GET(get(`${ADMIN_COOKIE}=${COOKIE_VALUE}`));
    expect(await response.json()).toEqual({ admin: false, owner: false, guest: false });
  });

  test("reports each valid cookie on its own", async () => {
    const adminLogin = await POST(post(ADMIN));
    const adminCookie = setCookie(adminLogin, ADMIN_COOKIE)!.split(";")[0];
    const admin = await GET(get(adminCookie));
    expect(await admin.json()).toEqual({ admin: true, owner: false, guest: false });
    const ownerCookie = setCookie(adminLogin, OWNER_COOKIE)!.split(";")[0];
    const owner = await GET(get(adminCookie + "; " + ownerCookie));
    expect(await owner.json()).toEqual({ admin: true, owner: true, guest: false });
    const guestLogin = await POST(post(GUEST));
    const guest = await GET(get(setCookie(guestLogin, GUEST_COOKIE)!.split(";")[0]));
    expect(await guest.json()).toEqual({ admin: false, owner: false, guest: true });
  });
});

function browserSession(response: Response) {
  return response.headers.getSetCookie().map(line => line.split(";")[0]).join("; ");
}

describe("retiring a browser login", () => {
  test("accepts the original browser host behind Next and refuses another origin", async () => {
    const local = new Request("http://localhost:3000/api/auth", {
      method: "DELETE", headers: { host: "127.0.0.1:3000", origin: "http://127.0.0.1:3000" },
    });
    expect((await DELETE(local)).status).toBe(200);
    const other = new Request(local, { headers: { host: "127.0.0.1:3000", origin: "https://other.invalid" } });
    expect((await DELETE(other)).status).toBe(403);
  });
  test("sign-out removes the stored login and clears all four cookies", async () => {
    const cookie = browserSession(await POST(post(ADMIN)));
    const request = new Request("https://matthewrmckenzie.com/api/auth", { headers: { cookie } });
    const result = await DELETE(request);
    expect(result.status).toBe(200);
    expect(result.headers.getSetCookie()).toHaveLength(4);
    for (const line of result.headers.getSetCookie()) expect(line.toLowerCase()).toContain("max-age=0");
    expect(await (await GET(request)).json()).toEqual({ admin: false, owner: false, guest: false });
    expect((await DELETE(request)).status).toBe(200);
  });
  test("changing to guest retires the earlier owner session", async () => {
    const cookie = browserSession(await POST(post(ADMIN)));
    const res = await POST(post(GUEST, { cookie }));
    expect(setCookie(res, OWNER_COOKIE)?.toLowerCase()).toContain("max-age=0");
    expect(setCookie(res, ADMIN_COOKIE)?.toLowerCase()).toContain("max-age=0");
    expect(await (await GET(post({}, { cookie }))).json()).toEqual({ admin: false, owner: false, guest: false });
  });
  test("does not acknowledge failed creation or revocation", async () => {
    kvSet.mockRejectedValueOnce(new Error("storage unavailable"));
    const login = await POST(post(ADMIN));
    expect(login.status).toBe(503);
    expect(login.headers.getSetCookie()).toEqual([]);
    const cookie = browserSession(await POST(post(ADMIN)));
    kvDel.mockRejectedValueOnce(new Error("storage unavailable"));
    const logout = await DELETE(post({}, { cookie }));
    expect(logout.status).toBe(503);
    expect(logout.headers.getSetCookie()).toEqual([]);
    expect((await DELETE(post({}, { cookie }))).status).toBe(200);
  });
});
