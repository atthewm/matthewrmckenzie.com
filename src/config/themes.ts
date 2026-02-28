// ============================================================================
// ZEN THEMES CONFIGURATION
// ============================================================================
// Each theme defines a video background with poster fallback, mobile portrait
// image, and optional ambient audio loop. Assets live in /public/backgrounds/.
// ============================================================================

export interface ZenTheme {
  id: string;
  name: string;
  /** Desktop video loop (empty string = no video, use gradient) */
  video: string;
  /** Desktop poster / reduced-motion fallback (landscape) */
  poster: string;
  /** Mobile portrait fallback image */
  mobilePoster: string;
  /** Optional ambient audio loop */
  audio?: string;
  description: string;
}

export const zenThemes: ZenTheme[] = [
  {
    id: "default",
    name: "Default",
    video: "",
    poster: "",
    mobilePoster: "",
    description: "Classic gradient background.",
  },
  {
    id: "beach",
    name: "Zen Beach",
    video: "/backgrounds/video/zen-beach.mp4",
    poster: "/backgrounds/img/zen-beach-poster.jpg",
    mobilePoster: "/backgrounds/img/zen-beach-mobile.jpg",
    description: "Gentle waves on a sandy shore.",
  },
  {
    id: "forest",
    name: "Zen Forest",
    video: "/backgrounds/video/zen-forest.mp4",
    poster: "/backgrounds/img/zen-forest-poster.jpg",
    mobilePoster: "/backgrounds/img/zen-forest-mobile.jpg",
    description: "Peaceful moonlit forest.",
  },
  {
    id: "lake",
    name: "Zen Lake",
    video: "/backgrounds/video/zen-lake.mp4",
    poster: "/backgrounds/img/zen-lake-poster.jpg",
    mobilePoster: "/backgrounds/img/zen-lake-mobile.jpg",
    description: "Still mountain lake at sunrise.",
  },
  {
    id: "rain",
    name: "Zen Rain",
    video: "/backgrounds/video/zen-rain.mp4",
    poster: "/backgrounds/img/zen-rain-poster.jpg",
    mobilePoster: "/backgrounds/img/zen-rain-mobile.jpg",
    description: "Soft rain on a window.",
  },
  {
    id: "night",
    name: "Zen Night",
    video: "",
    poster: "",
    mobilePoster: "",
    description: "Starry night sky. (Coming soon)",
  },
];

export function getZenTheme(id: string): ZenTheme | undefined {
  return zenThemes.find((t) => t.id === id);
}
