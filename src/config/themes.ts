// ============================================================================
// ZEN THEMES CONFIGURATION
// ============================================================================
// Each theme defines a video background with poster fallback, mobile portrait
// image, and optional ambient audio loop. Assets live in /public/backgrounds/.
// WebM (VP9) is preferred for smaller size; MP4 (H.264) is the fallback.
// ============================================================================

export interface ZenTheme {
  id: string;
  name: string;
  /** WebM video (VP9+Opus) — primary, smaller */
  videoWebm: string;
  /** MP4 video (H.264+AAC) — fallback */
  videoMp4: string;
  /** Desktop poster / reduced-motion fallback (landscape) */
  poster: string;
  /** Mobile portrait fallback image */
  mobilePoster: string;
  description: string;
}

export const zenThemes: ZenTheme[] = [
  {
    id: "default",
    name: "Default",
    videoWebm: "",
    videoMp4: "",
    poster: "",
    mobilePoster: "",
    description: "Classic gradient background.",
  },
  // ---- Original 4 themes ----
  {
    id: "beach",
    name: "Zen Beach",
    videoWebm: "/backgrounds/video/zen-beach.webm",
    videoMp4: "/backgrounds/video/zen-beach.mp4",
    poster: "/backgrounds/img/zen-beach-poster.jpg",
    mobilePoster: "/backgrounds/img/zen-beach-mobile.jpg",
    description: "Gentle waves on a sandy shore.",
  },
  {
    id: "forest",
    name: "Zen Forest",
    videoWebm: "/backgrounds/video/zen-forest.webm",
    videoMp4: "/backgrounds/video/zen-forest.mp4",
    poster: "/backgrounds/img/zen-forest-poster.jpg",
    mobilePoster: "/backgrounds/img/zen-forest-mobile.jpg",
    description: "Peaceful moonlit forest.",
  },
  {
    id: "lake",
    name: "Zen Lake",
    videoWebm: "/backgrounds/video/zen-lake.webm",
    videoMp4: "/backgrounds/video/zen-lake.mp4",
    poster: "/backgrounds/img/zen-lake-poster.jpg",
    mobilePoster: "/backgrounds/img/zen-lake-mobile.jpg",
    description: "Still mountain lake at sunrise.",
  },
  {
    id: "rain",
    name: "Zen Rain",
    videoWebm: "/backgrounds/video/zen-rain.webm",
    videoMp4: "/backgrounds/video/zen-rain.mp4",
    poster: "/backgrounds/img/zen-rain-poster.jpg",
    mobilePoster: "/backgrounds/img/zen-rain-mobile.jpg",
    description: "Soft rain on a window pane.",
  },
  // ---- New themes ----
  {
    id: "rain-window",
    name: "Rain Window",
    videoWebm: "/backgrounds/video/rain-window.webm",
    videoMp4: "/backgrounds/video/rain-window.mp4",
    poster: "/backgrounds/img/rain-window-poster.jpg",
    mobilePoster: "/backgrounds/img/rain-window-mobile.jpg",
    description: "Night rain with droplets on glass.",
  },
  {
    id: "mountain-clouds",
    name: "Mountain Clouds",
    videoWebm: "/backgrounds/video/mountain-clouds.webm",
    videoMp4: "/backgrounds/video/mountain-clouds.mp4",
    poster: "/backgrounds/img/mountain-clouds-poster.jpg",
    mobilePoster: "/backgrounds/img/mountain-clouds-mobile.jpg",
    description: "Clouds drifting through a mountain valley.",
  },
  {
    id: "rainforest",
    name: "Rainforest",
    videoWebm: "/backgrounds/video/rainforest.webm",
    videoMp4: "/backgrounds/video/rainforest.mp4",
    poster: "/backgrounds/img/rainforest-poster.jpg",
    mobilePoster: "/backgrounds/img/rainforest-mobile.jpg",
    description: "Lush jungle canopy with gentle mist.",
  },
  {
    id: "underwater-fish",
    name: "Underwater",
    videoWebm: "/backgrounds/video/underwater-fish.webm",
    videoMp4: "/backgrounds/video/underwater-fish.mp4",
    poster: "/backgrounds/img/underwater-fish-poster.jpg",
    mobilePoster: "/backgrounds/img/underwater-fish-mobile.jpg",
    description: "Calm fish swimming with light caustics.",
  },
  // ---- Batch 3 themes ----
  {
    id: "underwater-reef",
    name: "Coral Reef",
    videoWebm: "/backgrounds/video/underwater-reef.webm",
    videoMp4: "/backgrounds/video/underwater-reef.mp4",
    poster: "/backgrounds/img/underwater-reef-poster.jpg",
    mobilePoster: "/backgrounds/img/underwater-reef-mobile.jpg",
    description: "Tropical reef with colorful fish.",
  },
  {
    id: "arctic-aurora",
    name: "Arctic Aurora",
    videoWebm: "/backgrounds/video/arctic-aurora.webm",
    videoMp4: "/backgrounds/video/arctic-aurora.mp4",
    poster: "/backgrounds/img/arctic-aurora-poster.jpg",
    mobilePoster: "/backgrounds/img/arctic-aurora-mobile.jpg",
    description: "Northern lights over arctic landscape.",
  },
  {
    id: "autumn-river",
    name: "Autumn River",
    videoWebm: "/backgrounds/video/autumn-river.webm",
    videoMp4: "/backgrounds/video/autumn-river.mp4",
    poster: "/backgrounds/img/autumn-river-poster.jpg",
    mobilePoster: "/backgrounds/img/autumn-river-mobile.jpg",
    description: "Golden autumn river flowing through trees.",
  },
  {
    id: "city-night",
    name: "City Night",
    videoWebm: "/backgrounds/video/city-night.webm",
    videoMp4: "/backgrounds/video/city-night.mp4",
    poster: "/backgrounds/img/city-night-poster.jpg",
    mobilePoster: "/backgrounds/img/city-night-mobile.jpg",
    description: "City skyline at twilight with reflections.",
  },
  {
    id: "waterfall",
    name: "Waterfall",
    videoWebm: "/backgrounds/video/waterfall.webm",
    videoMp4: "/backgrounds/video/waterfall.mp4",
    poster: "/backgrounds/img/waterfall-poster.jpg",
    mobilePoster: "/backgrounds/img/waterfall-mobile.jpg",
    description: "Majestic forest waterfall with mist.",
  },
  {
    id: "sea-cliffs",
    name: "Sea Cliffs",
    videoWebm: "/backgrounds/video/sea-cliffs.webm",
    videoMp4: "/backgrounds/video/sea-cliffs.mp4",
    poster: "/backgrounds/img/sea-cliffs-poster.jpg",
    mobilePoster: "/backgrounds/img/sea-cliffs-mobile.jpg",
    description: "Dramatic coastal cliffs shrouded in fog.",
  },
  {
    id: "lava-field",
    name: "Lava Field",
    videoWebm: "/backgrounds/video/lava-field.webm",
    videoMp4: "/backgrounds/video/lava-field.mp4",
    poster: "/backgrounds/img/lava-field-poster.jpg",
    mobilePoster: "/backgrounds/img/lava-field-mobile.jpg",
    description: "Glowing volcanic lava flows.",
  },
  {
    id: "alpine-peaks",
    name: "Alpine Peaks",
    videoWebm: "/backgrounds/video/alpine-peaks.webm",
    videoMp4: "/backgrounds/video/alpine-peaks.mp4",
    poster: "/backgrounds/img/alpine-peaks-poster.jpg",
    mobilePoster: "/backgrounds/img/alpine-peaks-mobile.jpg",
    description: "Snow-capped alpine mountain vista.",
  },
  {
    id: "desert-dunes",
    name: "Desert Dunes",
    videoWebm: "/backgrounds/video/desert-dunes.webm",
    videoMp4: "/backgrounds/video/desert-dunes.mp4",
    poster: "/backgrounds/img/desert-dunes-poster.jpg",
    mobilePoster: "/backgrounds/img/desert-dunes-mobile.jpg",
    description: "Golden desert dunes at sunset.",
  },
  // ---- Placeholder ----
  {
    id: "night",
    name: "Zen Night",
    videoWebm: "",
    videoMp4: "",
    poster: "",
    mobilePoster: "",
    description: "Starry night sky. (Coming soon)",
  },
];

export function getZenTheme(id: string): ZenTheme | undefined {
  return zenThemes.find((t) => t.id === id);
}
