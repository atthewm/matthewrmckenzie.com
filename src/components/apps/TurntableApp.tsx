"use client";

import TurntableDeck from "./turntable/TurntableDeck";
import TurntablePlaylist from "./turntable/TurntablePlaylist";

// ============================================================================
// TURNTABLE
// ============================================================================
// My Apple Music playlists on a turntable: the deck on top, the iTunes 4
// style playlist below. The Duo layout renders the two halves on separate
// screens (see components/duo).
// ============================================================================

export default function TurntableApp() {
  return (
    <div className="tt-app">
      <TurntableDeck />
      <TurntablePlaylist />
    </div>
  );
}
