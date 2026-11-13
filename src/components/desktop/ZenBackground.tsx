"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { useSettings } from "@/hooks/useSettingsStore";
import { getZenTheme } from "@/config/themes";
import { useIsMobile } from "@/hooks/useIsMobile";
import { Volume2, VolumeX } from "lucide-react";

// ============================================================================
// ZEN BACKGROUND
// ============================================================================
// Renders either a classic gradient (default) or an ambient video loop.
// - Desktop: <video> with WebM (VP9) primary + MP4 fallback
// - Mobile: static portrait image (no video to save data/battery)
// - prefers-reduced-motion: uses poster image instead of video
// - Sound toggle: muted by default, user can unmute after interaction
// - Crossfade transitions when switching themes
// - Only one audio source plays at a time (keyed by theme id)
// ============================================================================

const SOUND_PREF_KEY = "mmck-bg-sound";

export default function ZenBackground() {
  const { settings, updateSettings } = useSettings();
  const isMobile = useIsMobile();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [fadeKey, setFadeKey] = useState(settings.zenThemeId);
  const [fading, setFading] = useState(false);
  const prevThemeRef = useRef(settings.zenThemeId);
  const [videoError, setVideoError] = useState(false);

  // Detect prefers-reduced-motion
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Load sound preference from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem(SOUND_PREF_KEY);
      if (saved === "true") setSoundEnabled(true);
    } catch {
      // ignore
    }
  }, []);

  // Crossfade when theme changes
  useEffect(() => {
    if (prevThemeRef.current !== settings.zenThemeId) {
      setFading(true);
      setVideoError(false);
      const timer = setTimeout(() => {
        setFadeKey(settings.zenThemeId);
        prevThemeRef.current = settings.zenThemeId;
        setFading(false);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [settings.zenThemeId]);

  // Sync video muted state & ensure only one audio source plays
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = !soundEnabled;
    }
  }, [soundEnabled, fadeKey]);

  // Sync ambient volume
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = settings.ambientVolume / 100;
    }
  }, [settings.ambientVolume, fadeKey]);

  // Toggle sound & persist
  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SOUND_PREF_KEY, String(next));
      } catch {
        // ignore
      }
      if (!settings.userHasInteracted) {
        updateSettings({ userHasInteracted: true });
      }
      return next;
    });
  }, [settings.userHasInteracted, updateSettings]);

  const activeTheme = getZenTheme(fadeKey);
  const isDefault =
    !activeTheme ||
    activeTheme.id === "default" ||
    (!activeTheme.videoWebm && !activeTheme.videoMp4);
  const useStatic = isMobile || prefersReducedMotion || settings.reduceMotion;
  const hasVideo = !!activeTheme?.videoWebm || !!activeTheme?.videoMp4;

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Layer: either gradient or video/image */}
      <div
        className="absolute inset-0 transition-opacity duration-700"
        style={{ opacity: fading ? 0 : 1 }}
      >
        {isDefault ? (
          <DefaultGradient />
        ) : useStatic || videoError ? (
          /* Mobile / reduced-motion / video-error: static image */
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${
                isMobile && activeTheme!.mobilePoster
                  ? activeTheme!.mobilePoster
                  : activeTheme!.poster
              })`,
            }}
            role="img"
            aria-label={`${activeTheme!.name} background`}
          />
        ) : (
          /* Desktop: video loop with WebM primary + MP4 fallback */
          <video
            ref={videoRef}
            key={activeTheme!.id}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={activeTheme!.poster}
            className="absolute inset-0 w-full h-full object-cover"
            aria-label={`${activeTheme!.name} ambient video background`}
            onError={() => setVideoError(true)}
          >
            {activeTheme!.videoWebm && (
              <source src={activeTheme!.videoWebm} type="video/webm" />
            )}
            {activeTheme!.videoMp4 && (
              <source src={activeTheme!.videoMp4} type="video/mp4" />
            )}
          </video>
        )}
      </div>

      {/* Dim overlay */}
      {settings.backgroundDim > 0 && (
        <div
          className="absolute inset-0 bg-black transition-opacity duration-500"
          style={{ opacity: settings.backgroundDim / 100 }}
        />
      )}

      {/* Blur overlay */}
      {settings.backgroundBlur > 0 && (
        <div
          className="absolute inset-0 transition-all duration-500"
          style={{ backdropFilter: `blur(${settings.backgroundBlur}px)` }}
        />
      )}

      {/* Sound toggle: only show when video theme is active on desktop */}
      {!isDefault && !useStatic && hasVideo && !videoError && (
        <button
          onClick={toggleSound}
          className="absolute bottom-2 right-2 z-10 p-1.5 rounded-full
                     bg-black/30 hover:bg-black/50 backdrop-blur-sm
                     text-white/70 hover:text-white transition-all
                     focus:outline-none focus:ring-2 focus:ring-white/50"
          aria-label={soundEnabled ? "Mute background audio" : "Unmute background audio"}
          title={soundEnabled ? "Mute" : "Unmute"}
        >
          {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Default wallpaper: the blue Panther desktop by day, the same shapes under a
// navy sky at night. Built from token gradients and two SVG light ribbons.
// The oversized layer drifts very slowly (see .wallpaper-drift).
// ---------------------------------------------------------------------------

function DefaultGradient() {
  return (
    <div className="absolute inset-[-6%] wallpaper-drift" aria-hidden="true">
      <div className="absolute inset-0" style={{ background: "var(--wallpaper)" }} />
      <div className="absolute inset-0" style={{ background: "var(--wallpaper-streaks)" }} />
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="wp-ribbon-a" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="var(--wallpaper-ribbon)" stopOpacity="0" />
            <stop offset="0.45" stopColor="var(--wallpaper-ribbon)" stopOpacity="0.32" />
            <stop offset="1" stopColor="var(--wallpaper-ribbon)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="wp-ribbon-b" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="var(--wallpaper-ribbon)" stopOpacity="0" />
            <stop offset="0.6" stopColor="var(--wallpaper-ribbon)" stopOpacity="0.2" />
            <stop offset="1" stopColor="var(--wallpaper-ribbon)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d="M-100 620 C 300 420, 700 760, 1100 520 S 1600 380, 1750 470 L 1750 560 C 1500 470, 1300 640, 1000 640 S 400 560, -100 720 Z" fill="url(#wp-ribbon-a)" />
        <path d="M-100 700 C 400 560, 800 860, 1200 650 S 1600 560, 1750 600 L 1750 640 C 1450 620, 1250 760, 950 760 S 300 680, -100 760 Z" fill="url(#wp-ribbon-b)" />
      </svg>
    </div>
  );
}
