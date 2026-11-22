import { strict as assert } from "node:assert";
import { test } from "node:test";
import { hasLockSession, issueLockSession, lockCookies } from "./lock-session.ts";

test("configured accounts get role-specific sessions, and missing configuration disables them", async () => {
  const previous = process.env.SITE_LOCK_COOKIE_VALUE;
  try {
    process.env.SITE_LOCK_COOKIE_VALUE = "unit-test-signing-input-only";
    const admin = await issueLockSession("admin");
    const guest = await issueLockSession("guest");
    assert.ok(admin && guest);
    assert.notEqual(admin, guest);
    assert.notEqual(admin, process.env.SITE_LOCK_COOKIE_VALUE);
    assert.equal(await hasLockSession(lockCookies.admin + "=" + admin, "admin"), true);
    assert.equal(await hasLockSession(lockCookies.guest + "=" + guest, "guest"), true);
    assert.equal(await hasLockSession(lockCookies.guest + "=" + guest, "admin"), false);
    assert.equal(await hasLockSession(null, "admin"), false);
    delete process.env.SITE_LOCK_COOKIE_VALUE;
    assert.equal(await issueLockSession("admin"), null);
    assert.equal(await hasLockSession(lockCookies.admin + "=" + admin, "admin"), false);
    process.env.SITE_LOCK_COOKIE_VALUE = "short";
    assert.equal(await issueLockSession("guest"), null);
  } finally {
    if (previous === undefined) delete process.env.SITE_LOCK_COOKIE_VALUE;
    else process.env.SITE_LOCK_COOKIE_VALUE = previous;
  }
});
