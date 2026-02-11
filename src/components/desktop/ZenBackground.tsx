"use client";

import React, { useRef, useEffect, useState } from "react";
import { useSettings } from "@/hooks/useSettingsStore";
import { getZenTheme } from "@/config/themes";

// ============================================================================
// ZEN BACKGROUND
// ============================================================================
// Manages video background, poster fallback, ambient audio, and dim/blur
// overlays. Respects reduce-motion and autoplay policies.
// ============================================================================

export default function ZenBackground() {
  const { settings } = useSettings();
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);

  const theme = getZenTheme(settings.zenThemeId);
  const isZen = settings.zenModeEnabled && theme && theme.id !== "default";
  const showVideo = isZen && !settings.reduceMotion && theme?.video;

  // Handle video playback
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    if (showVideo && theme?.video) {
      vid.src = theme.video;
      vid.poster = theme.poster || "";
      vid.load();
      vid.play().catch(() => {
        // Autoplay blocked, that is fine
      });
      setVideoLoaded(false);
    } else {
      vid.pause();
      vid.src = "";
    }
  }, [showVideo, theme?.video, theme?.poster]);

  // Handle ambient audio
  useEffect(() => {
    const aud = audioRef.current;
    if (!aud) return;

    if (
      isZen &&
      theme?.audio &&
      settings.ambientSoundEnabled &&
      settings.userHasInteracted
    ) {
      if (aud.src !== window.location.origin + theme.audio) {
        aud.src = theme.audio;
        aud.load();
      }
      aud.volume = settings.ambientVolume / 100;
      aud.play().catch(() => {
        // Autoplay blocked
      });
    } else {
      aud.pause();
    }
  }, [
    isZen,
    theme?.audio,
    settings.ambientSoundEnabled,
    settings.ambientVolume,
    settings.userHasInteracted,
  ]);

  // Default gradient background
  const defaultBg = (
    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950">
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 rounded-full bg-purple-500/10 blur-3xl" />
    </div>
  );

  return (
    <div className="absolute inset-0">
      {/* Default gradient (always rendered as base) */}
      {defaultBg}

      {/* Zen poster image (shown when video is loading or reduce-motion is on) */}
      {isZen && theme?.poster && (
        <div
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
          style={{
            backgroundImage: `url(${theme.poster})`,
            opacity: showVideo && videoLoaded ? 0 : 1,
          }}
        />
      )}

      {/* Zen video background */}
      {showVideo && (
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
          style={{ opacity: videoLoaded ? 1 : 0 }}
          muted
          loop
          playsInline
          onCanPlay={() => setVideoLoaded(true)}
        />
      )}

      {/* Ambient audio */}
      <audio ref={audioRef} loop preload="none" />

      {/* Dim overlay */}
      {settings.backgroundDim > 0 && (
        <div
          className="absolute inset-0 bg-black transition-opacity duration-500"
          style={{ opacity: settings.backgroundDim / 100 }}
        />
      )}

      {/* Blur overlay (applied via backdrop-filter on a covering div) */}
      {settings.backgroundBlur > 0 && (
        <div
          className="absolute inset-0 transition-all duration-500"
          style={{ backdropFilter: `blur(${settings.backgroundBlur}px)` }}
        />
      )}
    </div>
  );
}
