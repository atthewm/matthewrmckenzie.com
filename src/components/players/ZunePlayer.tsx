"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { youtubeConfig } from "@/config/playlists";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";

// ============================================================================
// ZUNE PLAYER
// ============================================================================
// Zune-inspired music player: Metro typography, oversized word-mark bleeding
// off the left edge, black canvas, single hot accent. Same YouTube IFrame
// playback engine as the previous Winamp skin, new face.
// ============================================================================

interface Track {
  title: string;
  videoId: string;
}

interface YTPlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  getPlayerState: () => number;
  loadVideoById: (id: string) => void;
  destroy: () => void;
}

const ZUNE_ORANGE = "#F2670E";

/** Split "Artist - Title" into its two halves for the Metro-style stack. */
function splitTrack(title: string): { artist: string; name: string } {
  const parts = title.split(/\s+[-–—]\s+/);
  if (parts.length >= 2) {
    return { artist: parts[0], name: parts.slice(1).join(" - ") };
  }
  return { artist: "Unknown Artist", name: title };
}

export default function ZunePlayer() {
  const tracks: Track[] = youtubeConfig.manualTracks;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(0);
  const playerRef = useRef<YTPlayer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.YT) {
      initPlayer();
      return;
    }
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
    window.onYouTubeIframeAPIReady = initPlayer;

    return () => {
      if (playerRef.current) playerRef.current.destroy();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  function initPlayer() {
    if (!containerRef.current || playerRef.current) return;
    const el = document.createElement("div");
    el.id = "yt-zune-player";
    containerRef.current.appendChild(el);

    playerRef.current = new window.YT.Player(el, {
      height: "1",
      width: "1",
      videoId: tracks[0]?.videoId || "",
      playerVars: { autoplay: 0, controls: 0, modestbranding: 1, rel: 0 },
      events: {
        onStateChange: (event: { data: number }) => {
          if (event.data === 1) {
            setIsPlaying(true);
            startTimer();
          } else if (event.data === 2 || event.data === 0) {
            setIsPlaying(false);
            stopTimer();
          }
          if (event.data === 0) nextTrack();
        },
        onReady: () => updateDuration(),
      },
    } as Record<string, unknown>);
  }

  function startTimer() {
    stopTimer();
    timerRef.current = setInterval(() => {
      if (playerRef.current) {
        setElapsed(Math.floor(playerRef.current.getCurrentTime()));
        setDuration(Math.floor(playerRef.current.getDuration()));
      }
    }, 500);
  }

  function stopTimer() {
    if (timerRef.current) clearInterval(timerRef.current);
  }

  function updateDuration() {
    if (playerRef.current) {
      setDuration(Math.floor(playerRef.current.getDuration()));
    }
  }

  const playPause = useCallback(() => {
    if (!playerRef.current) return;
    if (isPlaying) playerRef.current.pauseVideo();
    else playerRef.current.playVideo();
  }, [isPlaying]);

  const loadTrack = useCallback(
    (index: number) => {
      if (!playerRef.current || !tracks[index]) return;
      setCurrentIndex(index);
      setElapsed(0);
      playerRef.current.loadVideoById(tracks[index].videoId);
    },
    [tracks]
  );

  const nextTrack = useCallback(() => {
    loadTrack((currentIndex + 1) % tracks.length);
  }, [currentIndex, tracks.length, loadTrack]);

  const prevTrack = useCallback(() => {
    loadTrack(currentIndex === 0 ? tracks.length - 1 : currentIndex - 1);
  }, [currentIndex, tracks.length, loadTrack]);

  // Keep the active row in view as tracks advance.
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>('[data-active="true"]');
    el?.scrollIntoView({ block: "nearest" });
  }, [currentIndex]);

  function formatTime(s: number) {
    if (!Number.isFinite(s) || s < 0) return "0:00";
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  }

  const currentTrack = tracks[currentIndex];
  const { artist, name } = splitTrack(currentTrack?.title || "Nothing playing");
  const progress = duration > 0 ? (elapsed / duration) * 100 : 0;

  return (
    <div
      className="relative flex flex-col h-full select-none overflow-hidden"
      style={{ background: "#000", color: "#fff" }}
    >
      <div ref={containerRef} className="hidden" />

      {/* Oversized wordmark bleeding off the left edge — the Zune signature */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute select-none"
        style={{
          top: 4,
          left: -14,
          fontSize: 68,
          lineHeight: 0.9,
          fontWeight: 300,
          letterSpacing: "-0.04em",
          color: "rgba(255,255,255,0.07)",
          whiteSpace: "nowrap",
        }}
      >
        zune
      </div>

      {/* Header */}
      <div className="relative shrink-0 px-4 pt-3">
        <span
          className="text-[10px] uppercase"
          style={{ letterSpacing: "0.3em", color: ZUNE_ORANGE, fontWeight: 600 }}
        >
          now playing
        </span>
      </div>

      {/* Now playing block */}
      <div className="relative shrink-0 px-4 pt-6 pb-4">
        <div
          className="truncate"
          style={{
            fontSize: 26,
            fontWeight: 200,
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
          }}
          title={name}
        >
          {name}
        </div>
        <div
          className="truncate mt-1.5"
          style={{ fontSize: 13, fontWeight: 300, color: "rgba(255,255,255,0.55)" }}
          title={artist}
        >
          {artist}
        </div>

        {/* Progress */}
        <div className="mt-4">
          <div style={{ height: 2, background: "rgba(255,255,255,0.14)" }}>
            <div
              style={{
                height: "100%",
                width: `${progress}%`,
                background: ZUNE_ORANGE,
                transition: "width 0.5s linear",
              }}
            />
          </div>
          <div className="flex items-center justify-between mt-1.5">
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>
              {formatTime(elapsed)}
            </span>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Transport */}
        <div className="flex items-center gap-5 mt-4">
          <ZuneControl onClick={prevTrack} label="Previous track">
            <SkipBack size={16} />
          </ZuneControl>
          <button
            onClick={playPause}
            aria-label={isPlaying ? "Pause" : "Play"}
            className="flex items-center justify-center rounded-full transition-transform active:scale-95"
            style={{ width: 46, height: 46, background: ZUNE_ORANGE, color: "#000" }}
          >
            {isPlaying ? <Pause size={19} /> : <Play size={19} className="ml-0.5" />}
          </button>
          <ZuneControl onClick={nextTrack} label="Next track">
            <SkipForward size={16} />
          </ZuneControl>
        </div>
      </div>

      {/* Track list */}
      <div className="relative flex-1 min-h-0 flex flex-col">
        <div
          className="px-4 pb-1.5 shrink-0 text-[10px] uppercase"
          style={{ letterSpacing: "0.24em", color: "rgba(255,255,255,0.32)" }}
        >
          {tracks.length} tracks
        </div>
        <div ref={listRef} className="flex-1 overflow-auto">
          {tracks.map((track, i) => {
            const active = i === currentIndex;
            const parts = splitTrack(track.title);
            return (
              <button
                key={`${track.videoId}-${i}`}
                data-active={active}
                onClick={() => loadTrack(i)}
                className="w-full text-left px-4 py-2 flex items-baseline gap-3 transition-colors"
                style={{
                  background: active ? "rgba(242,103,14,0.12)" : "transparent",
                  borderLeft: active
                    ? `2px solid ${ZUNE_ORANGE}`
                    : "2px solid transparent",
                }}
              >
                <span
                  style={{
                    fontSize: 10,
                    width: 20,
                    flexShrink: 0,
                    color: active ? ZUNE_ORANGE : "rgba(255,255,255,0.28)",
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className="block truncate"
                    style={{
                      fontSize: 12.5,
                      fontWeight: 300,
                      color: active ? "#fff" : "rgba(255,255,255,0.78)",
                    }}
                  >
                    {parts.name}
                  </span>
                  <span
                    className="block truncate"
                    style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}
                  >
                    {parts.artist}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ZuneControl({
  children,
  onClick,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="flex items-center justify-center transition-opacity active:scale-90"
      style={{ color: "rgba(255,255,255,0.7)", width: 30, height: 30 }}
    >
      {children}
    </button>
  );
}
