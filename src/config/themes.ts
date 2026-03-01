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
