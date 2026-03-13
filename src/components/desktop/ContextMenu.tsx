"use client";

import React, { useEffect, useRef, useCallback } from "react";

// ---------------------------------------------------------------------------
// Context Menu — Mac OS X Panther-style right-click menu
// ---------------------------------------------------------------------------

export interface ContextMenuItem {
  label: string;
  action?: () => void;
  separator?: boolean;
  disabled?: boolean;
  shortcut?: string; // e.g. "⌘W"
}

interface ContextMenuProps {
  items: ContextMenuItem[];
  x: number;
  y: number;
  onClose: () => void;
}

export default function ContextMenu({ items, x, y, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on any click outside or Esc
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    // Use capture to catch clicks before they propagate
    document.addEventListener("mousedown", handleClick, true);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick, true);
      document.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  // Adjust position to keep menu on screen
  const adjustedX = Math.min(x, (typeof window !== "undefined" ? window.innerWidth : 1024) - 200);
  const adjustedY = Math.min(y, (typeof window !== "undefined" ? window.innerHeight : 768) - items.length * 28 - 16);

  const handleItemClick = useCallback(
    (item: ContextMenuItem) => {
      if (item.disabled || item.separator) return;
      item.action?.();
      onClose();
    },
    [onClose]
  );

  return (
    <div
      ref={menuRef}
      className="fixed z-[99990]"
      style={{
        left: adjustedX,
        top: adjustedY,
        minWidth: "180px",
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderRadius: "6px",
        border: "1px solid rgba(0,0,0,0.15)",
        boxShadow: "0 8px 30px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08)",
        padding: "4px 0",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {items.map((item, i) =>
        item.separator ? (
          <div
            key={`sep-${i}`}
            style={{
              height: "1px",
              margin: "4px 8px",
              background: "rgba(0,0,0,0.1)",
            }}
          />
        ) : (
          <button
            key={item.label}
            onClick={() => handleItemClick(item)}
            disabled={item.disabled}
            className="w-full text-left"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "4px 16px",
              fontSize: "12px",
              color: item.disabled ? "rgba(0,0,0,0.3)" : "#1a1a1a",
              cursor: item.disabled ? "default" : "pointer",
              background: "transparent",
              border: "none",
              borderRadius: "3px",
              margin: "0 4px",
              width: "calc(100% - 8px)",
              transition: "background 0.1s",
            }}
            onMouseEnter={(e) => {
              if (!item.disabled) {
                (e.currentTarget as HTMLElement).style.background =
                  "var(--desktop-accent, #4a90d9)";
                (e.currentTarget as HTMLElement).style.color = "white";
              }
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
              (e.currentTarget as HTMLElement).style.color = item.disabled
                ? "rgba(0,0,0,0.3)"
                : "#1a1a1a";
            }}
          >
            <span>{item.label}</span>
            {item.shortcut && (
              <span
                style={{
                  fontSize: "11px",
                  opacity: 0.5,
                  marginLeft: "20px",
                }}
              >
                {item.shortcut}
              </span>
            )}
          </button>
        )
      )}
    </div>
  );
}
