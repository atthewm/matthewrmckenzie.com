import { describe, expect, it } from "vitest";
import { cityLoafSchedule, localDateTime, nextSunday } from "./bakeSchedule";

describe("City Loaf planning", () => {
  it("defaults to the next available Sunday noon in local time", () => {
    expect(nextSunday(new Date(2026, 10, 22, 10))).toBe("2026-11-22T12:00");
    expect(nextSunday(new Date(2026, 10, 22, 14))).toBe("2026-11-29T12:00");
  });

  it("works backward from the second loaf with two 40-minute bakes and an overlapping preheat", () => {
    const rows = cityLoafSchedule("2026-11-29T12:00", 10, 0);
    const start = (title: string) => localDateTime(rows.find((row) => row.title === title)!.time);
    expect(start("Feed starter and start autolyse")).toBe("2026-11-28T18:25");
    expect(start("Refrigerate both baskets")).toBe("2026-11-29T00:40");
    expect(start("Preheat the Dutch oven")).toBe("2026-11-29T09:40");
    expect(start("Load the first loaf")).toBe("2026-11-29T10:40");
    expect(start("Take out loaf one and load loaf two")).toBe("2026-11-29T11:20");
    expect(start("Second loaf out of the oven")).toBe("2026-11-29T12:00");
    expect(start("Slice the second loaf")).toBe("2026-11-29T13:00");
  });

  it("adjusts fermentation independently, supports skipping the overnight chill, and keeps concurrent steps in order", () => {
    const standard = cityLoafSchedule("2026-11-29T18:00", 0, 0);
    const longer = cityLoafSchedule("2026-11-29T18:00", 0, 60);
    expect(standard[0].time.getTime() - longer[0].time.getTime()).toBe(60 * 60_000);
    expect(standard.some(step => step.title === "Refrigerate both baskets")).toBe(false);
    expect(standard.every((step, i) => !i || step.time >= standard[i - 1].time)).toBe(true);
    expect(standard.at(-2)!.time.getTime()).toBe(longer.at(-2)!.time.getTime());
  });

  it("leaves a partial or impossible date without a schedule", () => {
    for (const value of ["", "2026-02-31T12:00", "2026-11"]) {
      expect(cityLoafSchedule(value, 10, 0)).toEqual([]);
    }
  });
});
