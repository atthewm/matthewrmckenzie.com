"use client";

import React from "react";
import { appleMusicPlaylists, appleMusicEmbedUrl } from "@/config/playlists";
import { turntable, useTurntable } from "@/lib/turntableStore";

// ============================================================================
// TURNTABLE PLAYLIST (iTunes 4 brushed metal)
// ============================================================================
// The LCD status, transport buttons and the playlist list. "Put on" loads the
// chosen playlist in Apple's own embed player, which plays 30 second
// previews without signing in (full tracks for Apple Music subscribers).
// The embed is cross origin, so its play state and volume stay in Apple's
// player; "Lift needle" removes the player, which stops the sound for real.
// ============================================================================

export default function TurntablePlaylist({ compact = false }: { compact?: boolean }) {
  const { index, active } = useTurntable();
  const current = appleMusicPlaylists[index];

  return (
    <div className={`tt-library metal ${compact ? "is-compact" : ""}`}>
      <div className="tt-transport">
        <div className="tt-buttons" role="group" aria-label="Turntable controls">
          <button type="button" className="tt-round" onClick={() => turntable.previous()} aria-label="Previous playlist">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5h2v14H6zM20 5v14L9 12z" fill="currentColor" /></svg>
          </button>
          <button
            type="button"
            className={`tt-round is-main ${active ? "is-on" : ""}`}
            onClick={() => turntable.toggle()}
            aria-pressed={active}
            aria-label={active ? "Lift the needle and close the player" : `Put on ${current.title}`}
          >
            {active ? (
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h4v14H7zM13 5h4v14h-4z" fill="currentColor" /></svg>
            ) : (
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4v16l13-8z" fill="currentColor" /></svg>
            )}
          </button>
          <button type="button" className="tt-round" onClick={() => turntable.next()} aria-label="Next playlist">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 5h2v14h-2zM4 5v14l11-7z" fill="currentColor" /></svg>
          </button>
        </div>
        <div className="tt-lcd" aria-live="polite">
          <p className="tt-lcd-title">{current.title}</p>
          <p className="tt-lcd-sub">
            {active ? "On the platter. Press play in the Apple Music player below." : "Needle up. Press play to put this record on."}
          </p>
        </div>
        <a className="aqua-button" href={current.appleMusicUrl} target="_blank" rel="noopener noreferrer">
          Open in Apple Music
        </a>
      </div>

      {active && (
        <div className="tt-embed">
          <iframe
            key={current.id}
            title={`${current.title} in the Apple Music player`}
            src={appleMusicEmbedUrl(current.appleMusicUrl)}
            allow="autoplay *; encrypted-media *; clipboard-write"
            sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-top-navigation-by-user-activation"
            height={175}
            loading="lazy"
          />
          <p className="tt-note">
            Apple&apos;s player plays 30 second previews without signing in. Volume is in that player or on your device.
          </p>
        </div>
      )}

      <ol className="tt-list" aria-label="Playlists">
        {appleMusicPlaylists.map((p, i) => (
          <li key={p.id}>
            <button
              type="button"
              className="tt-row"
              aria-current={i === index ? "true" : undefined}
              onClick={() => turntable.select(i)}
              onDoubleClick={() => {
                turntable.select(i);
                turntable.setActive(true);
              }}
            >
              <span className="tt-num">{i + 1}</span>
              <span className="tt-name">{p.title}</span>
              {!compact && p.description && <span className="tt-desc">{p.description}</span>}
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
