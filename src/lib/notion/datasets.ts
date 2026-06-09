// ============================================================================
// NOTION SYNC — DATASET REGISTRY
// ============================================================================
// One entry per syncable "piece" of Notion. Each entry knows:
//   - which database to read
//   - whether it is public or private
//   - how to turn a raw Notion row into a clean, serializable record
//   - which fields are sensitive (privateData) vs public (data)
//
// Adding a new piece (e.g. the Moving Checklist) is just one more entry here
// plus a small UI component. No other plumbing changes.
// ============================================================================

import { NOTION_DB } from "./config";
import {
  type NotionPage,
  getTitle,
  getRichText,
  getNumber,
  getSelect,
  getStatus,
  getMultiSelect,
  getCheckbox,
  getDate,
  getUrl,
  getFileUrl,
  getRelationIds,
  parseStars,
} from "./properties";
import type {
  NotionDatasetKey,
  Visibility,
  NutritionDay,
  MediaItem,
  FavoriteFood,
  NutritionTargets,
} from "@/data/notion/types";
import { DEFAULT_NUTRITION_TARGETS } from "@/data/notion/types";

export interface SyncContext {
  /** notion page id -> display name, used to resolve relations (people). */
  peopleById: Record<string, string>;
}

export interface CacheRow {
  notionId: string;
  title: string;
  sortKey: string | null;
  data: unknown; // public-safe payload
  privateData?: unknown; // admin-only payload
}

export interface DatasetDef {
  key: NotionDatasetKey;
  label: string;
  visibility: Visibility;
  databaseId: string;
  /** Optional row-level include test (e.g. audiobooks within the Books DB). */
  rowFilter?: (page: NotionPage) => boolean;
  /** Sort newest-first by sortKey when true (default true). */
  sortDescending?: boolean;
  transform: (page: NotionPage, ctx: SyncContext) => CacheRow | null;
}

function resolvePeople(ids: string[], ctx: SyncContext): string[] {
  return ids.map((id) => ctx.peopleById[id]).filter(Boolean);
}

function hitTargets(d: NutritionDay, t: NutritionTargets): boolean | null {
  if (d.calories == null && d.proteinBioavailable == null) return null;
  const calOk =
    d.calories != null
      ? Math.abs(d.calories - (d.calorieTarget ?? t.calories)) <= t.calorieBuffer
      : false;
  const proOk =
    (d.proteinBioavailable ?? 0) >= (d.proteinTarget ?? t.proteinBioavailable);
  const fibOk = (d.fiberFood ?? d.fiberTotal ?? 0) >= t.fiber;
  return calOk && proOk && fibOk;
}

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

export const DATASETS: Record<NotionDatasetKey, DatasetDef> = {
  // -- Nutrition (PRIVATE) ---------------------------------------------------
  nutrition: {
    key: "nutrition",
    label: "Nutrition",
    visibility: "private",
    databaseId: NOTION_DB.nutrition,
    transform: (page, _ctx) => {
      const date = getDate(page, "Log Date") || getTitle(page, "Date");
      if (!date) return null;
      const day: NutritionDay = {
        date,
        status: getSelect(page, "Status") ?? getStatus(page, "Status"),
        dayType: getSelect(page, "Day Type"),
        calories: getNumber(page, "Calories"),
        calorieTarget: getNumber(page, "Calorie Target"),
        proteinGross: getNumber(page, "Protein Gross"),
        proteinBioavailable: getNumber(page, "Protein Bioavailable"),
        proteinTarget: getNumber(page, "Protein Target"),
        fat: getNumber(page, "Fat"),
        carbs: getNumber(page, "Carbs"),
        fiberFood: getNumber(page, "Fiber Food"),
        fiberTotal: getNumber(page, "Fiber Total"),
        hitTargets: null,
      };
      day.hitTargets = hitTargets(day, DEFAULT_NUTRITION_TARGETS);
      return { notionId: page.id, title: date, sortKey: date, data: day };
    },
  },

  // -- Films (PUBLIC, private notes) ----------------------------------------
  films: {
    key: "films",
    label: "Movies",
    visibility: "public",
    databaseId: NOTION_DB.films,
    transform: (page, ctx) => {
      const title = getTitle(page, "Title");
      if (!title) return null;
      const stars = getSelect(page, "My Rating");
      const watchedDate = getDate(page, "Watched Date");
      const year = getNumber(page, "Year");
      const item: MediaItem = {
        id: page.id,
        kind: "film",
        title,
        year,
        rating: parseStars(stars),
        ratingStars: stars,
        status: getSelect(page, "Status"),
        favorite: getCheckbox(page, "Favorite"),
        genres: getMultiSelect(page, "Genres"),
        creators: resolvePeople(getRelationIds(page, "Director"), ctx),
        coverUrl: getUrl(page, "Cover URL") ?? getFileUrl(page, "Cover"),
        synopsis: getRichText(page, "Synopsis"),
        whereToWatch: getUrl(page, "Where to Watch"),
        trailerUrl: getUrl(page, "Trailer URL"),
        externalUrl: getUrl(page, "IMDB URL"),
        network: getMultiSelect(page, "Streaming")[0] ?? null,
        watchedDate,
        sortKey: watchedDate ?? (year != null ? String(year) : null),
      };
      return {
        notionId: page.id,
        title,
        sortKey: item.sortKey,
        data: item,
        privateData: {
          personalNotes: getRichText(page, "Personal Notes"),
          myReview: getRichText(page, "My Review"),
          parentGuide: getRichText(page, "Parent Guide"),
        },
      };
    },
  },

  // -- TV Shows (PUBLIC, private notes) -------------------------------------
  tv: {
    key: "tv",
    label: "TV",
    visibility: "public",
    databaseId: NOTION_DB.tv,
    transform: (page, ctx) => {
      const title = getTitle(page, "Title");
      if (!title) return null;
      const stars = getSelect(page, "My Rating");
      const watchedDate = getDate(page, "Last Watched Date");
      const year = getNumber(page, "Year Started");
      const item: MediaItem = {
        id: page.id,
        kind: "tv",
        title,
        year,
        rating: parseStars(stars),
        ratingStars: stars,
        status: getSelect(page, "Status"),
        favorite: getCheckbox(page, "Favorite"),
        genres: getMultiSelect(page, "Genres"),
        creators: resolvePeople(getRelationIds(page, "Creator"), ctx),
        coverUrl: getUrl(page, "Cover URL") ?? getFileUrl(page, "Cover"),
        synopsis: getRichText(page, "Synopsis"),
        whereToWatch: getUrl(page, "Where to Watch"),
        trailerUrl: getUrl(page, "Trailer URL"),
        externalUrl: getUrl(page, "IMDB URL"),
        network: getSelect(page, "Network / Platform"),
        watchedDate,
        sortKey: watchedDate ?? (year != null ? String(year) : null),
      };
      return {
        notionId: page.id,
        title,
        sortKey: item.sortKey,
        data: item,
        privateData: {
          personalNotes: getRichText(page, "Personal Notes"),
          myReview: getRichText(page, "My Review"),
          bestEpisode: getRichText(page, "Best Episode"),
          parentGuide: getRichText(page, "Parent Guide"),
        },
      };
    },
  },

  // -- Audiobooks (PUBLIC, private notes) — Books DB filtered ----------------
  audiobooks: {
    key: "audiobooks",
    label: "Audiobooks",
    visibility: "public",
    databaseId: NOTION_DB.books,
    rowFilter: (page) =>
      getMultiSelect(page, "Format").includes("Audiobook") ||
      getSelect(page, "Source") === "Audible",
    transform: (page, ctx) => {
      const title = getTitle(page, "Title");
      if (!title) return null;
      const stars = getSelect(page, "My Rating");
      const finished = getDate(page, "Finished Date");
      const started = getDate(page, "Started Date");
      const asin = getRichText(page, "ASIN");
      const authors = resolvePeople(getRelationIds(page, "Author"), ctx);
      const narrators = resolvePeople(getRelationIds(page, "Narrator"), ctx);
      const year = getNumber(page, "Year");
      const item: MediaItem = {
        id: page.id,
        kind: "audiobook",
        title,
        year,
        rating: parseStars(stars),
        ratingStars: stars,
        status: getSelect(page, "Status"),
        favorite: getCheckbox(page, "Favorite"),
        genres: getMultiSelect(page, "Genres"),
        creators: authors,
        coverUrl: getFileUrl(page, "Cover"),
        synopsis: getRichText(page, "Synopsis"),
        whereToWatch: null,
        trailerUrl: null,
        externalUrl:
          getUrl(page, "Goodreads / Storygraph URL") ??
          (asin ? `https://www.audible.com/pd/${asin}` : null),
        network: getSelect(page, "Source"),
        watchedDate: finished ?? started,
        sortKey: (finished ?? started) ?? (year != null ? String(year) : null),
      };
      return {
        notionId: page.id,
        title,
        sortKey: item.sortKey,
        data: item,
        privateData: {
          narrators,
          notes: getRichText(page, "Notes / Highlights"),
        },
      };
    },
  },

  // -- Favorite foods (PUBLIC) — Recipe Booklet favorites -------------------
  // NOTE: Recipe Booklet field names are best-effort; confirm against the live
  // schema and adjust the getters below if needed.
  "favorite-foods": {
    key: "favorite-foods",
    label: "Favorite Foods",
    visibility: "public",
    databaseId: NOTION_DB.recipes,
    rowFilter: (page) => getCheckbox(page, "Favorite"),
    transform: (page) => {
      const name = getTitle(page, "Name") || getTitle(page, "Title");
      if (!name) return null;
      const food: FavoriteFood = {
        id: page.id,
        name,
        note: getRichText(page, "Notes") ?? getRichText(page, "Description"),
        tags: getMultiSelect(page, "Tags").length
          ? getMultiSelect(page, "Tags")
          : getMultiSelect(page, "Category"),
      };
      return { notionId: page.id, title: name, sortKey: name, data: food };
    },
  },
};

export const DATASET_LIST: DatasetDef[] = Object.values(DATASETS);

export function getDataset(key: string): DatasetDef | null {
  return (DATASETS as Record<string, DatasetDef>)[key] ?? null;
}
