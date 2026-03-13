"use client";

import React, { useEffect, useRef, useCallback, useState } from "react";
import { useIdleTimer } from "@/hooks/useIdleTimer";
import { useSettings } from "@/hooks/useSettingsStore";
import FlurryScreensaver from "./FlurryScreensaver";

// ---------------------------------------------------------------------------
// Screensaver Manager
//
// Supports multiple screensaver types:
//   • Flying Toasters — After Dark (1989) recreation (canvas + sprites)
//   • Flurry — Mac OS X default screensaver (canvas particle system)
//   • None — disabled
//
// Type and idle timeout are controlled via Settings.
// Activates after user-configured idle timeout. Dismissed by any input.
// ---------------------------------------------------------------------------

const TOASTER_SIZE = 64;
const TOAST_SIZE = 48;
const CLOUD_SIZE = 180;
const SPRITE_FRAME_INTERVAL = 150; // ms per wing-flap frame
const NUM_TOASTERS = 8;
const NUM_TOASTS = 5;
const NUM_CLOUDS = 4;

interface Sprite {
  x: number;
  y: number;
  speed: number;
  frame: number;
  lastFrameTime: number;
  size: number;
  opacity: number;
}

// Preload images helper
function preloadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export default function Screensaver() {
  const { settings } = useSettings();
  const timeoutMs = settings.screensaverTimeout * 60 * 1000;
  const screensaverType = settings.screensaverType;

  const { idle, dismiss } = useIdleTimer(
    screensaverType === "none" ? Infinity : timeoutMs
  );

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const imagesRef = useRef<{
    toasters: HTMLImageElement[];
    toast: HTMLImageElement | null;
    cloud: HTMLImageElement | null;
  }>({ toasters: [], toast: null, cloud: null });
  const spritesRef = useRef<{
    toasters: Sprite[];
    toasts: Sprite[];
    clouds: Sprite[];
  }>({ toasters: [], toasts: [], clouds: [] });
  const [loaded, setLoaded] = useState(false);
  const [fadingIn, setFadingIn] = useState(false);
  const [visible, setVisible] = useState(false);

  // ---- Preload Flying Toasters images when needed ----
  useEffect(() => {
    if (screensaverType !== "flying-toasters") return;
    let cancelled = false;
    Promise.all([
      preloadImage("/screensaver/toaster-sprite-1.png"),
      preloadImage("/screensaver/toaster-sprite-2.png"),
      preloadImage("/screensaver/toaster-sprite-3.png"),
      preloadImage("/screensaver/toaster-sprite-4.png"),
      preloadImage("/screensaver/toast1.gif"),
      preloadImage("/screensaver/cloud.png"),
    ]).then(([t1, t2, t3, t4, toast, cloud]) => {
      if (cancelled) return;
      imagesRef.current = { toasters: [t1, t2, t3, t4], toast, cloud };
      setLoaded(true);
    }).catch(() => {
      // Silently fail — screensaver just won't show
    });
    return () => { cancelled = true; };
  }, [screensaverType]);

  // Flurry doesn't need preloading
  useEffect(() => {
    if (screensaverType === "flurry") setLoaded(true);
  }, [screensaverType]);

  // ---- Initialize Flying Toasters sprites when going idle ----
  const initSprites = useCallback((w: number, h: number) => {
    const toasters: Sprite[] = [];
    for (let i = 0; i < NUM_TOASTERS; i++) {
      toasters.push({
        x: Math.random() * (w + 400) - 200,
        y: -TOASTER_SIZE - Math.random() * h * 0.8,
        speed: 1.2 + Math.random() * 1.5,
        frame: Math.floor(Math.random() * 4),
        lastFrameTime: 0,
        size: TOASTER_SIZE + Math.floor(Math.random() * 24),
        opacity: 0.85 + Math.random() * 0.15,
      });
    }

    const toasts: Sprite[] = [];
    for (let i = 0; i < NUM_TOASTS; i++) {
      toasts.push({
        x: Math.random() * (w + 300) - 100,
        y: -TOAST_SIZE - Math.random() * h * 0.6,
        speed: 1 + Math.random() * 1.2,
        frame: 0,
        lastFrameTime: 0,
        size: TOAST_SIZE + Math.floor(Math.random() * 16),
        opacity: 0.7 + Math.random() * 0.3,
      });
    }

    const clouds: Sprite[] = [];
    for (let i = 0; i < NUM_CLOUDS; i++) {
      clouds.push({
        x: Math.random() * (w + 400),
        y: -CLOUD_SIZE - Math.random() * h * 0.5,
        speed: 0.3 + Math.random() * 0.5,
        frame: 0,
        lastFrameTime: 0,
        size: CLOUD_SIZE + Math.floor(Math.random() * 80),
        opacity: 0.15 + Math.random() * 0.2,
      });
    }

    spritesRef.current = { toasters, toasts, clouds };
  }, []);

  // ---- Flying Toasters animation loop ----
  const animateToasters = useCallback((timestamp: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const { toasters, toast, cloud } = imagesRef.current;
    const sprites = spritesRef.current;

    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, w, h);

    // Clouds
    if (cloud) {
      for (const c of sprites.clouds) {
        c.x -= c.speed * 0.6;
        c.y += c.speed;
        ctx.globalAlpha = c.opacity;
        ctx.drawImage(cloud, c.x, c.y, c.size, c.size);
        if (c.y > h + c.size || c.x < -c.size) {
          c.x = w + Math.random() * 200;
          c.y = -c.size - Math.random() * h * 0.3;
          c.speed = 0.3 + Math.random() * 0.5;
        }
      }
    }

    // Toast
    if (toast) {
      for (const t of sprites.toasts) {
        t.x -= t.speed * 0.4;
        t.y += t.speed;
        ctx.globalAlpha = t.opacity;
        ctx.drawImage(toast, t.x, t.y, t.size, t.size);
        if (t.y > h + t.size || t.x < -t.size) {
          t.x = w + Math.random() * 200;
          t.y = -t.size - Math.random() * h * 0.4;
          t.speed = 1 + Math.random() * 1.2;
        }
      }
    }

    // Toasters
    if (toasters.length === 4) {
      for (const s of sprites.toasters) {
        s.x -= s.speed * 0.5;
        s.y += s.speed;
        if (timestamp - s.lastFrameTime > SPRITE_FRAME_INTERVAL) {
          s.frame = (s.frame + 1) % 4;
          s.lastFrameTime = timestamp;
        }
        ctx.globalAlpha = s.opacity;
        ctx.drawImage(toasters[s.frame], s.x, s.y, s.size, s.size);
        if (s.y > h + s.size || s.x < -s.size) {
          s.x = w + Math.random() * 300;
          s.y = -s.size - Math.random() * h * 0.5;
          s.speed = 1.2 + Math.random() * 1.5;
        }
      }
    }

    ctx.globalAlpha = 1;
    animRef.current = requestAnimationFrame(animateToasters);
  }, []);

  // ---- Start/stop based on idle state ----
  useEffect(() => {
    if (idle && loaded && screensaverType !== "none") {
      setVisible(true);
      requestAnimationFrame(() => setFadingIn(true));
    } else {
      setFadingIn(false);
      const t = setTimeout(() => setVisible(false), 500);
      return () => clearTimeout(t);
    }
  }, [idle, loaded, screensaverType]);

  // ---- Flying Toasters canvas setup ----
  useEffect(() => {
    if (!visible || !loaded || screensaverType !== "flying-toasters") return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    initSprites(canvas.width, canvas.height);
    animRef.current = requestAnimationFrame(animateToasters);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animRef.current);
    };
  }, [visible, loaded, screensaverType, initSprites, animateToasters]);

  // ---- Dismiss on click ----
  const handleDismiss = useCallback(() => {
    dismiss();
  }, [dismiss]);

  if (!visible || screensaverType === "none") return null;

  const badgeText =
    screensaverType === "flying-toasters"
      ? "After Dark \u2022 Flying Toasters"
      : "Flurry";

  return (
    <div
      onClick={handleDismiss}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99998,
        cursor: "none",
        opacity: fadingIn ? 1 : 0,
        transition: "opacity 0.5s ease",
      }}
    >
      {screensaverType === "flying-toasters" && (
        <canvas
          ref={canvasRef}
          style={{ display: "block", width: "100%", height: "100%" }}
        />
      )}

      {screensaverType === "flurry" && (
        <FlurryScreensaver active={visible && screensaverType === "flurry"} />
      )}

      {/* Badge */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: 20,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: 0.25,
          fontSize: "11px",
          letterSpacing: "3px",
          textTransform: "uppercase",
          color: "#666",
          fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
          pointerEvents: "none",
        }}
      >
        {badgeText}
      </div>
    </div>
  );
}
