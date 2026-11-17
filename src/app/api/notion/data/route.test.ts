import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("@/lib/notion/cache", () => ({ readDataset: vi.fn() }));

import { GET } from "./route";
import { readDataset } from "@/lib/notion/cache";
import { ADMIN_COOKIE, adminCookieValue } from "@/lib/gate";
import { OWNER_COOKIE, ownerCookieValue } from "@/lib/owner";

const COOKIE_VALUE = "0123456789abcdef0123456789abcdef";
const OWNER_SECRET = "owner-secret-owner-secret-owner-secret-00";

function get(dataset: string, cookie?: string): Request {
  return new Request(`https://matthewrmckenzie.com/api/notion/data?dataset=${dataset}`, {
    headers: cookie ? { cookie } : {},
  });
}

const includedPrivate = () => vi.mocked(readDataset).mock.calls.at(-1)?.[1]?.includePrivate;
const adminCookie = () => `${ADMIN_COOKIE}=${adminCookieValue()}`;
const ownerCookie = () => `${OWNER_COOKIE}=${ownerCookieValue()}`;

beforeEach(() => {
  vi.stubEnv("SITE_LOCK_COOKIE_VALUE", COOKIE_VALUE);
  vi.stubEnv("OWNER_COOKIE_SECRET", OWNER_SECRET);
  vi.mocked(readDataset).mockReset();
  vi.mocked(readDataset).mockResolvedValue({ items: [{ title: "Heat" }], syncedAt: "2026-11-17T12:00:00.000Z" });
});

describe("GET /api/notion/data, public datasets", () => {
  test("serves visitors the public fields, cacheable", async () => {
    const response = await GET(get("films"));

    expect(response.status).toBe(200);
    expect((await response.json()).authed).toBe(false);
    expect(includedPrivate()).toBe(false);
    expect(response.headers.get("cache-control")).toBe("public, s-maxage=900, stale-while-revalidate=3600");
  });

  test("adds private fields only for the exact admin cookie value, and then never caches", async () => {
    for (const cookie of [
      `${ADMIN_COOKIE}=`,
      `${ADMIN_COOKIE}=guess`,
      `${ADMIN_COOKIE}=${adminCookieValue()}x`,
      `x${ADMIN_COOKIE}=${adminCookieValue()}`,
      // The cookie main handed out carried the raw secret. It no longer works.
      `${ADMIN_COOKIE}=${COOKIE_VALUE}`,
    ]) {
      const response = await GET(get("films", cookie));
      expect((await response.json()).authed, cookie).toBe(false);
      expect(includedPrivate(), cookie).toBe(false);
    }

    const response = await GET(get("films", adminCookie()));
    expect((await response.json()).authed).toBe(true);
    expect(includedPrivate()).toBe(true);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
  });

  test("fails closed when no cookie secret is configured", async () => {
    vi.stubEnv("SITE_LOCK_COOKIE_VALUE", "");
    const response = await GET(get("films", `${ADMIN_COOKIE}=anything`));
    expect((await response.json()).authed).toBe(false);
    expect(includedPrivate()).toBe(false);
  });

  test("keeps Top Foods, the anonymous rollup, public", async () => {
    const response = await GET(get("top-foods"));
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("public, s-maxage=900, stale-while-revalidate=3600");
  });
});

describe("GET /api/notion/data, nutrition (private)", () => {
  test("is refused to visitors, guests and the admin cookie alone, before the cache is read", async () => {
    for (const cookie of [undefined, adminCookie(), `${OWNER_COOKIE}=guess`, `${OWNER_COOKIE}=`]) {
      const response = await GET(get("nutrition", cookie));
      expect(response.status, cookie).toBe(401);
      expect(response.headers.get("cache-control"), cookie).toBe("private, no-store");
      expect(await response.json()).toEqual({ error: "private dataset", key: "nutrition", authed: false });
    }
    expect(readDataset).not.toHaveBeenCalled();
  });

  test("is refused to everyone when no owner secret is configured", async () => {
    vi.stubEnv("OWNER_COOKIE_SECRET", "");
    const response = await GET(get("nutrition", `${OWNER_COOKIE}=anything`));
    expect(response.status).toBe(401);
    expect(readDataset).not.toHaveBeenCalled();
  });

  test("is served to the owner cookie, and never cached", async () => {
    const response = await GET(get("nutrition", ownerCookie()));

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(await response.json()).toMatchObject({ key: "nutrition", visibility: "private", authed: true, count: 1 });
  });
});

describe("GET /api/notion/data, everything else", () => {
  test("does not serve the sync bookkeeping rows or unknown datasets", async () => {
    for (const dataset of ["_sync_state", "_config", "nope"]) {
      const response = await GET(get(dataset, `${adminCookie()}; ${ownerCookie()}`));
      expect(response.status, dataset).toBe(404);
      expect(response.headers.get("cache-control")).toBe("private, no-store");
    }
    expect(readDataset).not.toHaveBeenCalled();
  });
});
