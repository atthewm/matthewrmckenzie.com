"use client";

// ============================================================================
// BOARD CAMERA
// ============================================================================
// Pan and zoom for a pinboard viewport: wheel or trackpad pinch zooms around
// the cursor, dragging empty board pans, two fingers pinch on touch screens.
// ============================================================================

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";

export interface Camera {
  x: number;
  y: number;
  scale: number;
}

export const MIN_SCALE = 0.25;
export const MAX_SCALE = 2.5;
const WHEEL_ZOOM_SPEED = 0.0015;
const PINCH_WHEEL_SPEED = 0.01;
const FIT_PADDING = 40;
/** If the whole board fits at this zoom or better, open fitted. */
const MIN_READABLE_FIT = 0.8;
const READABLE_SCALE = 0.9;
const NARROW_VIEW = 600;
const NARROW_SCALE = 0.8;
/** Screen gap between the viewport edge and the first card when opening anchored. */
const ANCHOR_INSET = 36;

function clampScale(scale: number): number {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));
}

/** Zoom so that the world point under (px, py) stays under it. */
export function zoomAround(camera: Camera, px: number, py: number, nextScale: number): Camera {
  const scale = clampScale(nextScale);
  const ratio = scale / camera.scale;
  return { scale, x: px - (px - camera.x) * ratio, y: py - (py - camera.y) * ratio };
}

export function fitCamera(viewW: number, viewH: number, worldW: number, worldH: number): Camera {
  const scale = clampScale(
    Math.min(1, (viewW - FIT_PADDING * 2) / worldW, (viewH - FIT_PADDING * 2) / worldH),
  );
  return { scale, x: (viewW - worldW * scale) / 2, y: Math.max(FIT_PADDING / 2, (viewH - worldH * scale) / 2) };
}

/**
 * Opening view: fit the whole board when that is still readable, otherwise
 * open at a readable zoom anchored on the top left of the content.
 * `margin` is the empty world space around the content.
 */
export function initialCamera(viewW: number, viewH: number, worldW: number, worldH: number, margin: number): Camera {
  const fitted = fitCamera(viewW, viewH, worldW, worldH);
  if (fitted.scale >= MIN_READABLE_FIT) return fitted;
  const scale = viewW < NARROW_VIEW ? NARROW_SCALE : READABLE_SCALE;
  return { scale, x: ANCHOR_INSET - margin * scale, y: ANCHOR_INSET - margin * scale };
}

export function useBoardCamera(
  viewportRef: RefObject<HTMLDivElement | null>,
  world: { width: number; height: number },
  margin = 0,
) {
  const [camera, setCamera] = useState<Camera>({ x: 0, y: 0, scale: 1 });
  const cameraRef = useRef(camera);
  cameraRef.current = camera;
  const fittedRef = useRef(false);

  const fit = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    setCamera(fitCamera(el.clientWidth, el.clientHeight, world.width, world.height));
  }, [viewportRef, world.width, world.height]);

  const reset = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    setCamera(initialCamera(el.clientWidth, el.clientHeight, world.width, world.height, margin));
  }, [viewportRef, world.width, world.height, margin]);

  // Place the camera once the viewport has a real size (windows animate open).
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      if (!fittedRef.current && el.clientWidth > 0) {
        fittedRef.current = true;
        reset();
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [viewportRef, reset]);

  // Wheel must be a non-passive native listener so preventDefault stops page scroll.
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const speed = e.ctrlKey ? PINCH_WHEEL_SPEED : WHEEL_ZOOM_SPEED;
      const factor = Math.exp(-e.deltaY * speed);
      setCamera((c) => zoomAround(c, e.clientX - rect.left, e.clientY - rect.top, c.scale * factor));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [viewportRef]);

  const zoomBy = useCallback(
    (factor: number) => {
      const el = viewportRef.current;
      if (!el) return;
      setCamera((c) => zoomAround(c, el.clientWidth / 2, el.clientHeight / 2, c.scale * factor));
    },
    [viewportRef],
  );

  const panBy = useCallback((dx: number, dy: number) => {
    setCamera((c) => ({ ...c, x: c.x + dx, y: c.y + dy }));
  }, []);

  return { camera, cameraRef, setCamera, fit, reset, zoomBy, panBy };
}
