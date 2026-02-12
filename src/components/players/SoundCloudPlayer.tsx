"use client";

import React, { useRef } from "react";
import { soundcloudConfig } from "@/config/playlists";

export default function SoundCloudPlayer() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const colorHex = soundcloudConfig.color.replace("#", "");
  const embedUrl = `https://w.soundcloud.com/player/?url=${encodeURIComponent(
    soundcloudConfig.url
  )}&color=%23${colorHex}&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=true`;

  return (
    <div className="flex flex-col h-full bg-[#1a1a1a]">
      <div className="shrink-0 flex items-center justify-center py-2 px-3" style={{ background: "linear-gradient(180deg, #3a3a3a 0%, #2a2a2a 50%, #222 100%)", borderBottom: "1px solid #111" }}>
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">SoundCloud</span>
      </div>
      <div className="flex-1 relative">
        <iframe ref={iframeRef} width="100%" height="100%" scrolling="no" frameBorder="no" allow="autoplay" src={embedUrl} className="absolute inset-0" title="SoundCloud Player" />
      </div>
      <div className="shrink-0 flex items-center justify-center py-1.5" style={{ background: "linear-gradient(180deg, #333 0%, #222 100%)", borderTop: "1px solid #444" }}>
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-500/60" />
          <span className="text-[9px] text-gray-500">QuickTime Player</span>
          <div className="w-2 h-2 rounded-full bg-green-500/60" />
        </div>
      </div>
    </div>
  );
}
