"use client";

import React from "react";
import { Music, ExternalLink } from "lucide-react";
import { appleMusicPlaylists } from "@/config/playlists";

// ============================================================================
// APPLE MUSIC FOLDER
// ============================================================================
// Shows playlist files in a Finder-style list view. Each item opens the
// Apple Music link in a new tab on double-click.
// ============================================================================

export default function AppleMusicFolder() {
  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div
        className="flex items-center px-3 py-1.5 shrink-0 border-b"
        style={{
          background: "linear-gradient(180deg, #f8f8f8 0%, #e8e8e8 100%)",
          borderColor: "#ccc",
        }}
      >
        <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
          Apple Music Playlists
        </span>
        <span className="text-[10px] text-gray-400 ml-auto">
          {appleMusicPlaylists.length} items
        </span>
      </div>

      {/* List header */}
      <div
        className="flex items-center px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-gray-400 border-b shrink-0"
        style={{ borderColor: "#ddd", background: "#fafafa" }}
      >
        <span className="flex-1">Name</span>
        <span className="w-24 text-right">Kind</span>
      </div>

      {/* Playlist items */}
      <div className="flex-1 overflow-auto">
        {appleMusicPlaylists.map((playlist) => (
          <button
            key={playlist.id}
            onDoubleClick={() => {
              window.open(playlist.appleMusicUrl, "_blank", "noopener,noreferrer");
            }}
            className="w-full flex items-center px-3 py-2 text-left border-b border-gray-100
                       hover:bg-blue-50 active:bg-blue-100 transition-colors group"
          >
            <div className="w-7 h-7 rounded bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center mr-3 shrink-0"
                 style={{
                   boxShadow: "inset 0 1px 1px rgba(255,255,255,0.3), 0 2px 4px rgba(0,0,0,0.2)",
                 }}>
              <Music size={14} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-gray-800 truncate">
                {playlist.title}
              </div>
              {playlist.description && (
                <div className="text-[10px] text-gray-400 truncate">
                  {playlist.description}
                </div>
              )}
            </div>
            <div className="w-24 text-right flex items-center justify-end gap-1">
              <span className="text-[10px] text-gray-400">Playlist</span>
              <ExternalLink size={10} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="shrink-0 px-3 py-1.5 text-[9px] text-gray-400 border-t" style={{ borderColor: "#ddd", background: "#fafafa" }}>
        Double-click a playlist to open in Apple Music
      </div>
    </div>
  );
}
