"use client";

import React, { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { flattenFS, type FSItem } from "@/data/fs";
import { useDesktop } from "@/hooks/useDesktopStore";
import { getPantherIconPath } from "./PantherIcons";

// ============================================================================
// SPOTLIGHT SEARCH (Mac OS X 10.4 style, brought to Panther)
// ============================================================================
// Cmd+Space: opens a floating search bar. Type to filter apps and files.
// Arrow keys + Enter to navigate and open. Esc to close.
// ============================================================================

interface SpotlightProps {
  active: boolean;
  onClose: () => void;
}

export default function Spotlight({ active, onClose }: SpotlightProps) {
  const { dispatch } = useDesktop();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // All searchable items
  const allItems = useMemo(() => {
    return flattenFS().filter(
      (item) => !item.hidden && item.type !== "link"
    );
  }, []);

  // Filter results
  const results = useMemo(() => {
    if (!query.trim()) return allItems.slice(0, 8);
    const q = query.toLowerCase();
    return allItems
      .filter((item) =>
        item.name.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [query, allItems]);

  // Reset state when opening
  useEffect(() => {
    if (active) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [active]);

  // Clamp selected index when results change
  useEffect(() => {
    setSelectedIndex((prev) => Math.min(prev, Math.max(0, results.length - 1)));
  }, [results.length]);

  const openItem = useCallback((item: FSItem) => {
    if (item.type === "link" && item.href) {
      window.open(item.href, "_blank", "noopener,noreferrer");
    } else {
      dispatch({ type: "OPEN_WINDOW", payload: { fsItem: item } });
    }
    onClose();
  }, [dispatch, onClose]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[selectedIndex]) {
        openItem(results[selectedIndex]);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  }, [results, selectedIndex, openItem, onClose]);

  // Close on Escape globally (when input isn't focused)
  useEffect(() => {
    if (!active) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [active, onClose]);

  if (!active) return null;

  return (
    <div
      className="fixed inset-0 z-[99995]"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{
          background: "rgba(0, 0, 0, 0.25)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
        }}
      />

      {/* Search panel */}
      <div
        className="absolute left-1/2 -translate-x-1/2 top-[18%] w-[520px] max-w-[calc(100%-32px)]
                   rounded-xl overflow-hidden shadow-2xl animate-fade-in"
        style={{
          background: "var(--desktop-surface)",
          border: "1px solid var(--desktop-border)",
          boxShadow: "0 16px 48px rgba(0,0,0,0.25), 0 4px 12px rgba(0,0,0,0.15)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: "1px solid var(--desktop-border)" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--desktop-text-secondary)" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            onKeyDown={handleKeyDown}
            placeholder="Spotlight Search"
            className="flex-1 bg-transparent outline-none text-[15px]"
            style={{ color: "var(--desktop-text)", caretColor: "var(--desktop-accent)" }}
            autoComplete="off"
            spellCheck={false}
          />
          {query && (
            <button
              onClick={() => { setQuery(""); inputRef.current?.focus(); }}
              className="text-[11px] px-1.5 rounded hover:bg-black/5"
              style={{ color: "var(--desktop-text-secondary)" }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Results */}
        {results.length > 0 ? (
          <div className="max-h-[320px] overflow-y-auto py-1">
            {results.map((item, i) => {
              const iconPath = getPantherIconPath(item.id);
              const isSelected = i === selectedIndex;

              return (
                <button
                  key={item.id}
                  className="w-full flex items-center gap-3 px-4 py-2 text-left transition-colors duration-75"
                  style={{
                    background: isSelected ? "var(--desktop-accent)" : "transparent",
                    color: isSelected ? "white" : "var(--desktop-text)",
                  }}
                  onClick={() => openItem(item)}
                  onMouseEnter={() => setSelectedIndex(i)}
                >
                  <img
                    src={iconPath}
                    alt=""
                    width={28}
                    height={28}
                    draggable={false}
                    style={{ objectFit: "contain" }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium truncate">{item.name}</div>
                    {item.description && (
                      <div
                        className="text-[11px] truncate"
                        style={{ opacity: isSelected ? 0.85 : 0.55 }}
                      >
                        {item.description}
                      </div>
                    )}
                  </div>
                  <span
                    className="text-[10px] shrink-0 capitalize"
                    style={{ opacity: isSelected ? 0.7 : 0.35 }}
                  >
                    {item.type}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="px-4 py-6 text-center text-[13px]" style={{ color: "var(--desktop-text-secondary)" }}>
            No results for &ldquo;{query}&rdquo;
          </div>
        )}

        {/* Footer hint */}
        <div
          className="px-4 py-1.5 text-[10px] text-center"
          style={{
            borderTop: "1px solid var(--desktop-border)",
            color: "var(--desktop-text-secondary)",
            opacity: 0.6,
          }}
        >
          ↑↓ Navigate • ↵ Open • esc Close
        </div>
      </div>
    </div>
  );
}
