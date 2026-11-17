// ============================================================================
// ZEN THEMES CONFIGURATION
// ============================================================================
// Each theme defines a video background with poster fallback, mobile portrait
// image, and optional ambient audio loop.
// WebM (VP9) is the primary source; one MP4 (H.264) per theme is the fallback.
//
// Where the files live: set NEXT_PUBLIC_BACKGROUNDS_BASE_URL to the public
// URL of the backgrounds folder in object storage (Cloudflare R2) and every
// path below points there. While it is unset the copies in public/backgrounds
// are used. scripts/backgrounds-to-r2.mjs builds, uploads and verifies the
// remote set; the remote layout mirrors public/backgrounds (video/, img/).
// ============================================================================

const LOCAL_BACKGROUNDS_BASE = "/backgrounds";

/**
 * Resolve the base URL for background media. Only an https URL is accepted;
 * anything else falls back to the local copies so a typo cannot blank the
 * desktop.
 */
export function resolveBackgroundsBase(value: string | undefined): string {
  const trimmed = (value ?? "").trim().replace(/\/+$/, "");
  return /^https:\/\/[^\s/]+/.test(trimmed) ? trimmed : LOCAL_BACKGROUNDS_BASE;
}

export const BACKGROUNDS_BASE = resolveBackgroundsBase(process.env.NEXT_PUBLIC_BACKGROUNDS_BASE_URL);

export interface ZenTheme {
  id: string;
  name: string;
  /** WebM video (VP9+Opus): primary, smaller */
  videoWebm: string;
  /** MP4 video (H.264+AAC): fallback */
  videoMp4: string;
  /** Desktop poster / reduced-motion fallback (landscape) */
  poster: string;
  /** Mobile portrait fallback image */
  mobilePoster: string;
  description: string;
}

/** A theme with no media: the classic gradient, or a placeholder. */
function plainTheme(id: string, name: string, description: string): ZenTheme {
  return { id, name, videoWebm: "", videoMp4: "", poster: "", mobilePoster: "", description };
}

/** A video theme. `slug` is the file name stem shared by its four files. */
function videoTheme(id: string, slug: string, name: string, description: string): ZenTheme {
  return {
    id,
    name,
    videoWebm: `${BACKGROUNDS_BASE}/video/${slug}.webm`,
    videoMp4: `${BACKGROUNDS_BASE}/video/${slug}.mp4`,
    poster: `${BACKGROUNDS_BASE}/img/${slug}-poster.jpg`,
    mobilePoster: `${BACKGROUNDS_BASE}/img/${slug}-mobile.jpg`,
    description,
  };
}

export const zenThemes: ZenTheme[] = [
  plainTheme("default", "Default", "Classic gradient background."),
  // ---- Original 4 themes ----
  videoTheme("beach", "zen-beach", "Zen Beach", "Gentle waves on a sandy shore."),
  videoTheme("forest", "zen-forest", "Zen Forest", "Peaceful moonlit forest."),
  videoTheme("lake", "zen-lake", "Zen Lake", "Still mountain lake at sunrise."),
  videoTheme("rain", "zen-rain", "Zen Rain", "Soft rain on a window pane."),
  // ---- New themes ----
  videoTheme("rain-window", "rain-window", "Rain Window", "Night rain with droplets on glass."),
  videoTheme("mountain-clouds", "mountain-clouds", "Mountain Clouds", "Clouds drifting through a mountain valley."),
  videoTheme("rainforest", "rainforest", "Rainforest", "Lush jungle canopy with gentle mist."),
  videoTheme("underwater-fish", "underwater-fish", "Underwater", "Calm fish swimming with light caustics."),
  // ---- Batch 3 themes ----
  videoTheme("underwater-reef", "underwater-reef", "Coral Reef", "Tropical reef with colorful fish."),
  videoTheme("arctic-aurora", "arctic-aurora", "Arctic Aurora", "Northern lights over arctic landscape."),
  videoTheme("autumn-river", "autumn-river", "Autumn River", "Golden autumn river flowing through trees."),
  videoTheme("city-night", "city-night", "City Night", "City skyline at twilight with reflections."),
  videoTheme("waterfall", "waterfall", "Waterfall", "Majestic forest waterfall with mist."),
  videoTheme("sea-cliffs", "sea-cliffs", "Sea Cliffs", "Dramatic coastal cliffs shrouded in fog."),
  videoTheme("lava-field", "lava-field", "Lava Field", "Glowing volcanic lava flows."),
  videoTheme("alpine-peaks", "alpine-peaks", "Alpine Peaks", "Snow-capped alpine mountain vista."),
  videoTheme("desert-dunes", "desert-dunes", "Desert Dunes", "Golden desert dunes at sunset."),
  // ---- Placeholder ----
  plainTheme("night", "Zen Night", "Starry night sky. (Coming soon)"),
];

export function getZenTheme(id: string): ZenTheme | undefined {
  return zenThemes.find((t) => t.id === id);
}
