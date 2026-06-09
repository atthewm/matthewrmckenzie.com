// ============================================================================
// NOTION SYNC — CONFIG / ENV
// ============================================================================
// Server-only configuration for the Notion -> Supabase sync.
// Nothing here is exposed to the client. Mirrors the graceful-degradation
// pattern used by src/lib/supabase.ts and src/lib/whoop/config.ts: never crash
// the build when env vars are missing; features degrade at runtime instead.
// ============================================================================

/** Internal-integration token from notion.so/my-integrations. Server only. */
export function getNotionToken(): string | null {
  return process.env.NOTION_TOKEN || null;
}

/** Shared secret that protects the /api/notion/sync endpoint. */
export function getCronSecret(): string | null {
  return process.env.NOTION_SYNC_SECRET || null;
}

export function isNotionConfigured(): boolean {
  return Boolean(getNotionToken());
}

// ---------------------------------------------------------------------------
// Database IDs
// ---------------------------------------------------------------------------
// Defaults are the live database IDs discovered in the HQ workspace, so the
// scaffold works the moment a token is added. Override any of them via env if
// the databases move.
// ---------------------------------------------------------------------------

export const NOTION_DB = {
  // Daily Logs (Nutrition OS)
  nutrition: process.env.NOTION_DB_NUTRITION || "089c0ce983db4f6abe5205d8782f8278",
  // Media Library
  films: process.env.NOTION_DB_FILMS || "22a708535bf849109b0dc1a04a6e01a5",
  tv: process.env.NOTION_DB_TV || "0d6bf30c62e74a70a8c348642555936d",
  books: process.env.NOTION_DB_BOOKS || "d9d41421a52240e68edb422f68003858",
  people: process.env.NOTION_DB_PEOPLE || "84adf0f9e8c047f1aabc44f0421d54e4",
  // Optional / documented for later phases
  recipes: process.env.NOTION_DB_RECIPES || "8cf57959e19d4168885d92ae1c1a8e1a",
  moving: process.env.NOTION_DB_MOVING || "abac90c9248440b3b2b1ca6da60e68e4",
} as const;

export const NOTION_API_BASE = "https://api.notion.com/v1";
export const NOTION_API_VERSION = "2022-06-28";
