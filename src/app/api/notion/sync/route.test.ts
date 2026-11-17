import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("@/lib/notion/sync", () => ({ runSync: vi.fn() }));
vi.mock("@/lib/notion/cache", () => ({
  CONFIG_DATASET: "_config",
  getServiceClient: vi.fn(() => ({})),
  readRecentRuns: vi.fn(async () => [{ dataset: "films", ok: true }]),
  readSyncState: vi.fn(async () => ({})),
  recordSyncRuns: vi.fn(async () => undefined),
}));
vi.mock("@/lib/notion/config", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/notion/config")>()),
  isNotionConfigured: () => true,
}));

import { GET, POST } from "./route";
import { runSync } from "@/lib/notion/sync";
import { readRecentRuns } from "@/lib/notion/cache";

const CRON_SECRET = "cron-secret-cron-secret-cron-secret";
const SUMMARY = { ok: true, results: [] };

function request(path: string, headers: Record<string, string> = {}, method = "GET"): Request {
  return new Request(`https://matthewrmckenzie.com/api/notion/sync${path}`, { method, headers });
}

const bearer = (value: string) => ({ authorization: `Bearer ${value}` });

async function expectRefused(response: Response) {
  expect(response.status).toBe(401);
  expect(response.headers.get("cache-control")).toBe("private, no-store");
  expect(await response.json()).toEqual({ error: "unauthorized" });
}

beforeEach(() => {
  vi.stubEnv("CRON_SECRET", CRON_SECRET);
  vi.mocked(runSync).mockReset();
  vi.mocked(runSync).mockResolvedValue(SUMMARY as never);
  vi.mocked(readRecentRuns).mockClear();
});

describe("/api/notion/sync refuses", () => {
  test("a request with no Authorization header", async () => {
    await expectRefused(await GET(request("")));
    await expectRefused(await POST(request("", {}, "POST")));
    expect(runSync).not.toHaveBeenCalled();
  });

  test("the x-vercel-cron header on its own, since anyone can send it", async () => {
    await expectRefused(await GET(request("", { "x-vercel-cron": "1" })));
    expect(runSync).not.toHaveBeenCalled();
  });

  test("the secret in the query string", async () => {
    await expectRefused(await GET(request(`?secret=${CRON_SECRET}`)));
    await expectRefused(await GET(request(`?status=1&secret=${CRON_SECRET}`)));
    expect(runSync).not.toHaveBeenCalled();
    expect(readRecentRuns).not.toHaveBeenCalled();
  });

  test("anything but the exact bearer value", async () => {
    for (const authorization of [
      "Bearer wrong",
      `Bearer ${CRON_SECRET}x`,
      `Bearer ${CRON_SECRET.slice(1)}`,
      `bearer ${CRON_SECRET}`,
      `Bearer  ${CRON_SECRET}`,
      CRON_SECRET,
      `Basic ${CRON_SECRET}`,
    ]) {
      await expectRefused(await GET(request("", { authorization })));
    }
    expect(runSync).not.toHaveBeenCalled();
  });

  test("the old NOTION_SYNC_SECRET, which is no longer read", async () => {
    vi.stubEnv("NOTION_SYNC_SECRET", "old-sync-secret-old-sync-secret");
    await expectRefused(await GET(request("", bearer("old-sync-secret-old-sync-secret"))));
    expect(runSync).not.toHaveBeenCalled();
  });

  test("everything when CRON_SECRET is unset or shorter than 16 characters", async () => {
    vi.stubEnv("CRON_SECRET", "");
    for (const authorization of ["Bearer ", "Bearer undefined", "Bearer null"]) {
      await expectRefused(await GET(request("", { authorization })));
    }
    const short = "c".repeat(15);
    vi.stubEnv("CRON_SECRET", short);
    await expectRefused(await GET(request("", bearer(short))));
    expect(runSync).not.toHaveBeenCalled();
  });

  test("?mode=full and ?status=1 without the secret", async () => {
    await expectRefused(await GET(request("?mode=full")));
    await expectRefused(await GET(request("?status=1")));
    expect(runSync).not.toHaveBeenCalled();
    expect(readRecentRuns).not.toHaveBeenCalled();
  });
});

describe("/api/notion/sync with Authorization: Bearer CRON_SECRET", () => {
  test("runs the scheduled sync, GET or POST, and is never cached", async () => {
    const response = await GET(request("", bearer(CRON_SECRET)));
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(runSync).toHaveBeenCalledWith(undefined, { mode: "auto" });

    expect((await POST(request("", bearer(CRON_SECRET), "POST"))).status).toBe(200);
  });

  test("passes ?mode=full and ?only through", async () => {
    await GET(request("?mode=full&only=films", bearer(CRON_SECRET)));
    expect(runSync).toHaveBeenCalledWith("films", { mode: "full" });
  });

  test("answers ?status=1 without running a sync", async () => {
    const response = await GET(request("?status=1", bearer(CRON_SECRET)));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ runs: [{ dataset: "films", ok: true }], state: {} });
    expect(runSync).not.toHaveBeenCalled();
  });
});
