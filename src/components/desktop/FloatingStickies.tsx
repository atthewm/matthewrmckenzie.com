"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Plus, X } from "lucide-react";

// ============================================================================
// FLOATING STICKIES (Mac OS X 10.3 Panther Style)
// ============================================================================
// Individual sticky notes that float directly on the desktop, each one its
// own draggable mini-window. Classic Panther Stickies behavior.
// ============================================================================

type StickyColor = "yellow" | "pink" | "blue" | "green";

interface Sticky {
  id: string;
  text: string;
  color: StickyColor;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
}

const COLOR_MAP: Record<StickyColor, { bg: string; header: string; border: string; text: string }> = {
  yellow: { bg: "#FFF9C4", header: "#FDEE6E", border: "#E6C619", text: "#5D4E00" },
  pink:   { bg: "#FCE4EC", header: "#F8B4CA", border: "#E06090", text: "#4A0E22" },
  blue:   { bg: "#E3F2FD", header: "#A0CFF0", border: "#5098D0", text: "#0D2137" },
  green:  { bg: "#E8F5E9", header: "#A8D8A8", border: "#58A858", text: "#1B3A1D" },
};

const COLORS: StickyColor[] = ["yellow", "pink", "blue", "green"];
const STORAGE_KEY = "mmck-stickies-v2";
const DEFAULT_WIDTH = 220;
const DEFAULT_HEIGHT = 180;

let nextZ = 100;

function generateId() {
  return Math.random().toString(36).slice(2, 9);
}

function loadStickies(): Sticky[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore
  }
  return [
    {
      id: generateId(),
      text: "Welcome to Stickies!\n\nClick the + to add a new note.\nDrag the header to move.",
      color: "yellow",
      x: 80,
      y: 60,
      width: DEFAULT_WIDTH,
      height: DEFAULT_HEIGHT,
      zIndex: nextZ++,
    },
  ];
}

// ---------------------------------------------------------------------------
// Single sticky note
// ---------------------------------------------------------------------------

interface StickyNoteProps {
  sticky: Sticky;
  onUpdate: (id: string, patch: Partial<Sticky>) => void;
  onDelete: (id: string) => void;
  onFocus: (id: string) => void;
}

function StickyNote({ sticky, onUpdate, onDelete, onFocus }: StickyNoteProps) {
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const resizeRef = useRef<{ startX: number; startY: number; origW: number; origH: number } | null>(null);
  const colors = COLOR_MAP[sticky.color];

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    onFocus(sticky.id);
  }, [sticky.id, onFocus]);

  // Drag header
  const startDrag = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    onFocus(sticky.id);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: sticky.x,
      origY: sticky.y,
    };

    const onMove = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      const dx = ev.clientX - dragRef.current.startX;
      const dy = ev.clientY - dragRef.current.startY;
      onUpdate(sticky.id, {
        x: dragRef.current.origX + dx,
        y: dragRef.current.origY + dy,
      });
    };
    const onUp = () => {
      dragRef.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [sticky.id, sticky.x, sticky.y, onUpdate, onFocus]);

  // Resize handle
  const startResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onFocus(sticky.id);
    resizeRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origW: sticky.width,
      origH: sticky.height,
    };

    const onMove = (ev: MouseEvent) => {
      if (!resizeRef.current) return;
      const dx = ev.clientX - resizeRef.current.startX;
      const dy = ev.clientY - resizeRef.current.startY;
      onUpdate(sticky.id, {
        width: Math.max(160, resizeRef.current.origW + dx),
        height: Math.max(100, resizeRef.current.origH + dy),
      });
    };
    const onUp = () => {
      resizeRef.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [sticky.id, sticky.width, sticky.height, onUpdate, onFocus]);

  // Cycle color
  const cycleColor = useCallback(() => {
    const idx = COLORS.indexOf(sticky.color);
    const next = COLORS[(idx + 1) % COLORS.length];
    onUpdate(sticky.id, { color: next });
  }, [sticky.id, sticky.color, onUpdate]);

  return (
    <div
      className="absolute rounded shadow-lg flex flex-col select-none"
      style={{
        left: sticky.x,
        top: sticky.y,
        width: sticky.width,
        height: sticky.height,
        zIndex: sticky.zIndex,
        background: colors.bg,
        border: `1px solid ${colors.border}`,
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Header bar - draggable */}
      <div
        className="shrink-0 h-[20px] flex items-center justify-between px-1.5 cursor-move rounded-t"
        style={{ background: colors.header, borderBottom: `1px solid ${colors.border}` }}
        onMouseDown={startDrag}
      >
        <div className="flex items-center gap-1">
          <button
            onClick={() => onDelete(sticky.id)}
            className="w-3 h-3 rounded-full flex items-center justify-center hover:brightness-90 transition-all"
            style={{ background: "#FF5F57", border: "1px solid #E03E36" }}
            title="Close note"
          >
            <X size={7} color="#7A0000" strokeWidth={3} />
          </button>
          <button
            onClick={cycleColor}
            className="w-3 h-3 rounded-full hover:brightness-90 transition-all"
            style={{ background: "#FFBD2E", border: "1px solid #DFA020" }}
            title="Change color"
          />
        </div>
        <button
          onClick={() => {
            const newSticky: Partial<Sticky> = {};
            onUpdate("__new__", { color: sticky.color, x: sticky.x + 20, y: sticky.y + 20 } as Partial<Sticky>);
          }}
          className="p-0 hover:brightness-90"
          title="New note"
        >
          <Plus size={10} style={{ color: colors.text }} />
        </button>
      </div>

      {/* Editable text area */}
      <textarea
        value={sticky.text}
        onChange={(e) => onUpdate(sticky.id, { text: e.target.value })}
        placeholder="Type a note..."
        className="flex-1 p-2 text-[12px] leading-relaxed bg-transparent border-none outline-none resize-none"
        style={{ color: colors.text, caretColor: colors.text }}
        spellCheck={false}
      />

      {/* Resize handle */}
      <div
        className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize"
        onMouseDown={startResize}
        style={{ opacity: 0.4 }}
      >
        <svg width="12" height="12" viewBox="0 0 12 12">
          <line x1="10" y1="2" x2="2" y2="10" stroke={colors.border} strokeWidth="1" />
          <line x1="10" y1="5" x2="5" y2="10" stroke={colors.border} strokeWidth="1" />
          <line x1="10" y1="8" x2="8" y2="10" stroke={colors.border} strokeWidth="1" />
        </svg>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Floating Stickies Manager
// ---------------------------------------------------------------------------

interface FloatingStickiesProps {
  visible: boolean;
}

export default function FloatingStickies({ visible }: FloatingStickiesProps) {
  const [stickies, setStickies] = useState<Sticky[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setStickies(loadStickies());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stickies));
  }, [stickies, loaded]);

  const updateSticky = useCallback((id: string, patch: Partial<Sticky>) => {
    if (id === "__new__") {
      // Create new sticky note from the + button
      setStickies((prev) => [
        ...prev,
        {
          id: generateId(),
          text: "",
          color: (patch.color as StickyColor) || "yellow",
          x: (patch.x as number) || 100,
          y: (patch.y as number) || 100,
          width: DEFAULT_WIDTH,
          height: DEFAULT_HEIGHT,
          zIndex: nextZ++,
        },
      ]);
      return;
    }
    setStickies((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }, []);

  const deleteSticky = useCallback((id: string) => {
    setStickies((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const focusSticky = useCallback((id: string) => {
    setStickies((prev) =>
      prev.map((s) => (s.id === id ? { ...s, zIndex: nextZ++ } : s))
    );
  }, []);

  if (!visible || stickies.length === 0) return null;

  return (
    <>
      {stickies.map((sticky) => (
        <StickyNote
          key={sticky.id}
          sticky={sticky}
          onUpdate={updateSticky}
          onDelete={deleteSticky}
          onFocus={focusSticky}
        />
      ))}
    </>
  );
}

// Export helper to create a new sticky externally
export function createInitialSticky(): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const existing = raw ? JSON.parse(raw) : [];
    if (existing.length === 0) {
      const initial: Sticky[] = [{
        id: generateId(),
        text: "",
        color: "yellow",
        x: 100 + Math.random() * 200,
        y: 80 + Math.random() * 150,
        width: DEFAULT_WIDTH,
        height: DEFAULT_HEIGHT,
        zIndex: nextZ++,
      }];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    }
  } catch {
    // ignore
  }
}
