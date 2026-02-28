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
// - Desktop: <video> with autoplay, muted, loop, playsInline
// - Mobile: static portrait image (no video to save data/battery)
// - prefers-reduced-motion: uses poster image instead of video
// - Sound toggle: muted by default, user can unmute after interaction
// - Crossfade transitions when switching themes
// ============================================================================

const SOUND_PREF_KEY = "mmck-bg-sound";

export default function ZenBackground() {
  const { settings, updateSettings } = useSettings();
  const isMobile = useIsMobile();
  const theme = getZenTheme(settings.zenThemeId);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [fadeKey, setFadeKey] = useState(settings.zenThemeId);
  const [fading, setFading] = useState(false);
  const prevThemeRef = useRef(settings.zenThemeId);

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
      const timer = setTimeout(() => {
        setFadeKey(settings.zenThemeId);
        prevThemeRef.current = settings.zenThemeId;
        setFading(false);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [settings.zenThemeId]);

  // Sync video muted state
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = !soundEnabled;
    }
  }, [soundEnabled]);

  // Sync ambient volume
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = settings.ambientVolume / 100;
    }
  }, [settings.ambientVolume]);

  // Toggle sound & persist
  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SOUND_PREF_KEY, String(next));
      } catch {
        // ignore
      }
      // Mark user interaction for autoplay policy
      if (!settings.userHasInteracted) {
        updateSettings({ userHasInteracted: true });
      }
      return next;
    });
  }, [settings.userHasInteracted, updateSettings]);

  const activeTheme = getZenTheme(fadeKey);
  const isDefault = !activeTheme || activeTheme.id === "default" || !activeTheme.video;
  const useStatic = isMobile || prefersReducedMotion || settings.reduceMotion;
  const hasAudio = !!activeTheme?.video; // videos have embedded audio

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Layer: either gradient or video/image */}
      <div
        className="absolute inset-0 transition-opacity duration-700"
        style={{ opacity: fading ? 0 : 1 }}
      >
        {isDefault ? (
          <DefaultGradient />
        ) : useStatic ? (
          /* Mobile / reduced-motion: static image */
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${isMobile && activeTheme.mobilePoster ? activeTheme.mobilePoster : activeTheme.poster})`,
            }}
            role="img"
            aria-label={`${activeTheme.name} background`}
          />
        ) : (
          /* Desktop: video loop */
          <video
            ref={videoRef}
            key={activeTheme.id}
            autoPlay
            muted
            loop
            playsInline
            poster={activeTheme.poster}
            className="absolute inset-0 w-full h-full object-cover"
            aria-label={`${activeTheme.name} ambient video background`}
          >
            <source src={activeTheme.video} type="video/mp4" />
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

      {/* Sound toggle button — only show when video theme is active on desktop */}
      {!isDefault && !useStatic && hasAudio && (
        <button
          onClick={toggleSound}
          className="absolute bottom-2 right-2 z-[10] p-1.5 rounded-full
                     bg-black/30 hover:bg-black/50 backdrop-blur-sm
                     text-white/70 hover:text-white transition-all"
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
// Default gradient (classic Mac blue/teal)
// ---------------------------------------------------------------------------

function DefaultGradient() {
  return (
    <>
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 20% 20%, rgba(140, 180, 220, 0.6) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 80%, rgba(120, 160, 190, 0.4) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, rgba(160, 195, 215, 0.3) 0%, transparent 70%),
            var(--desktop-bg)
          `,
        }}
      />
      {/* Subtle linen / noise texture overlay */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </defs>
        <rect width="100%" height="100%" filter="url(#noise)" />
      </svg>
      {/* Soft vignette edges */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.08) 100%)",
        }}
      />
    </>
  );
}
