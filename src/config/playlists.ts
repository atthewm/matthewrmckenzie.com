// ============================================================================
// MEDIA CONFIGURATION
// ============================================================================
// Configure SoundCloud, YouTube, and Apple Music sources here.
// ============================================================================

// -- SoundCloud --
// Set your profile or playlist URL for the SoundCloud widget.
export const soundcloudConfig = {
  // Use a profile URL or a specific playlist/track URL
  url: "https://soundcloud.com/matthewrmckenzie",
  // Widget options
  autoPlay: false,
  showArtwork: true,
  color: "#0071e3",
};

// -- YouTube --
// Set a playlist ID for the Winamp-style player.
// You can also provide a manual track list if you prefer not to use the API.
export const youtubeConfig = {
  // YouTube playlist ID (from the URL after list=)
  playlistId: "PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf",
  // Manual track list as fallback (used if playlist fetch is not available)
  manualTracks: [
    { title: "Track 1 - Placeholder", videoId: "dQw4w9WgXcQ" },
    { title: "Track 2 - Placeholder", videoId: "dQw4w9WgXcQ" },
    { title: "Track 3 - Placeholder", videoId: "dQw4w9WgXcQ" },
    { title: "Track 4 - Placeholder", videoId: "dQw4w9WgXcQ" },
    { title: "Track 5 - Placeholder", videoId: "dQw4w9WgXcQ" },
  ],
};

// -- Apple Music --
// List of playlists that appear as files in the Apple Music folder.
export interface AppleMusicPlaylist {
  id: string;
  title: string;
  description?: string;
  appleMusicUrl: string;
}

export const appleMusicPlaylists: AppleMusicPlaylist[] = [
  {
    id: "am-chill",
    title: "Chill Vibes",
    description: "Easy listening for focus and relaxation.",
    appleMusicUrl: "https://music.apple.com/us/playlist/chill-vibes/pl.2b0e6e332fdf4b7a91164da3162127b5",
  },
  {
    id: "am-workout",
    title: "Workout",
    description: "High energy tracks for the gym.",
    appleMusicUrl: "https://music.apple.com/us/playlist/workout-motivation/pl.87bb5b36a9bd49b48e12dbe2e5a8f4ae",
  },
  {
    id: "am-focus",
    title: "Deep Focus",
    description: "Instrumental and ambient for deep work.",
    appleMusicUrl: "https://music.apple.com/us/playlist/pure-focus/pl.da83ab16a7ce4267b0e4eda45c788e69",
  },
  {
    id: "am-classics",
    title: "All Time Favorites",
    description: "The songs that never get old.",
    appleMusicUrl: "https://music.apple.com/us/playlist/a-list-pop/pl.5ee8333dbe944d9f9151e97d92d1ead9",
  },
];
