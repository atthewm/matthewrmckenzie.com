import { beforeEach, describe, expect, test, vi } from "vitest";

// A recording stand-in for the Supabase query builder: every chained call is
// logged, and awaiting the chain resolves with whatever `respond` returns.
type Call = { method: string; args: unknown[] };
type Chain = { table: string; calls: Call[] };
type Result = { data?: unknown; error?: { message: string } | null; count?: number | null };

const chains: Chain[] = [];
let respond: (chain: Chain) => Result = () => ({ data: [], error: null });

function builder(table: string) {
  const chain: Chain = { table, calls: [] };
  chains.push(chain);
  const proxy: Record<string, unknown> = {};
  for (const method of ["select", "eq", "in", "lt", "order", "limit", "upsert", "delete", "insert"]) {
    proxy[method] = (...args: unknown[]) => {
      chain.calls.push({ method, args });
      return proxy;
    };
  }
  proxy.then = (resolve: (value: Result) => unknown, reject: (reason: unknown) => unknown) =>
    Promise.resolve(respond(chain)).then(resolve, reject);
  return proxy;
}

vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({ from: (table: string) => builder(table) }),
}));

const has = (chain: Chain, method: string) => chain.calls.some((c) => c.method === method);
const arg = (chain: Chain, method: string, index = 0) => chain.calls.find((c) => c.method === method)?.args[index];
const isStateRead = (chain: Chain) =>
  has(chain, "select") && chain.calls.some((c) => c.method === "eq" && c.args[1] === "_sync_state");

async function loadCache() {
  vi.resetModules();
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
  vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "service-role-key-for-tests");
  return import("./cache");
}

const row = (id: string) => ({ notionId: id, title: id, sortKey: id, data: { id } });

beforeEach(() => {
  chains.length = 0;
  respond = () => ({ data: [], error: null });
});

describe("upsertRows", () => {
  test("writes the changed rows and never deletes anything", async () => {
    const { upsertRows } = await loadCache();

    expect(await upsertRows("films", [row("a"), row("b")])).toBe(2);

    expect(chains).toHaveLength(1);
    expect(has(chains[0], "upsert")).toBe(true);
    expect(has(chains[0], "delete")).toBe(false);
    const records = arg(chains[0], "upsert") as Array<{ id: string; dataset: string }>;
    expect(records.map((r) => r.id)).toEqual(["films:a", "films:b"]);
  });

  test("does not touch the database when nothing changed", async () => {
    const { upsertRows } = await loadCache();
    expect(await upsertRows("films", [])).toBe(0);
    expect(chains).toHaveLength(0);
  });

  test("surfaces a failed write", async () => {
    respond = () => ({ error: { message: "payload too large" } });
    const { upsertRows } = await loadCache();
    await expect(upsertRows("films", [row("a")])).rejects.toThrow(/payload too large/);
  });
});

describe("deleteRows", () => {
  test("deletes by Notion id inside one dataset, in batches", async () => {
    const { deleteRows } = await loadCache();
    const ids = Array.from({ length: 150 }, (_, i) => `page-${i}`);

    await deleteRows("audiobooks", ids);

    expect(chains).toHaveLength(2);
    for (const chain of chains) {
      expect(has(chain, "delete")).toBe(true);
      expect(chain.calls.find((c) => c.method === "eq")?.args).toEqual(["dataset", "audiobooks"]);
    }
    expect((arg(chains[0], "in", 1) as string[]).length).toBe(100);
    expect((arg(chains[1], "in", 1) as string[]).length).toBe(50);
  });
});

describe("sync state", () => {
  test("reads the state rows for the requested datasets", async () => {
    respond = () => ({
      data: [
        { notion_id: "films", data: { lastRunAt: "2026-11-16T12:00:00.000Z", lastFullAt: "2026-11-15T12:00:00.000Z" } },
        { notion_id: "tv", data: { lastRunAt: 42 } },
      ],
      error: null,
    });
    const { readSyncState, STATE_DATASET, CACHE_TABLE } = await loadCache();

    const state = await readSyncState(["films", "tv", "nutrition"]);

    expect(chains[0].table).toBe(CACHE_TABLE);
    expect(chains[0].calls.find((c) => c.method === "eq")?.args).toEqual(["dataset", STATE_DATASET]);
    expect(state.films).toEqual({ lastRunAt: "2026-11-16T12:00:00.000Z", lastFullAt: "2026-11-15T12:00:00.000Z" });
    // A malformed row reads as "no state", which means a full rebuild.
    expect(state.tv).toEqual({ lastRunAt: null, lastFullAt: null });
    expect(state.nutrition).toBeUndefined();
  });

  test("reads as empty when the query fails, so the caller rebuilds in full", async () => {
    respond = () => ({ data: null, error: { message: "connection reset" } });
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { readSyncState } = await loadCache();
    expect(await readSyncState(["films"])).toEqual({});
  });

  test("stores state under its own dataset name, one row per dataset", async () => {
    const { writeSyncState, STATE_DATASET } = await loadCache();
    const state = { lastRunAt: "2026-11-17T12:00:30.000Z", lastFullAt: "2026-11-15T12:00:00.000Z" };

    await writeSyncState("films", state);

    const record = arg(chains[0], "upsert") as { id: string; dataset: string; notion_id: string; data: unknown };
    expect(record.id).toBe(`${STATE_DATASET}:films`);
    expect(record.dataset).toBe(STATE_DATASET);
    expect(record.notion_id).toBe("films");
    expect(record.data).toEqual(state);
  });

  test("never throws when the state write fails", async () => {
    respond = () => ({ error: { message: "read only" } });
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { writeSyncState } = await loadCache();
    await expect(writeSyncState("films", { lastRunAt: null, lastFullAt: null })).resolves.toBeUndefined();
  });
});

describe("readDataset", () => {
  test("reports the last successful run when it is later than the newest row", async () => {
    respond = (chain) =>
      isStateRead(chain)
        ? { data: [{ notion_id: "films", data: { lastRunAt: "2026-11-17T12:00:30.000Z", lastFullAt: null } }], error: null }
        : { data: [{ data: { title: "Heat" }, private_data: null, sort_key: "1995", synced_at: "2026-11-10T12:00:00+00:00" }], error: null };
    const { readDataset } = await loadCache();

    const result = await readDataset("films");

    expect(result.items).toEqual([{ title: "Heat" }]);
    expect(result.syncedAt).toBe("2026-11-17T12:00:30.000Z");
  });

  test("falls back to the newest row when there is no state yet", async () => {
    respond = (chain) =>
      isStateRead(chain)
        ? { data: [], error: null }
        : {
            data: [
              { data: { title: "Heat" }, private_data: null, sort_key: "1995", synced_at: "2026-11-10T12:00:00+00:00" },
              { data: { title: "Thief" }, private_data: null, sort_key: "1981", synced_at: "2026-11-12T12:00:00+00:00" },
            ],
            error: null,
          };
    const { readDataset } = await loadCache();

    expect((await readDataset("films")).syncedAt).toBe("2026-11-12T12:00:00+00:00");
  });

  test("only merges private fields when asked", async () => {
    respond = (chain) =>
      isStateRead(chain)
        ? { data: [], error: null }
        : { data: [{ data: { title: "Heat" }, private_data: { myReview: "Great" }, sort_key: "1995", synced_at: "2026-11-10T12:00:00+00:00" }], error: null };
    const { readDataset } = await loadCache();

    expect((await readDataset("films")).items).toEqual([{ title: "Heat" }]);
    expect((await readDataset("films", { includePrivate: true })).items).toEqual([
      { title: "Heat", _private: { myReview: "Great" } },
    ]);
  });
});

describe("writeDataset (full rebuild)", () => {
  test("upserts first and prunes older rows afterwards", async () => {
    const { writeDataset } = await loadCache();

    expect(await writeDataset("films", [row("a")])).toBe(1);

    expect(chains).toHaveLength(2);
    expect(has(chains[0], "upsert")).toBe(true);
    expect(has(chains[1], "delete")).toBe(true);
    expect(chains[1].calls.find((c) => c.method === "eq")?.args).toEqual(["dataset", "films"]);
    expect(has(chains[1], "lt")).toBe(true);
  });

  test("refuses to clear a dataset when the source returns nothing", async () => {
    respond = () => ({ count: 2485, error: null });
    const { writeDataset } = await loadCache();
    await expect(writeDataset("films", [])).rejects.toThrow(/refusing to clear 2485 cached rows/);
  });
});
