import { describe, expect, test } from "vitest";
import {
  FALLBACK_DATE,
  contentDate,
  formatLongDate,
  frontmatterDate,
  latestDate,
  toIsoDay,
  toRssDate,
} from "./page-dates";

describe("toIsoDay", () => {
  test("reads a YAML date object", () => {
    expect(toIsoDay(new Date("2026-11-02T00:00:00Z"))).toBe("2026-11-02");
  });

  test("reads a date string, with or without a time", () => {
    expect(toIsoDay("2026-04-05")).toBe("2026-04-05");
    expect(toIsoDay("2026-04-05T09:30:00Z")).toBe("2026-04-05");
  });

  test("returns null for anything that is not a date", () => {
    for (const value of [undefined, null, "", "soon", "2026-13-45", 20261102, new Date("nope")]) {
      expect(toIsoDay(value)).toBeNull();
    }
  });
});

describe("frontmatterDate", () => {
  test("prefers updated, then dateModified, then date", () => {
    expect(frontmatterDate({ updated: "2026-11-17", dateModified: "2026-05-01", date: "2026-04-05" })).toBe("2026-11-17");
    expect(frontmatterDate({ dateModified: "2026-05-01", date: "2026-04-05" })).toBe("2026-05-01");
    expect(frontmatterDate({ date: "2026-04-05" })).toBe("2026-04-05");
    expect(frontmatterDate({ title: "No date" })).toBeNull();
  });
});

describe("contentDate", () => {
  test("reads the date from a content file", () => {
    expect(contentDate("now")).toBe("2026-11-02");
  });

  test("falls back to a fixed date, never the clock, when the file is missing", () => {
    expect(contentDate("no-such-page")).toBe(FALLBACK_DATE);
  });
});

describe("latestDate", () => {
  test("picks the most recent day", () => {
    expect(latestDate(["2026-02-16", "2026-09-27", "2026-07-21"])).toBe("2026-09-27");
  });

  test("falls back when the list is empty", () => {
    expect(latestDate([])).toBe(FALLBACK_DATE);
  });
});

describe("date formatting", () => {
  test("writes long dates for page copy", () => {
    expect(formatLongDate("2026-03-12")).toBe("March 12, 2026");
  });

  test("writes RSS dates with the right weekday", () => {
    // April 1, 2026 was a Wednesday. The feed used to say Tuesday.
    expect(toRssDate("2026-04-01")).toBe("Wed, 01 Apr 2026 00:00:00 GMT");
    expect(toRssDate("2026-11-17")).toBe("Tue, 17 Nov 2026 00:00:00 GMT");
  });
});
