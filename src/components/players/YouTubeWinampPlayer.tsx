"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { youtubeConfig } from "@/config/playlists";
import { Play, Pause, SkipBack, SkipForward, List, X } from "lucide-react";

// ============================================================================
// YOUTUBE WINAMP PLAYER
// ============================================================================
// Compact Winamp-inspired player for YouTube playlists.
// Uses YouTube IFrame API. Marquee track title, transport controls,
// expandable playlist panel.
// ============================================================================

interface Track {
  title: string;
  videoId: string;
}

// Extend window for YouTube IFrame API
declare global {
  interface Window {
    YT: {
      Player: new (
        el: string | HTMLElement,
        opts: Record<string, unknown>
      ) => YTPlayer;
      PlayerState: Record<string, number>;
    };
    onYouTubeIframeAPIReady: () => void;
  }
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

export default function YouTubeWinampPlayer() {
  const tracks: Track[] = youtubeConfig.manualTracks;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const playerRef = useRef<YTPlayer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);

  // Load YouTube IFrame API
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
    // Create a child div for the player
    const el = document.createElement("div");
    el.id = "yt-winamp-player";
    containerRef.current.appendChild(el);

    playerRef.current = new window.YT.Player(el, {
      height: "1",
      width: "1",
      videoId: tracks[0]?.videoId || "",
      playerVars: {
        autoplay: 0,
        controls: 0,
        modestbranding: 1,
        rel: 0,
      },
      events: {
        onStateChange: (event: { data: number }) => {
          if (event.data === 1) {
            setIsPlaying(true);
            startTimer();
          } else if (event.data === 2 || event.data === 0) {
            setIsPlaying(false);
            stopTimer();
          }
          // Auto-next on end
          if (event.data === 0) {
            nextTrack();
          }
        },
        onReady: () => {
          updateDuration();
        },
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
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  }, [isPlaying]);

  const loadTrack = useCallback((index: number) => {
    if (!playerRef.current || !tracks[index]) return;
    setCurrentIndex(index);
    setElapsed(0);
    playerRef.current.loadVideoById(tracks[index].videoId);
  }, [tracks]);

  const nextTrack = useCallback(() => {
    const next = (currentIndex + 1) % tracks.length;
    loadTrack(next);
  }, [currentIndex, tracks.length, loadTrack]);

  const prevTrack = useCallback(() => {
    const prev = currentIndex === 0 ? tracks.length - 1 : currentIndex - 1;
    loadTrack(prev);
  }, [currentIndex, tracks.length, loadTrack]);

  function formatTime(s: number) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  }

  const currentTrack = tracks[currentIndex];

  return (
    <div className="flex flex-col h-full select-none" style={{ background: "#1e1e1e" }}>
      {/* Hidden YouTube player container */}
      <div ref={containerRef} className="hidden" />

      {/* Winamp Header */}
      <div
        className="px-2 py-1 shrink-0"
        style={{
          background: "linear-gradient(180deg, #3b3b4f 0%, #2a2a3a 100%)",
          borderBottom: "1px solid #555",
        }}
      >
        <div className="text-[9px] font-bold text-green-400 uppercase tracking-wider">
          Winamp
        </div>
      </div>

      {/* Display area */}
      <div
        className="mx-2 mt-2 rounded overflow-hidden"
        style={{
          background: "#000",
          border: "1px solid #333",
          padding: "6px 8px",
        }}
      >
        {/* Marquee title */}
        <div className="overflow-hidden whitespace-nowrap">
          <div
            className="text-[11px] font-mono text-green-400 inline-block"
            style={{
              animation: isPlaying ? "marquee 8s linear infinite" : "none",
            }}
          >
            {currentTrack?.title || "No track loaded"}
          </div>
        </div>

        {/* Time display */}
        <div className="flex items-center justify-between mt-1">
          <span className="text-[10px] font-mono text-green-300/70">
            {formatTime(elapsed)}
          </span>
          <span className="text-[10px] font-mono text-green-300/40">
            {formatTime(duration)}
          </span>
        </div>

        {/* Progress bar */}
        <div className="mt-1 h-1 bg-green-900 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-400 transition-all duration-500"
            style={{ width: duration > 0 ? `${(elapsed / duration) * 100}%` : "0%" }}
          />
        </div>
      </div>

      {/* Transport controls */}
      <div className="flex items-center justify-center gap-2 py-2 shrink-0">
        <WinampButton onClick={prevTrack} aria-label="Previous track">
          <SkipBack size={12} />
        </WinampButton>
        <WinampButton onClick={playPause} aria-label={isPlaying ? "Pause" : "Play"} primary>
          {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
        </WinampButton>
        <WinampButton onClick={nextTrack} aria-label="Next track">
          <SkipForward size={12} />
        </WinampButton>
        <div className="w-2" />
        <WinampButton
          onClick={() => setShowPlaylist(!showPlaylist)}
          aria-label="Toggle playlist"
          active={showPlaylist}
        >
          {showPlaylist ? <X size={12} /> : <List size={12} />}
        </WinampButton>
      </div>

      {/* Playlist panel */}
      {showPlaylist && (
        <div
          className="flex-1 overflow-auto mx-2 mb-2 rounded"
          style={{ background: "#111", border: "1px solid #333" }}
        >
          {tracks.map((track, i) => (
            <button
              key={i}
              onClick={() => loadTrack(i)}
              className={`
                w-full text-left px-2 py-1.5 text-[10px] font-mono border-b border-gray-800
                transition-colors
                ${i === currentIndex
                  ? "text-green-400 bg-green-400/10"
                  : "text-gray-400 hover:text-green-300 hover:bg-white/5"
                }
              `}
            >
              {i + 1}. {track.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function WinampButton({
  children, onClick, primary, active, ...props
}: {
  children: React.ReactNode;
  onClick: () => void;
  primary?: boolean;
  active?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center justify-center rounded transition-all
        ${primary ? "w-8 h-8" : "w-7 h-7"}
        ${active
          ? "bg-green-400/20 text-green-400"
          : "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white"
        }
        active:scale-90
      `}
      style={{
        border: "1px solid #555",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1), 0 1px 2px rgba(0,0,0,0.3)",
      }}
      {...props}
    >
      {children}
    </button>
  );
}
