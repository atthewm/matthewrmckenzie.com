import { beforeEach, afterEach, describe, expect, test, vi } from "vitest";
import { createHmac } from "node:crypto";

vi.mock("@/lib/whoop/kv", () => import("@/test/session-kv"));
import { records, kvSet, kvGetUntil } from "@/test/session-kv";
import {
  ADMIN_COOKIE, GUEST_COOKIE, OWNER_COOKIE, GATE_MAX_AGE,
  issueGateSession, hasGatePermission, revokeGateSessions,
} from "./gate-session";

const secret = "gate-fixture-only-012345678901234";
const request = (name: string, value: string) => new Request("http://localhost/", { headers: { cookie: name + "=" + value } });

beforeEach(() => {
  records.clear();
  vi.stubEnv("SITE_LOCK_COOKIE_VALUE", secret);
  vi.stubEnv("SITE_LOCK_GUEST_PASSWORD", "guest-fixture");
  vi.stubEnv("OWNER_COOKIE_SECRET", "owner-fixture-only-01234567890123456789");
});
afterEach(() => { vi.useRealTimers(); });

describe("gate session lifecycle", () => {
  test("independent sign-ins get independent records and the current login alone is revoked", async () => {
    const first = (await issueGateSession("admin"))!;
    const second = (await issueGateSession("admin"))!;
    expect(first.gate).not.toBe(second.gate);
    expect(first.owner).not.toBe(first.gate);
    expect(records.size).toBe(2);
    expect(kvSet).toHaveBeenCalledWith(expect.any(String), "admin", GATE_MAX_AGE);
    expect([...records.values()]).toEqual(["admin", "admin"]);
    await revokeGateSessions(request(ADMIN_COOKIE, first.gate));
    expect(await hasGatePermission(request(OWNER_COOKIE, first.owner!), "owner")).toBe(false);
    expect(await hasGatePermission(request(ADMIN_COOKIE, second.gate), "admin")).toBe(true);
  });
  test("refuses an expired login at its signed deadline even when the registry still has the row", async () => {
    vi.useFakeTimers();
    const start = Date.UTC(2026, 1, 1);
    vi.setSystemTime(start);
    const session = (await issueGateSession("admin"))!;
    const req = request(OWNER_COOKIE, session.owner!);
    vi.setSystemTime(start + GATE_MAX_AGE * 1000 - 1);
    expect(await hasGatePermission(req, "owner")).toBe(true);
    vi.setSystemTime(start + GATE_MAX_AGE * 1000);
    expect(records.size).toBe(1);
    expect(await hasGatePermission(req, "owner")).toBe(false);
  });
  test("recognizes only the named role, current proof and exact cookie name", async () => {
    const guest = (await issueGateSession("guest"))!;
    expect(guest.owner).toBeNull();
    expect(await hasGatePermission(request(GUEST_COOKIE, guest.gate), "guest")).toBe(true);
    expect(await hasGatePermission(request(ADMIN_COOKIE, guest.gate), "admin")).toBe(false);
    expect(await hasGatePermission(request(OWNER_COOKIE, guest.gate), "owner")).toBe(false);
    expect(await hasGatePermission(request("extra_" + GUEST_COOKIE, guest.gate), "guest")).toBe(false);
    expect(await hasGatePermission(request(GUEST_COOKIE, guest.gate + "x"), "guest")).toBe(false);
    vi.stubEnv("SITE_LOCK_GUEST_PASSWORD", "");
    expect(await issueGateSession("guest")).toBeNull();
    expect(await hasGatePermission(request(GUEST_COOKIE, guest.gate), "guest")).toBe(false);
  });
  test("retires old raw and deterministic cookies", async () => {
    for (const old of [secret, createHmac("sha256", secret).update("admin-session-v2").digest("hex")]) {
      expect(await hasGatePermission(request(ADMIN_COOKIE, old), "admin")).toBe(false);
    }
    expect(await hasGatePermission(request(GUEST_COOKIE, createHmac("sha256", secret).update("guest-session-v2").digest("hex")), "guest")).toBe(false);
    expect(await hasGatePermission(request(OWNER_COOKIE, createHmac("sha256", process.env.OWNER_COOKIE_SECRET!).update("owner-session-v2").digest("hex")), "owner")).toBe(false);
  });
  test("rotating either key retires its grants and invalid configuration fails closed", async () => {
    const first = (await issueGateSession("admin"))!;
    vi.stubEnv("OWNER_COOKIE_SECRET", "different-owner-fixture-0123456789012345");
    expect(await hasGatePermission(request(OWNER_COOKIE, first.owner!), "owner")).toBe(false);
    const second = (await issueGateSession("admin"))!;
    vi.stubEnv("SITE_LOCK_COOKIE_VALUE", "a-new-gate-key-fixture");
    expect(await hasGatePermission(request(OWNER_COOKIE, second.owner!), "owner")).toBe(false);
    expect(await hasGatePermission(request(ADMIN_COOKIE, second.gate), "admin")).toBe(false);
    vi.stubEnv("OWNER_COOKIE_SECRET", "too short");
    vi.stubEnv("WHOOP_ENCRYPTION_KEY", "a".repeat(64));
    expect((await issueGateSession("admin"))!.owner).toBeNull();
    vi.stubEnv("SITE_LOCK_COOKIE_VALUE", "x".repeat(15));
    expect(await issueGateSession("admin")).toBeNull();
  });
  test("denies a private read when the session store is unavailable", async () => {
    const session = (await issueGateSession("admin"))!;
    kvGetUntil.mockRejectedValueOnce(new Error("fixture unavailable"));
    expect(await hasGatePermission(request(ADMIN_COOKIE, session.gate), "admin")).toBe(false);
  });
});
