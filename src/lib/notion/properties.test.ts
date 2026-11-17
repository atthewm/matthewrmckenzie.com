import { describe, expect, test } from "vitest";
import { DATASETS } from "./datasets";
import {
  getMultiSelect,
  getRichText,
  getSelect,
  getStatus,
  getTitle,
  normalizeDashes,
  type NotionPage,
} from "./properties";

// Dash characters are written as escapes so this file has none of its own.
const FIGURE = "\u2012";
const EN = "\u2013";
const EM = "\u2014";
const BAR = "\u2015";
const HAS_DASH = /[\u2012-\u2015]/;

const titlePage = (name: string, text: string): NotionPage => ({
  id: "page-1",
  properties: { [name]: { type: "title", title: [{ plain_text: text }] } },
});

describe("normalizeDashes", () => {
  test("leaves text without em or en dashes exactly as it was", () => {
    for (const text of ["Spider-Man: Homecoming", "high-protein, low-fat", "2026-11-02", "A - B", "Wait, ... what", ""]) {
      expect(normalizeDashes(text)).toBe(text);
    }
  });

  test("turns an en dash between digits into a range", () => {
    expect(normalizeDashes(`7${EN}11`)).toBe("7 to 11");
    expect(normalizeDashes(`Seasons 1${EN}3, 2019${EN}2021`)).toBe("Seasons 1 to 3, 2019 to 2021");
    expect(normalizeDashes(`pages 10${FIGURE}12`)).toBe("pages 10 to 12");
  });

  test("turns a spaced dash into a comma break", () => {
    expect(normalizeDashes(`Mission: Impossible ${EN} Fallout`)).toBe("Mission: Impossible, Fallout");
    expect(normalizeDashes(`A thief ${EM} the best there is ${EM} takes one last job`)).toBe(
      "A thief, the best there is, takes one last job"
    );
    expect(normalizeDashes(`Apollo 13 ${EN} 1995 film`)).toBe("Apollo 13, 1995 film");
  });

  test("turns an em dash into a comma break even without spaces", () => {
    expect(normalizeDashes(`one goal${EM}revenge`)).toBe("one goal, revenge");
    expect(normalizeDashes(`one goal${BAR}revenge`)).toBe("one goal, revenge");
  });

  test("turns an en dash inside a word into a hyphen", () => {
    expect(normalizeDashes(`Austin${EN}Waco line`)).toBe("Austin-Waco line");
    expect(normalizeDashes(`${EN}5 degrees`)).toBe("-5 degrees");
  });

  test("adds no comma at the ends or next to other punctuation", () => {
    expect(normalizeDashes(`${EM} Roger Ebert`)).toBe("Roger Ebert");
    expect(normalizeDashes(`To be continued ${EM}`)).toBe("To be continued");
    expect(normalizeDashes(`It ends. ${EM} Then it starts again.`)).toBe("It ends. Then it starts again.");
    expect(normalizeDashes(`Title: ${EN} Subtitle`)).toBe("Title: Subtitle");
    expect(normalizeDashes(`He waited ${EM}, then left`)).toBe("He waited, then left");
    expect(normalizeDashes(`A film (${EM}loosely${EM}) about chess`)).toBe("A film (loosely) about chess");
  });

  test("treats a run of dashes as one break", () => {
    expect(normalizeDashes(`before ${EM}${EM} after`)).toBe("before, after");
    expect(normalizeDashes(`before ${EN} ${EN} after`)).toBe("before, after");
  });

  test("never leaves an em or en dash behind", () => {
    const samples = [
      `${EM}`,
      `a${EN}b${EM}c${FIGURE}d${BAR}e`,
      `1${EN}2${EN}3`,
      `  ${EN}  `,
      `x ${EM}${EN}${EM} y`,
      `Line one${EM}\nLine two ${EN} three`,
    ];
    for (const text of samples) expect(normalizeDashes(text), JSON.stringify(text)).not.toMatch(HAS_DASH);
  });
});

describe("text extractors", () => {
  test("getTitle normalizes dashes, unless asked for the raw text", () => {
    const page = titlePage("Title", `Star Wars: Episode IV ${EN} A New Hope`);
    expect(getTitle(page, "Title")).toBe("Star Wars: Episode IV, A New Hope");
    expect(getTitle(page, "Title", { raw: true })).toBe(`Star Wars: Episode IV ${EN} A New Hope`);
    expect(getTitle(page, "Missing")).toBe("");
  });

  test("getRichText normalizes dashes and still returns null for blank text", () => {
    const page: NotionPage = {
      id: "p",
      properties: {
        Synopsis: { rich_text: [{ plain_text: "A crew of thieves" }, { plain_text: ` ${EM} one last job.` }] },
        Blank: { rich_text: [{ plain_text: "   " }] },
        OnlyDash: { rich_text: [{ plain_text: ` ${EM} ` }] },
      },
    };
    expect(getRichText(page, "Synopsis")).toBe("A crew of thieves, one last job.");
    expect(getRichText(page, "Blank")).toBeNull();
    expect(getRichText(page, "OnlyDash")).toBeNull();
    expect(getRichText(page, "Missing")).toBeNull();
  });

  test("select, status and multi select names are normalized too", () => {
    const page: NotionPage = {
      id: "p",
      properties: {
        Network: { select: { name: `Apple TV ${EN} Originals` } },
        Status: { status: { name: `In progress${EM}paused` } },
        Genres: { multi_select: [{ name: "Sci-Fi" }, { name: `Action${EN}Adventure` }, {}] },
      },
    };
    expect(getSelect(page, "Network")).toBe("Apple TV, Originals");
    expect(getStatus(page, "Status")).toBe("In progress, paused");
    expect(getMultiSelect(page, "Genres")).toEqual(["Sci-Fi", "Action-Adventure"]);
    expect(getSelect(page, "Missing")).toBeNull();
    expect(getMultiSelect(page, "Missing")).toEqual([]);
  });
});

describe("dashes in what the sync writes to the cache", () => {
  const ctx = { peopleById: {}, dayById: { day1: "2026-11-16" } };

  test("a film row carries no em or en dash in its title or synopsis", () => {
    const page: NotionPage = {
      id: "film-1",
      properties: {
        Title: { type: "title", title: [{ plain_text: `Mission: Impossible ${EN} Fallout` }] },
        Synopsis: { rich_text: [{ plain_text: `Ethan Hunt${EM}again${EM}saves the day, 2018${EN}2019.` }] },
        Genres: { multi_select: [{ name: `Action${EN}Thriller` }] },
      },
    };
    const row = DATASETS.films.transform?.(page, ctx);
    expect(row?.title).toBe("Mission: Impossible, Fallout");
    expect(JSON.stringify(row)).not.toMatch(HAS_DASH);
  });

  test("meal titles still group on their dashes, and the label that is written has none", () => {
    const meal = (id: string, item: string): NotionPage => ({
      id,
      properties: { Item: { type: "title", title: [{ plain_text: item }] }, Day: { relation: [{ id: "day1" }] } },
    });
    const rows = DATASETS["top-foods"].aggregate?.(
      [
        meal("m1", `ProMix whey isolate shake ${EM} PRE-WORKOUT`),
        meal("m2", `ProMix whey isolate shake ${EN} post run`),
        meal("m3", "ProMix whey isolate shake - evening"),
      ],
      ctx
    );
    // One food, three entries: the qualifier after the dash is dropped, as before.
    expect(rows).toHaveLength(1);
    expect(rows?.[0].title).toBe("ProMix whey isolate shake");
    expect((rows?.[0].data as { count: number }).count).toBe(3);
    expect(JSON.stringify(rows)).not.toMatch(HAS_DASH);
  });

  test("a daily log dated only by its title keeps that date exactly", () => {
    const page = titlePage("Date", "2026-11-16");
    expect(DATASETS.nutrition.transform?.(page, ctx)?.sortKey).toBe("2026-11-16");
  });
});
