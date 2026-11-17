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
const GUEST_PASSWORD = "guest pass phrase";

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
  test("has no value, and nobody is admin, when the secret is unset", () => {
    vi.stubEnv("SITE_LOCK_COOKIE_VALUE", "");
    expect(adminCookieValue()).toBeNull();
    expect(isAdminRequest(requestWith(`${ADMIN_COOKIE}=anything`))).toBe(false);
    expect(isAdminRequest(requestWith(`${ADMIN_COOKIE}=`))).toBe(false);
    expect(isAdminRequest(requestWith())).toBe(false);
  });

  test("treats a short value as unset, so a weak or leaked default cannot work", () => {
    // The default that used to be compiled into this public repository was 13
    // characters long. Anything under 16 is refused, even if a request sends it.
    const weak = "x".repeat(13);
    vi.stubEnv("SITE_LOCK_COOKIE_VALUE", weak);
    expect(adminCookieValue()).toBeNull();
    expect(isAdminRequest(requestWith(`${ADMIN_COOKIE}=${weak}`))).toBe(false);
  });

  test("accepts only the exact configured value", () => {
    vi.stubEnv("SITE_LOCK_COOKIE_VALUE", SECRET);
    expect(isAdminRequest(requestWith(`${ADMIN_COOKIE}=${SECRET}`))).toBe(true);
    expect(isAdminRequest(requestWith(`theme=dark; ${ADMIN_COOKIE}=${SECRET}; other=1`))).toBe(true);
    expect(isAdminRequest(requestWith(`${ADMIN_COOKIE}=${SECRET}x`))).toBe(false);
    expect(isAdminRequest(requestWith(`${ADMIN_COOKIE}=wrong`))).toBe(false);
    expect(isAdminRequest(requestWith(`${ADMIN_COOKIE}=`))).toBe(false);
    expect(isAdminRequest(requestWith(`x_${ADMIN_COOKIE}=${SECRET}`))).toBe(false);
    expect(isAdminRequest(requestWith())).toBe(false);
  });
});

describe("guest cookie", () => {
  test("is its own value, never the admin one", () => {
    vi.stubEnv("SITE_LOCK_COOKIE_VALUE", SECRET);
    vi.stubEnv("SITE_LOCK_GUEST_PASSWORD", GUEST_PASSWORD);
    const guest = guestCookieValue();
    expect(guest).toMatch(/^[0-9a-f]{64}$/);
    expect(guest).not.toBe(SECRET);
  });

  test("is derived from the guest password alone, not from the admin secret", () => {
    vi.stubEnv("SITE_LOCK_GUEST_PASSWORD", GUEST_PASSWORD);
    vi.stubEnv("SITE_LOCK_COOKIE_VALUE", SECRET);
    const withOneAdminSecret = guestCookieValue();
    vi.stubEnv("SITE_LOCK_COOKIE_VALUE", "another-admin-secret-0123456789");
    expect(guestCookieValue()).toBe(withOneAdminSecret);
    vi.stubEnv("SITE_LOCK_COOKIE_VALUE", "");
    expect(guestCookieValue()).toBe(withOneAdminSecret);
    // Pinned independently of the helper.
    expect(withOneAdminSecret).toBe(createHmac("sha256", GUEST_PASSWORD).update("mmck-guest-v1").digest("hex"));
    // A new guest password signs every guest out.
    vi.stubEnv("SITE_LOCK_GUEST_PASSWORD", "a different pass phrase");
    expect(guestCookieValue()).not.toBe(withOneAdminSecret);
  });

  test("does not make a guest an admin, or an admin cookie a guest one", () => {
    vi.stubEnv("SITE_LOCK_COOKIE_VALUE", SECRET);
    vi.stubEnv("SITE_LOCK_GUEST_PASSWORD", GUEST_PASSWORD);
    const guest = guestCookieValue() as string;
    expect(isGuestRequest(requestWith(`${GUEST_COOKIE}=${guest}`))).toBe(true);
    expect(isAdminRequest(requestWith(`${GUEST_COOKIE}=${guest}`))).toBe(false);
    expect(isAdminRequest(requestWith(`${ADMIN_COOKIE}=${guest}`))).toBe(false);
    expect(isGuestRequest(requestWith(`${GUEST_COOKIE}=${SECRET}`))).toBe(false);
  });

  test("cannot be issued or accepted while there is no guest password", () => {
    vi.stubEnv("SITE_LOCK_COOKIE_VALUE", SECRET);
    vi.stubEnv("SITE_LOCK_GUEST_PASSWORD", "");
    expect(guestCookieValue()).toBeNull();
    expect(isGuestRequest(requestWith(`${GUEST_COOKIE}=anything`))).toBe(false);
    expect(isGuestRequest(requestWith(`${GUEST_COOKIE}=`))).toBe(false);
  });
});

describe("owner cookie", () => {
  test("is an HMAC of the owner secret, pinned independently of the helper", () => {
    vi.stubEnv("OWNER_COOKIE_SECRET", SECRET);
    expect(ownerCookieValue()).toBe(createHmac("sha256", SECRET).update("mmck-owner-v1").digest("hex"));
  });

  test("is refused without a secret and accepted only with the exact value", () => {
    vi.stubEnv("OWNER_COOKIE_SECRET", "");
    vi.stubEnv("WHOOP_ENCRYPTION_KEY", "");
    expect(ownerCookieValue()).toBeNull();
    expect(isOwnerRequest(requestWith(`${OWNER_COOKIE}=anything`))).toBe(false);

    vi.stubEnv("OWNER_COOKIE_SECRET", SECRET);
    const owner = ownerCookieValue() as string;
    expect(isOwnerRequest(requestWith(`${OWNER_COOKIE}=${owner}`))).toBe(true);
    expect(isOwnerRequest(requestWith(`${OWNER_COOKIE}=${owner}x`))).toBe(false);
    expect(isOwnerRequest(requestWith(`${OWNER_COOKIE}=${SECRET}`))).toBe(false);
    expect(isOwnerRequest(requestWith())).toBe(false);
  });
});
