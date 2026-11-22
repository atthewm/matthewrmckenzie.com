import { createHmac } from "node:crypto";
import { describe, expect, test, vi } from "vitest";
import { readCookie, safeEqual } from "./cookies";
import {
  ADMIN_COOKIE,
  GUEST_COOKIE,
  adminCookieValue,
  guestCookieValue,
  isAdminRequest,
  isGuestRequest,
} from "./gate";
import { OWNER_COOKIE, isOwnerRequest, ownerCookieValue } from "./owner";

const SECRET = "0123456789abcdef0123456789abcdef";
const OWNER_SECRET = "owner-secret-owner-secret-owner-secret-00";
const GUEST_PASSWORD = "guest pass phrase";

/** Pinned independently of the helpers: HMAC-SHA256 of the secret under a label. */
const hmac = (key: string, label: string) => createHmac("sha256", key).update(label).digest("hex");

function requestWith(cookie?: string): Request {
  return new Request("https://matthewrmckenzie.com/api/anything", {
    headers: cookie ? { cookie } : {},
  });
}

describe("readCookie", () => {
  test("finds a cookie by its whole name", () => {
    expect(readCookie("a=1; mckenzie_auth=abc; b=2", "mckenzie_auth")).toBe("abc");
    expect(readCookie("x_mckenzie_auth=abc", "mckenzie_auth")).toBeNull();
    expect(readCookie("mckenzie_auth_old=abc", "mckenzie_auth")).toBeNull();
  });

  test("keeps values that contain an equals sign and decodes encoded ones", () => {
    expect(readCookie("token=a=b=c", "token")).toBe("a=b=c");
    expect(readCookie("token=a%2Bb%2Fc", "token")).toBe("a+b/c");
    expect(readCookie("token=%E0%A4%A", "token")).toBe("%E0%A4%A");
  });

  test("returns null when there is no header or no such cookie", () => {
    expect(readCookie(null, "mckenzie_auth")).toBeNull();
    expect(readCookie(undefined, "mckenzie_auth")).toBeNull();
    expect(readCookie("", "mckenzie_auth")).toBeNull();
    expect(readCookie("other=1", "mckenzie_auth")).toBeNull();
  });
});

describe("safeEqual", () => {
  test("is true only for identical strings, whatever their lengths", () => {
    expect(safeEqual(SECRET, SECRET)).toBe(true);
    expect(safeEqual(SECRET, `${SECRET}x`)).toBe(false);
    expect(safeEqual(SECRET, SECRET.slice(1))).toBe(false);
    expect(safeEqual("", SECRET)).toBe(false);
  });
});

describe("admin cookie", () => {
  test("is an HMAC of the secret under its own versioned label, never the secret itself", () => {
    vi.stubEnv("SITE_LOCK_COOKIE_VALUE", SECRET);
    expect(adminCookieValue()).toBe(hmac(SECRET, "admin-session-v2"));
    expect(adminCookieValue()).not.toContain(SECRET);
  });

  test("refuses every cookie main handed out, which carried the raw secret", () => {
    vi.stubEnv("SITE_LOCK_COOKIE_VALUE", SECRET);
    expect(isAdminRequest(requestWith(`${ADMIN_COOKIE}=${SECRET}`))).toBe(false);
    // An unconfigured, short cookie value also fails closed.
    expect(isAdminRequest(requestWith(`${ADMIN_COOKIE}=short-fixture`))).toBe(false);
    // An HMAC under an older label does not pass either.
    expect(isAdminRequest(requestWith(`${ADMIN_COOKIE}=${hmac(SECRET, "admin-session-v1")}`))).toBe(false);
  });

  test("has no value, and nobody is admin, when the secret is unset", () => {
    vi.stubEnv("SITE_LOCK_COOKIE_VALUE", "");
    expect(adminCookieValue()).toBeNull();
    expect(isAdminRequest(requestWith(`${ADMIN_COOKIE}=anything`))).toBe(false);
    expect(isAdminRequest(requestWith(`${ADMIN_COOKIE}=`))).toBe(false);
    expect(isAdminRequest(requestWith())).toBe(false);
  });

  test("treats a short secret as unset, so a weak or leaked default cannot work", () => {
    const weak = "x".repeat(15);
    vi.stubEnv("SITE_LOCK_COOKIE_VALUE", weak);
    expect(adminCookieValue()).toBeNull();
    expect(isAdminRequest(requestWith(`${ADMIN_COOKIE}=${weak}`))).toBe(false);
    expect(isAdminRequest(requestWith(`${ADMIN_COOKIE}=${hmac(weak, "admin-session-v2")}`))).toBe(false);
  });

  test("accepts only the exact current value", () => {
    vi.stubEnv("SITE_LOCK_COOKIE_VALUE", SECRET);
    const admin = adminCookieValue() as string;
    expect(isAdminRequest(requestWith(`${ADMIN_COOKIE}=${admin}`))).toBe(true);
    expect(isAdminRequest(requestWith(`theme=dark; ${ADMIN_COOKIE}=${admin}; other=1`))).toBe(true);
    expect(isAdminRequest(requestWith(`${ADMIN_COOKIE}=${admin}x`))).toBe(false);
    expect(isAdminRequest(requestWith(`${ADMIN_COOKIE}=${admin.slice(1)}`))).toBe(false);
    expect(isAdminRequest(requestWith(`${ADMIN_COOKIE}=`))).toBe(false);
    expect(isAdminRequest(requestWith(`x_${ADMIN_COOKIE}=${admin}`))).toBe(false);
    expect(isAdminRequest(requestWith())).toBe(false);
  });

  test("changes with the secret, so a new secret signs every admin out", () => {
    vi.stubEnv("SITE_LOCK_COOKIE_VALUE", SECRET);
    const before = adminCookieValue() as string;
    vi.stubEnv("SITE_LOCK_COOKIE_VALUE", "another-session-secret-0123456789");
    expect(adminCookieValue()).not.toBe(before);
    expect(isAdminRequest(requestWith(`${ADMIN_COOKIE}=${before}`))).toBe(false);
  });
});

describe("guest cookie", () => {
  test("is an HMAC of the secret under its own label, never the admin value or the secret", () => {
    vi.stubEnv("SITE_LOCK_COOKIE_VALUE", SECRET);
    vi.stubEnv("SITE_LOCK_GUEST_PASSWORD", GUEST_PASSWORD);
    const guest = guestCookieValue();
    expect(guest).toBe(hmac(SECRET, "guest-session-v2"));
    expect(guest).not.toBe(adminCookieValue());
    expect(guest).not.toContain(SECRET);
  });

  test("does not make a guest an admin, or an admin cookie a guest one", () => {
    vi.stubEnv("SITE_LOCK_COOKIE_VALUE", SECRET);
    vi.stubEnv("SITE_LOCK_GUEST_PASSWORD", GUEST_PASSWORD);
    const guest = guestCookieValue() as string;
    const admin = adminCookieValue() as string;
    expect(isGuestRequest(requestWith(`${GUEST_COOKIE}=${guest}`))).toBe(true);
    expect(isAdminRequest(requestWith(`${GUEST_COOKIE}=${guest}`))).toBe(false);
    expect(isAdminRequest(requestWith(`${ADMIN_COOKIE}=${guest}`))).toBe(false);
    expect(isGuestRequest(requestWith(`${GUEST_COOKIE}=${admin}`))).toBe(false);
    expect(isGuestRequest(requestWith(`${GUEST_COOKIE}=${SECRET}`))).toBe(false);
  });

  test("refuses the old guest cookie, an HMAC of the guest password", () => {
    vi.stubEnv("SITE_LOCK_COOKIE_VALUE", SECRET);
    vi.stubEnv("SITE_LOCK_GUEST_PASSWORD", GUEST_PASSWORD);
    expect(isGuestRequest(requestWith(`${GUEST_COOKIE}=${hmac(GUEST_PASSWORD, "mmck-guest-v1")}`))).toBe(false);
  });

  test("cannot be issued or accepted while there is no guest password", () => {
    vi.stubEnv("SITE_LOCK_COOKIE_VALUE", SECRET);
    vi.stubEnv("SITE_LOCK_GUEST_PASSWORD", "");
    expect(guestCookieValue()).toBeNull();
    expect(isGuestRequest(requestWith(`${GUEST_COOKIE}=${hmac(SECRET, "guest-session-v2")}`))).toBe(false);
    expect(isGuestRequest(requestWith(`${GUEST_COOKIE}=`))).toBe(false);
  });

  test("cannot be issued or accepted while the secret is unset or short", () => {
    vi.stubEnv("SITE_LOCK_GUEST_PASSWORD", GUEST_PASSWORD);
    for (const secret of ["", "x".repeat(15)]) {
      vi.stubEnv("SITE_LOCK_COOKIE_VALUE", secret);
      expect(guestCookieValue(), secret).toBeNull();
      expect(isGuestRequest(requestWith(`${GUEST_COOKIE}=${hmac(secret, "guest-session-v2")}`))).toBe(false);
    }
  });
});

describe("owner cookie", () => {
  test("is an HMAC of OWNER_COOKIE_SECRET under its own versioned label", () => {
    vi.stubEnv("OWNER_COOKIE_SECRET", OWNER_SECRET);
    expect(ownerCookieValue()).toBe(hmac(OWNER_SECRET, "owner-session-v2"));
  });

  test("refuses the cookie main handed out under the old label", () => {
    vi.stubEnv("OWNER_COOKIE_SECRET", OWNER_SECRET);
    expect(isOwnerRequest(requestWith(`${OWNER_COOKIE}=${hmac(OWNER_SECRET, "mmck-owner-v1")}`))).toBe(false);
  });

  test("is refused without a secret and accepted only with the exact value", () => {
    vi.stubEnv("OWNER_COOKIE_SECRET", "");
    expect(ownerCookieValue()).toBeNull();
    expect(isOwnerRequest(requestWith(`${OWNER_COOKIE}=anything`))).toBe(false);

    vi.stubEnv("OWNER_COOKIE_SECRET", OWNER_SECRET);
    const owner = ownerCookieValue() as string;
    expect(isOwnerRequest(requestWith(`${OWNER_COOKIE}=${owner}`))).toBe(true);
    expect(isOwnerRequest(requestWith(`${OWNER_COOKIE}=${owner}x`))).toBe(false);
    expect(isOwnerRequest(requestWith(`${OWNER_COOKIE}=${OWNER_SECRET}`))).toBe(false);
    expect(isOwnerRequest(requestWith())).toBe(false);
  });

  test("needs its own secret: WHOOP_ENCRYPTION_KEY is no longer a fallback", () => {
    const whoopKey = "a".repeat(64);
    vi.stubEnv("OWNER_COOKIE_SECRET", "");
    vi.stubEnv("WHOOP_ENCRYPTION_KEY", whoopKey);
    expect(ownerCookieValue()).toBeNull();
    expect(isOwnerRequest(requestWith(`${OWNER_COOKIE}=${hmac(whoopKey, "owner-session-v2")}`))).toBe(false);
    expect(isOwnerRequest(requestWith(`${OWNER_COOKIE}=${hmac(whoopKey, "mmck-owner-v1")}`))).toBe(false);
  });

  test("fails closed when the secret is shorter than 32 characters", () => {
    const short = "s".repeat(31);
    vi.stubEnv("OWNER_COOKIE_SECRET", short);
    expect(ownerCookieValue()).toBeNull();
    expect(isOwnerRequest(requestWith(`${OWNER_COOKIE}=${hmac(short, "owner-session-v2")}`))).toBe(false);

    vi.stubEnv("OWNER_COOKIE_SECRET", "s".repeat(32));
    expect(ownerCookieValue()).not.toBeNull();
  });
});
