import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("@/lib/notion/cache", () => ({ readDataset: vi.fn() }));

import { GET } from "./route";
import { readDataset } from "@/lib/notion/cache";
import { ADMIN_COOKIE } from "@/lib/gate";

const COOKIE_VALUE = "0123456789abcdef0123456789abcdef";

function get(dataset: string, cookie?: string): Request {
  return new Request(`https://matthewrmckenzie.com/api/notion/data?dataset=${dataset}`, {
    headers: cookie ? { cookie } : {},
  });
}

const includedPrivate = () => vi.mocked(readDataset).mock.calls.at(-1)?.[1]?.includePrivate;

beforeEach(() => {
  vi.stubEnv("SITE_LOCK_COOKIE_VALUE", COOKIE_VALUE);
  vi.mocked(readDataset).mockReset();
  vi.mocked(readDataset).mockResolvedValue({ items: [{ title: "Heat" }], syncedAt: "2026-11-17T12:00:00.000Z" });
});

describe("GET /api/notion/data", () => {
  test("serves visitors the public fields, cacheable", async () => {
    const response = await GET(get("films"));

    expect(response.status).toBe(200);
    expect((await response.json()).authed).toBe(false);
    expect(includedPrivate()).toBe(false);
    expect(response.headers.get("cache-control")).toBe("public, s-maxage=900, stale-while-revalidate=3600");
  });

  test("adds private fields only for the exact admin cookie value", async () => {
    for (const cookie of [`${ADMIN_COOKIE}=`, `${ADMIN_COOKIE}=guess`, `${ADMIN_COOKIE}=${COOKIE_VALUE}x`, `x${ADMIN_COOKIE}=${COOKIE_VALUE}`]) {
      const response = await GET(get("films", cookie));
      expect((await response.json()).authed, cookie).toBe(false);
      expect(includedPrivate(), cookie).toBe(false);
    }

    const response = await GET(get("films", `${ADMIN_COOKIE}=${COOKIE_VALUE}`));
    expect((await response.json()).authed).toBe(true);
    expect(includedPrivate()).toBe(true);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
  });

  test("fails closed when no cookie value is configured", async () => {
    vi.stubEnv("SITE_LOCK_COOKIE_VALUE", "");
    const response = await GET(get("films", `${ADMIN_COOKIE}=anything`));
    expect((await response.json()).authed).toBe(false);
    expect(includedPrivate()).toBe(false);
  });

  test("does not serve the sync bookkeeping rows or unknown datasets", async () => {
    for (const dataset of ["_sync_state", "_config", "nope"]) {
      const response = await GET(get(dataset, `${ADMIN_COOKIE}=${COOKIE_VALUE}`));
      expect(response.status, dataset).toBe(404);
    }
    expect(readDataset).not.toHaveBeenCalled();
  });
});
