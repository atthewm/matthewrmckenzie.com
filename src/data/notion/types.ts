// ============================================================================
// NOTION-SYNCED DATA MODEL
// ============================================================================
// Plain, serializable shapes that the site renders. These are the *clean*
// representations produced by the sync layer from raw Notion rows. They are
// intentionally decoupled from Notion's property model so the UI never has to
// know about Notion internals.
//
// Visibility split:
//   - `data`         -> safe to show publicly
//   - `privateData`  -> only returned to an authenticated admin (gate cookie)
// ============================================================================

export type NotionDatasetKey =
  | "nutrition"
  | "films"
  | "tv"
  | "audiobooks"
  | "favorite-foods";

export type Visibility = "public" | "private";

// ---------------------------------------------------------------------------
// Nutrition (private) — from Daily Logs
// ---------------------------------------------------------------------------

export interface NutritionDay {
  date: string; // ISO date (Log Date)
  status: string | null; // Draft | Locked | Performance Day | Precision Day
  dayType: string | null; // Precision | Performance | Recovery
  calories: number | null;
  calorieTarget: number | null;
  proteinGross: number | null;
  proteinBioavailable: number | null;
  proteinTarget: number | null;
  fat: number | null;
  carbs: number | null;
  fiberFood: number | null;
  fiberTotal: number | null;
  /** Convenience flag computed at sync time: did the day hit its core targets. */
  hitTargets: boolean | null;
}

export interface NutritionTargets {
  calories: number;
  calorieBuffer: number;
  proteinGross: number;
  proteinBioavailable: number;
  fatLow: number;
  fatHigh: number;
  fiber: number;
}

export const DEFAULT_NUTRITION_TARGETS: NutritionTargets = {
  calories: 1850,
  calorieBuffer: 250,
  proteinGross: 200,
  proteinBioavailable: 195,
  fatLow: 60,
  fatHigh: 70,
  fiber: 39,
};

// ---------------------------------------------------------------------------
// Media (public shelf) — unified shape for Films / TV / Audiobooks
// ---------------------------------------------------------------------------

export type MediaKind = "film" | "tv" | "audiobook";

export interface MediaItem {
  id: string; // stable id (notion page id)
  kind: MediaKind;
  title: string;
  year: number | null;
  /** 0–5 stars parsed from the "My Rating" select. */
  rating: number | null;
  ratingStars: string | null; // e.g. "★★★★½"
  status: string | null; // Watched | Watchlist | Reading | Read | ...
  favorite: boolean;
  genres: string[];
  creators: string[]; // director(s) / creator(s) / author + narrator
  coverUrl: string | null;
  synopsis: string | null;
  whereToWatch: string | null;
  trailerUrl: string | null;
  externalUrl: string | null; // IMDB / Goodreads / Audible (built from ASIN)
  network: string | null; // TV network / streaming home / audiobook source
  watchedDate: string | null; // Watched / Finished date (ISO)
  /** Sort hint the API uses (recently watched first). */
  sortKey: string | null;
}

// ---------------------------------------------------------------------------
// Favorite foods (public) — curated subset of the Recipe Booklet / favorites
// ---------------------------------------------------------------------------

export interface FavoriteFood {
  id: string;
  name: string;
  note: string | null;
  tags: string[];
}

// ---------------------------------------------------------------------------
// Cache envelope returned by the read API
// ---------------------------------------------------------------------------

export interface DatasetResponse<T = unknown> {
  key: NotionDatasetKey;
  visibility: Visibility;
  authed: boolean;
  syncedAt: string | null;
  count: number;
  items: T[];
}
