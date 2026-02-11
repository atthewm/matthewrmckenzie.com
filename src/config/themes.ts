// ============================================================================
// ZEN THEMES CONFIGURATION
// ============================================================================
// Each theme has a video background, poster fallback, and optional ambient
// audio loop. Swap the placeholder files in /public/zen/ with real assets.
// ============================================================================

export interface ZenTheme {
  id: string;
  name: string;
  video: string;
  poster: string;
  audio?: string;
  description: string;
}

export const zenThemes: ZenTheme[] = [
  {
    id: "default",
    name: "Default",
    video: "",
    poster: "",
    description: "Classic gradient background with no video.",
  },
  {
    id: "forest",
    name: "Zen Forest",
    video: "/zen/forest.mp4",
    poster: "/zen/forest.jpg",
    audio: "/zen/forest.mp3",
    description: "Peaceful forest canopy with birdsong.",
  },
  {
    id: "beach",
    name: "Zen Beach",
    video: "/zen/beach.mp4",
    poster: "/zen/beach.jpg",
    audio: "/zen/beach.mp3",
    description: "Gentle waves on a sandy shore.",
  },
  {
    id: "lake",
    name: "Zen Lake",
    video: "/zen/lake.mp4",
    poster: "/zen/lake.jpg",
    audio: "/zen/lake.mp3",
    description: "Still mountain lake at sunrise.",
  },
  {
    id: "night",
    name: "Zen Night",
    video: "/zen/night.mp4",
    poster: "/zen/night.jpg",
    audio: "/zen/night.mp3",
    description: "Starry night sky with crickets.",
  },
  {
    id: "rain",
    name: "Zen Rain",
    video: "/zen/rain.mp4",
    poster: "/zen/rain.jpg",
    audio: "/zen/rain.mp3",
    description: "Soft rain on a window.",
  },
];

export function getZenTheme(id: string): ZenTheme | undefined {
  return zenThemes.find((t) => t.id === id);
}
