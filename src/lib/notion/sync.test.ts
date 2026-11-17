import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("./client", () => ({ queryDatabase: vi.fn() }));
vi.mock("./cache", () => ({
  writeDataset: vi.fn(),
  upsertRows: vi.fn(),
  deleteRows: vi.fn(),
  readSyncState: vi.fn(),
  writeSyncState: vi.fn(),
  recordSyncRuns: vi.fn(),
}));

import { queryDatabase } from "./client";
import {
  deleteRows,
  readSyncState,
  recordSyncRuns,
  upsertRows,
  writeDataset,
  writeSyncState,
} from "./cache";
import { NOTION_DB } from "./config";
import type { CacheRow } from "./datasets";
import type { NotionPage } from "./properties";
import { runSync } from "./sync";

const NOW = new Date("2026-11-17T12:00:30.000Z");
const NOW_ISO = NOW.toISOString();
const YESTERDAY = "2026-11-16T12:00:30.000Z";
const TWO_DAYS_AGO = "2026-11-15T12:00:00.000Z";
const EIGHT_DAYS_AGO = "2026-11-09T12:00:00.000Z";
/** Yesterday's run floored to the minute, minus the five minute overlap. */
const SINCE = "2026-11-16T11:55:00.000Z";
const SINCE_FILTER = { timestamp: "last_edited_time", last_edited_time: { on_or_after: SINCE } };

const recent = { lastRunAt: YESTERDAY, lastFullAt: TWO_DAYS_AGO };

function film(id: string, title: string, directorId?: string): NotionPage {
  return {
    id,
    properties: {
      Title: { type: "title", title: [{ plain_text: title }] },
      Director: { relation: directorId ? [{ id: directorId }] : [] },
    },
  };
}

function person(id: string, name: string): NotionPage {
  return { id, properties: { Name: { type: "title", title: [{ plain_text: name }] } } };
}

function recipe(id: string, name: string, favorite: boolean): NotionPage {
  return {
    id,
    properties: { Name: { type: "title", title: [{ plain_text: name }] }, Favorite: { checkbox: favorite } },
  };
}

function dailyLog(id: string, date: string): NotionPage {
  return { id, properties: { "Log Date": { date: { start: date } }, Calories: { number: 1900 } } };
}

const queryMock = vi.mocked(queryDatabase);

/** Answer Notion queries per database id. Unlisted databases return no rows. */
function notionReturns(pagesByDb: Record<string, NotionPage[]>, truncated = false) {
  queryMock.mockImplementation(async (databaseId: string) => ({
    pages: pagesByDb[databaseId] ?? [],
    truncated,
  }));
}

function queriesFor(databaseId: string) {
  return queryMock.mock.calls.filter(([id]) => id === databaseId).map(([, opts]) => opts);
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(readSyncState).mockResolvedValue({});
  vi.mocked(writeDataset).mockImplementation(async (_dataset: string, rows: CacheRow[]) => rows.length);
  vi.mocked(upsertRows).mockImplementation(async (_dataset: string, rows: CacheRow[]) => rows.length);
  vi.mocked(deleteRows).mockResolvedValue(undefined);
  vi.mocked(writeSyncState).mockResolvedValue(undefined);
  vi.mocked(recordSyncRuns).mockResolvedValue(undefined);
  notionReturns({});
});

describe("runSync, first run", () => {
  test("rebuilds in full when a dataset has never synced", async () => {
    notionReturns({
      [NOTION_DB.films]: [film("f1", "Heat", "p1")],
      [NOTION_DB.people]: [person("p1", "Michael Mann")],
    });

    const summary = await runSync("films", { now: NOW });

    expect(summary.ok).toBe(true);
    expect(summary.results).toEqual([expect.objectContaining({ key: "films", mode: "full", count: 1 })]);
    // The whole database is read: no filter.
    expect(queriesFor(NOTION_DB.films)).toEqual([{ max: undefined }]);
    expect(writeDataset).toHaveBeenCalledTimes(1);
    const [dataset, rows] = vi.mocked(writeDataset).mock.calls[0];
    expect(dataset).toBe("films");
    expect((rows[0].data as { creators: string[] }).creators).toEqual(["Michael Mann"]);
    expect(upsertRows).not.toHaveBeenCalled();
    expect(writeSyncState).toHaveBeenCalledWith("films", { lastRunAt: NOW_ISO, lastFullAt: NOW_ISO });
  });
});

describe("runSync, incremental", () => {
  test("asks Notion only for rows edited since the last run", async () => {
    vi.mocked(readSyncState).mockResolvedValue({ films: recent });
    notionReturns({
      [NOTION_DB.films]: [film("f2", "Thief", "p1")],
      [NOTION_DB.people]: [person("p1", "Michael Mann")],
    });

    const summary = await runSync("films", { now: NOW });

    expect(summary.results).toEqual([expect.objectContaining({ key: "films", mode: "incremental", count: 1 })]);
    expect(queriesFor(NOTION_DB.films)).toEqual([{ filter: SINCE_FILTER, max: undefined }]);
    expect(upsertRows).toHaveBeenCalledTimes(1);
    expect(vi.mocked(upsertRows).mock.calls[0][0]).toBe("films");
    expect(vi.mocked(upsertRows).mock.calls[0][1].map((r) => r.title)).toEqual(["Thief"]);
  });

  test("never prunes: the full write path stays untouched", async () => {
    vi.mocked(readSyncState).mockResolvedValue({ films: recent });
    notionReturns({ [NOTION_DB.films]: [film("f2", "Thief")] });

    await runSync("films", { now: NOW });

    expect(writeDataset).not.toHaveBeenCalled();
  });

  test("moves the window forward and keeps the date of the last full rebuild", async () => {
    vi.mocked(readSyncState).mockResolvedValue({ films: recent });
    notionReturns({ [NOTION_DB.films]: [film("f2", "Thief")] });

    await runSync("films", { now: NOW });

    expect(writeSyncState).toHaveBeenCalledWith("films", { lastRunAt: NOW_ISO, lastFullAt: TWO_DAYS_AGO });
  });

  test("does nothing but advance the window when no row changed", async () => {
    vi.mocked(readSyncState).mockResolvedValue({ films: recent });

    const summary = await runSync("films", { now: NOW });

    expect(summary.ok).toBe(true);
    expect(summary.results).toEqual([expect.objectContaining({ key: "films", mode: "incremental", count: 0 })]);
    expect(upsertRows).not.toHaveBeenCalled();
    expect(deleteRows).not.toHaveBeenCalled();
    expect(writeDataset).not.toHaveBeenCalled();
    // Nothing to map, so the People database is not read either.
    expect(queriesFor(NOTION_DB.people)).toEqual([]);
    expect(writeSyncState).toHaveBeenCalledWith("films", { lastRunAt: NOW_ISO, lastFullAt: TWO_DAYS_AGO });
    expect(recordSyncRuns).toHaveBeenCalledWith([expect.objectContaining({ dataset: "films", ok: true, rowCount: 0 })]);
  });

  test("reads People once, and only for datasets that resolve people", async () => {
    vi.mocked(readSyncState).mockResolvedValue({ films: recent, tv: recent, nutrition: recent });
    notionReturns({
      [NOTION_DB.films]: [film("f2", "Thief", "p1")],
      [NOTION_DB.tv]: [film("t1", "Crime Story", "p1")],
      [NOTION_DB.nutrition]: [dailyLog("d1", "2026-11-16")],
      [NOTION_DB.people]: [person("p1", "Michael Mann")],
    });

    await runSync("nutrition", { now: NOW });
    expect(queriesFor(NOTION_DB.people)).toEqual([]);

    queryMock.mockClear();
    await runSync(undefined, { now: NOW });
    expect(queriesFor(NOTION_DB.people)).toEqual([{ max: undefined }]);
  });

  test("removes an edited row that no longer belongs in the dataset", async () => {
    vi.mocked(readSyncState).mockResolvedValue({ "favorite-foods": recent });
    notionReturns({
      [NOTION_DB.recipes]: [recipe("r1", "City Loaf", true), recipe("r2", "Rye Starter", false)],
    });

    const summary = await runSync("favorite-foods", { now: NOW });

    expect(summary.results[0]).toEqual(expect.objectContaining({ mode: "incremental", count: 1 }));
    expect(vi.mocked(upsertRows).mock.calls[0][1].map((r) => r.notionId)).toEqual(["r1"]);
    expect(deleteRows).toHaveBeenCalledWith("favorite-foods", ["r2"]);
  });

  test("skips the aggregate dataset, which cannot be patched from a few rows", async () => {
    vi.mocked(readSyncState).mockResolvedValue({ "top-foods": recent });

    const summary = await runSync("top-foods", { now: NOW });

    expect(summary.ok).toBe(true);
    expect(summary.results).toEqual([{ key: "top-foods", mode: "skipped", count: 0, ms: 0 }]);
    expect(queryMock).not.toHaveBeenCalled();
    expect(writeSyncState).not.toHaveBeenCalled();
    // A skipped dataset is not a run, so it does not enter the run log.
    expect(recordSyncRuns).toHaveBeenCalledWith([]);
  });

  test("flags a truncated pull and leaves the window where it was", async () => {
    vi.mocked(readSyncState).mockResolvedValue({ films: recent });
    notionReturns({ [NOTION_DB.films]: [film("f2", "Thief")] }, true);

    const summary = await runSync("films", { now: NOW });

    expect(summary.ok).toBe(false);
    expect(summary.results[0].error).toMatch(/row cap/);
    expect(writeSyncState).not.toHaveBeenCalled();
  });

  test("keeps going when one dataset fails, and does not advance the failed one", async () => {
    vi.mocked(readSyncState).mockResolvedValue({ films: recent, tv: recent });
    queryMock.mockImplementation(async (databaseId: string) => {
      if (databaseId === NOTION_DB.films) throw new Error("Notion 502");
      return { pages: databaseId === NOTION_DB.tv ? [film("t1", "Crime Story")] : [], truncated: false };
    });

    const summary = await runSync(undefined, { now: NOW });

    expect(summary.ok).toBe(false);
    const byKey = Object.fromEntries(summary.results.map((r) => [r.key, r]));
    expect(byKey.films.error).toBe("Notion 502");
    expect(byKey.tv).toEqual(expect.objectContaining({ mode: "incremental", count: 1 }));
    const advanced = vi.mocked(writeSyncState).mock.calls.map(([key]) => key);
    expect(advanced).toContain("tv");
    expect(advanced).not.toContain("films");
  });
});

describe("runSync, weekly full rebuild", () => {
  const weekOld = { lastRunAt: YESTERDAY, lastFullAt: EIGHT_DAYS_AGO };

  test("rebuilds a dataset whose last full run is a week old", async () => {
    vi.mocked(readSyncState).mockResolvedValue({ films: weekOld });
    notionReturns({ [NOTION_DB.films]: [film("f1", "Heat")] });

    const summary = await runSync("films", { now: NOW });

    expect(summary.results[0]).toEqual(expect.objectContaining({ mode: "full", count: 1 }));
    expect(queriesFor(NOTION_DB.films)).toEqual([{ max: undefined }]);
    expect(writeDataset).toHaveBeenCalledTimes(1);
    expect(writeSyncState).toHaveBeenCalledWith("films", { lastRunAt: NOW_ISO, lastFullAt: NOW_ISO });
  });

  test("recomputes the aggregate dataset on the weekly run", async () => {
    vi.mocked(readSyncState).mockResolvedValue({ "top-foods": weekOld });
    const meal = (id: string): NotionPage => ({
      id,
      properties: { Item: { type: "title", title: [{ plain_text: "Egg whites" }] }, Day: { relation: [{ id: "d1" }] } },
    });
    notionReturns({
      [NOTION_DB.mealEntries]: [meal("m1"), meal("m2")],
      [NOTION_DB.nutrition]: [dailyLog("d1", "2026-11-16")],
    });

    const summary = await runSync("top-foods", { now: NOW });

    expect(summary.results[0]).toEqual(expect.objectContaining({ key: "top-foods", mode: "full", count: 1 }));
    expect(queriesFor(NOTION_DB.mealEntries)).toEqual([{ max: 20000 }]);
    expect(vi.mocked(writeDataset).mock.calls[0][1][0].title).toBe("Egg whites");
  });

  test("mixes modes per dataset in one run", async () => {
    vi.mocked(readSyncState).mockResolvedValue({ films: recent, tv: weekOld });
    notionReturns({ [NOTION_DB.films]: [film("f2", "Thief")], [NOTION_DB.tv]: [film("t1", "Crime Story")] });

    const summary = await runSync(undefined, { now: NOW });
    const modes = Object.fromEntries(summary.results.map((r) => [r.key, r.mode]));

    expect(modes.films).toBe("incremental");
    expect(modes.tv).toBe("full");
    // Datasets with no state yet rebuild in full.
    expect(modes.nutrition).toBe("full");
  });

  test("forces a full rebuild when asked, whatever the state says", async () => {
    vi.mocked(readSyncState).mockResolvedValue({ films: recent });
    notionReturns({ [NOTION_DB.films]: [film("f1", "Heat")] });

    const summary = await runSync("films", { mode: "full", now: NOW });

    expect(summary.results[0].mode).toBe("full");
    expect(queriesFor(NOTION_DB.films)).toEqual([{ max: undefined }]);
  });
});
