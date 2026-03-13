"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";

// ============================================================================
// PHOTO BOOTH APP
// ============================================================================
// Classic Mac Photo Booth: webcam feed with retro effects and snapshot capture.
// Effects are applied via CSS filters and canvas manipulation.
// ============================================================================

type Effect = "none" | "sepia" | "noir" | "thermal" | "comic" | "mirror" | "vintage" | "x-ray";

const effects: { id: Effect; label: string }[] = [
  { id: "none", label: "Normal" },
  { id: "sepia", label: "Sepia" },
  { id: "noir", label: "Noir" },
  { id: "thermal", label: "Thermal" },
  { id: "comic", label: "Pop Art" },
  { id: "mirror", label: "Mirror" },
  { id: "vintage", label: "Vintage" },
  { id: "x-ray", label: "X-Ray" },
];

function getFilterCSS(effect: Effect): string {
  switch (effect) {
    case "sepia":
      return "sepia(1) saturate(1.2)";
    case "noir":
      return "grayscale(1) contrast(1.4) brightness(0.9)";
    case "thermal":
      return "hue-rotate(180deg) saturate(3) contrast(1.5)";
    case "comic":
      return "saturate(2.5) contrast(1.8) brightness(1.1)";
    case "vintage":
      return "sepia(0.4) saturate(0.8) contrast(1.1) brightness(0.95)";
    case "x-ray":
      return "invert(1) hue-rotate(90deg)";
    default:
      return "none";
  }
}

interface Snapshot {
  dataUrl: string;
  effect: Effect;
  timestamp: number;
}

export default function PhotoBoothApp() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [activeEffect, setActiveEffect] = useState<Effect>("none");
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [cameraReady, setCameraReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [flash, setFlash] = useState(false);
  const [viewingSnapshot, setViewingSnapshot] = useState<number | null>(null);

  // Start camera
  useEffect(() => {
    let cancelled = false;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            setCameraReady(true);
          };
        }
      } catch {
        if (!cancelled) setError("Camera access denied. Allow camera permission to use Photo Booth.");
      }
    }

    startCamera();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // Take photo with countdown
  const takePhoto = useCallback(() => {
    if (!cameraReady || countdown !== null) return;

    // 3-second countdown
    let count = 3;
    setCountdown(count);

    const interval = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdown(count);
      } else {
        clearInterval(interval);
        setCountdown(null);

        // Flash effect
        setFlash(true);
        setTimeout(() => setFlash(false), 200);

        // Capture frame
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Mirror for selfie
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);

        // Apply CSS filter equivalent
        ctx.filter = getFilterCSS(activeEffect);
        ctx.drawImage(video, 0, 0);

        const dataUrl = canvas.toDataURL("image/png");
        setSnapshots((prev) => [
          ...prev,
          { dataUrl, effect: activeEffect, timestamp: Date.now() },
        ]);
      }
    }, 1000);
  }, [cameraReady, countdown, activeEffect]);

  // Download snapshot
  const downloadSnapshot = useCallback((snapshot: Snapshot) => {
    const a = document.createElement("a");
    a.href = snapshot.dataUrl;
    a.download = `photobooth-${new Date(snapshot.timestamp).toISOString().slice(0, 19).replace(/:/g, "-")}.png`;
    a.click();
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="text-4xl mb-4">📷</div>
        <p className="text-sm text-desktop-text">{error}</p>
        <p className="text-xs text-desktop-text-secondary mt-2">
          Check your browser&apos;s camera permissions and try again.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-black">
      {/* Viewfinder */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden" style={{ minHeight: 0 }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: "cover",
            transform: activeEffect === "mirror" ? "scaleX(1)" : "scaleX(-1)",
            filter: getFilterCSS(activeEffect),
          }}
        />

        {/* Countdown overlay */}
        {countdown !== null && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.3)" }}
          >
            <span
              style={{
                fontSize: "96px",
                fontWeight: 800,
                color: "white",
                textShadow: "0 4px 20px rgba(0,0,0,0.5)",
                fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
              }}
            >
              {countdown}
            </span>
          </div>
        )}

        {/* Flash */}
        {flash && (
          <div
            className="absolute inset-0"
            style={{
              background: "white",
              animation: "fadeOut 0.2s ease forwards",
            }}
          />
        )}

        {/* Snapshot viewer overlay */}
        {viewingSnapshot !== null && snapshots[viewingSnapshot] && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-black cursor-pointer"
            onClick={() => setViewingSnapshot(null)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={snapshots[viewingSnapshot].dataUrl}
              alt="Snapshot"
              style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
            />
            <div className="absolute bottom-4 left-0 right-0 text-center">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  downloadSnapshot(snapshots[viewingSnapshot!]);
                }}
                className="px-4 py-1.5 rounded-full text-xs font-medium text-white"
                style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)" }}
              >
                Save Photo
              </button>
            </div>
          </div>
        )}

        {/* Camera loading indicator */}
        {!cameraReady && !error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-white text-sm animate-pulse">Starting camera...</p>
          </div>
        )}
      </div>

      {/* Effects bar */}
      <div
        className="shrink-0 flex gap-1 px-3 py-2 overflow-x-auto"
        style={{ background: "rgba(30,30,30,0.95)" }}
      >
        {effects.map((fx) => (
          <button
            key={fx.id}
            onClick={() => setActiveEffect(fx.id)}
            className="shrink-0 px-2.5 py-1 rounded text-[10px] font-medium transition-all"
            style={{
              background: activeEffect === fx.id ? "rgba(255,255,255,0.2)" : "transparent",
              color: activeEffect === fx.id ? "white" : "rgba(255,255,255,0.6)",
              border: activeEffect === fx.id ? "1px solid rgba(255,255,255,0.3)" : "1px solid transparent",
            }}
          >
            {fx.label}
          </button>
        ))}
      </div>

      {/* Controls bar */}
      <div
        className="shrink-0 flex items-center justify-between px-4 py-3"
        style={{ background: "rgba(20,20,20,0.95)" }}
      >
        {/* Snapshot strip */}
        <div className="flex gap-1.5 overflow-x-auto" style={{ maxWidth: "calc(100% - 80px)" }}>
          {snapshots.length === 0 && (
            <span className="text-[10px] text-gray-500 self-center">No photos yet</span>
          )}
          {snapshots.map((snap, i) => (
            <button
              key={snap.timestamp}
              onClick={() => setViewingSnapshot(i)}
              className="shrink-0 rounded overflow-hidden border transition-transform hover:scale-110"
              style={{
                width: 40,
                height: 40,
                borderColor: "rgba(255,255,255,0.2)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={snap.dataUrl}
                alt={`Photo ${i + 1}`}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </button>
          ))}
        </div>

        {/* Shutter button */}
        <button
          onClick={takePhoto}
          disabled={!cameraReady || countdown !== null}
          className="shrink-0 rounded-full transition-transform active:scale-90 disabled:opacity-40"
          style={{
            width: 48,
            height: 48,
            background: "radial-gradient(circle, #ff3b30 40%, #cc2d25 100%)",
            border: "3px solid rgba(255,255,255,0.8)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
          }}
          aria-label="Take photo"
        />
      </div>

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />

      <style jsx>{`
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
