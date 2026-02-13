"use client";

import React, { useRef } from "react";
import { soundcloudConfig } from "@/config/playlists";
import { Volume2 } from "lucide-react";

// ============================================================================
// SOUNDCLOUD PLAYER (ryOS QuickTime-Inspired)
// ============================================================================

export default function SoundCloudPlayer() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const colorHex = soundcloudConfig.color.replace("#", "");
  const embedUrl = `https://w.soundcloud.com/player/?url=${encodeURIComponent(
    soundcloudConfig.url
  )}&color=%23${colorHex}&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=true`;

  return (
    <div className="flex flex-col h-full" style={{ background: "#1c1c1e" }}>
      {/* Toolbar */}
      <div
        className="shrink-0 h-[28px] flex items-center justify-center px-3"
        style={{
          background: "linear-gradient(180deg, #3a3a3e 0%, #2a2a2e 100%)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <Volume2 size={11} className="text-gray-500 mr-1.5" />
        <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
          SoundCloud
        </span>
      </div>

      {/* Embedded player */}
      <div className="flex-1 relative">
        <iframe
          ref={iframeRef}
          width="100%"
          height="100%"
          scrolling="no"
          frameBorder="no"
          allow="autoplay"
          src={embedUrl}
          className="absolute inset-0"
          title="SoundCloud Player"
        />
      </div>

      {/* Footer */}
      <div
        className="shrink-0 h-[22px] flex items-center justify-center"
        style={{
          background: "linear-gradient(180deg, #2e2e32 0%, #222226 100%)",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500/50" />
          <span className="text-[9px] text-gray-600">QuickTime Player</span>
        </div>
      </div>
    </div>
  );
}
