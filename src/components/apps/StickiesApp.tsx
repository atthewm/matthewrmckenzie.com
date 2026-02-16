"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, X } from "lucide-react";

// ============================================================================
// STICKIES APP (Mac OS X 10.3 Panther Style)
// ============================================================================
// Editable sticky notes in a grid. Colors: yellow, pink, blue, green.
// Persisted to localStorage.
// ============================================================================

type StickyColor = "yellow" | "pink" | "blue" | "green";

interface Sticky {
  id: string;
  text: string;
  color: StickyColor;
}

const COLOR_MAP: Record<StickyColor, { bg: string; border: string; dark: string }> = {
  yellow: { bg: "#FFF9C4", border: "#F9A825", dark: "#5D4E00" },
  pink:   { bg: "#FCE4EC", border: "#EC407A", dark: "#4A0E22" },
  blue:   { bg: "#E3F2FD", border: "#42A5F5", dark: "#0D2137" },
  green:  { bg: "#E8F5E9", border: "#66BB6A", dark: "#1B3A1D" },
};

const COLORS: StickyColor[] = ["yellow", "pink", "blue", "green"];
const STORAGE_KEY = "mmck-stickies";

function generateId() {
  return Math.random().toString(36).slice(2, 9);
}

function loadStickies(): Sticky[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return [
    { id: generateId(), text: "Welcome to Stickies!\n\nClick the + button to add a new note.", color: "yellow" },
  ];
}

export default function StickiesApp() {
  const [stickies, setStickies] = useState<Sticky[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setStickies(loadStickies());
    setLoaded(true);
  }, []);

  // Save to localStorage on every change
  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stickies));
  }, [stickies, loaded]);

  const addSticky = useCallback((color: StickyColor = "yellow") => {
    setStickies((prev) => [
      ...prev,
      { id: generateId(), text: "", color },
    ]);
  }, []);

  const deleteSticky = useCallback((id: string) => {
    setStickies((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const updateText = useCallback((id: string, text: string) => {
    setStickies((prev) => prev.map((s) => (s.id === id ? { ...s, text } : s)));
  }, []);

  const updateColor = useCallback((id: string, color: StickyColor) => {
    setStickies((prev) => prev.map((s) => (s.id === id ? { ...s, color } : s)));
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div
        className="shrink-0 h-[28px] flex items-center justify-between px-3 border-b text-[10px]"
        style={{
          borderColor: "var(--desktop-border)",
          background: "rgba(0,0,0,0.02)",
        }}
      >
        <span className="text-desktop-text-secondary font-medium uppercase tracking-wider">
          Stickies
        </span>
        <div className="flex items-center gap-1">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => addSticky(c)}
              className="w-3.5 h-3.5 rounded-full border hover:scale-110 transition-transform"
              style={{ background: COLOR_MAP[c].border, borderColor: COLOR_MAP[c].dark }}
              title={`New ${c} note`}
            />
          ))}
          <button
            onClick={() => addSticky("yellow")}
            className="ml-1 p-0.5 rounded hover:bg-desktop-border/50 transition-colors text-desktop-text-secondary"
            title="New note"
          >
            <Plus size={12} />
          </button>
        </div>
      </div>

      {/* Notes grid */}
      <div className="flex-1 overflow-auto p-3">
        {stickies.length === 0 ? (
          <div className="flex items-center justify-center h-full text-[11px] text-desktop-text-secondary">
            No notes yet. Click + to create one.
          </div>
        ) : (
          <div
            className="grid gap-3"
            style={{ gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}
          >
            {stickies.map((sticky) => {
              const colors = COLOR_MAP[sticky.color];
              return (
                <div
                  key={sticky.id}
                  className="relative rounded-lg shadow-sm"
                  style={{
                    background: colors.bg,
                    border: `1px solid ${colors.border}`,
                    minHeight: "120px",
                  }}
                >
                  {/* Note header */}
                  <div className="flex items-center justify-between px-2 pt-1.5">
                    {/* Color picker */}
                    <div className="flex gap-1">
                      {COLORS.map((c) => (
                        <button
                          key={c}
                          onClick={() => updateColor(sticky.id, c)}
                          className={`w-2.5 h-2.5 rounded-full border transition-transform ${
                            sticky.color === c ? "scale-125 ring-1 ring-offset-1" : ""
                          }`}
                          style={{
                            background: COLOR_MAP[c].border,
                            borderColor: COLOR_MAP[c].dark,
                            // ring color handled via Tailwind class
                            "--tw-ring-color": COLOR_MAP[c].border,
                          } as React.CSSProperties}
                        />
                      ))}
                    </div>
                    <button
                      onClick={() => deleteSticky(sticky.id)}
                      className="p-0.5 rounded hover:bg-black/10 transition-colors"
                      style={{ color: colors.dark }}
                    >
                      <X size={10} />
                    </button>
                  </div>

                  {/* Editable text */}
                  <textarea
                    value={sticky.text}
                    onChange={(e) => updateText(sticky.id, e.target.value)}
                    placeholder="Type a note..."
                    className="w-full h-full min-h-[80px] p-2 pt-1 text-[12px] leading-relaxed
                               bg-transparent border-none outline-none resize-none"
                    style={{ color: colors.dark }}
                    spellCheck={false}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        className="shrink-0 h-[22px] flex items-center justify-center border-t text-[10px] text-desktop-text-secondary"
        style={{
          borderColor: "var(--desktop-border)",
          background: "rgba(0,0,0,0.02)",
        }}
      >
        {stickies.length} note{stickies.length !== 1 ? "s" : ""}
      </div>
    </div>
  );
}
