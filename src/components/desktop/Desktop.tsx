"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import WindowManager from "./WindowManager";
import Dock from "./Dock";
import MenuBar from "./MenuBar";
import ZenBackground from "./ZenBackground";
import FloatingStickies from "./FloatingStickies";
import ContextMenu, { type ContextMenuItem } from "./ContextMenu";
import Expose from "./Expose";
import Spotlight from "./Spotlight";
import DesktopIcon from "./DesktopIcon";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useDesktop } from "@/hooks/useDesktopStore";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useSecrets } from "@/lib/useSecrets";
import { findFSItem } from "@/data/fs";
import { profile } from "@/config/profile";

// ============================================================================
// DESKTOP
// ============================================================================
// Main desktop view: wallpaper, menu bar, windows, and bottom dock.
// Desktop shortcuts and the Dock open the same application windows.
// ============================================================================

const DESKTOP_ICON_IDS = [
  "now", "recipes", "health", "apple-music",
  "github-projects", "chess", "minesweeper", "photo-booth",
  "trash",
];
const ICON_STORAGE_KEY = "mmck-desktop-icon-positions";

const MOBILE_WELCOME_KEY = "mmck-mobile-welcomed";
const KONAMI = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];

interface DesktopProps {
  contentMap: Record<string, string>;
}

export default function Desktop({ contentMap }: DesktopProps) {
  useKeyboardShortcuts();
  const { dispatch } = useDesktop();
  const isMobile = useIsMobile();
  const didOpenRef = useRef(false);
  const { revealed, reveal } = useSecrets();
  const [toast, setToast] = useState<string | null>(null);
  const [stickiesVisible, setStickiesVisible] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; items: ContextMenuItem[] } | null>(null);
  const [exposeActive, setExposeActive] = useState(false);
  const [spotlightActive, setSpotlightActive] = useState(false);

  const [viewport, setViewport] = useState(() => ({ width: window.innerWidth, height: window.innerHeight }));
  useEffect(() => {
    const resize = () => setViewport({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const [iconPositions, setIconPositions] = useState<Record<string, { x: number; y: number }>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const saved = localStorage.getItem(ICON_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch { /* empty */ }
    return {};
  });

  const handleIconDragEnd = useCallback((id: string, x: number, y: number) => {
    setIconPositions((prev) => {
      const next = { ...prev, [id]: { x, y } };
      try { localStorage.setItem(ICON_STORAGE_KEY, JSON.stringify(next)); } catch { /* empty */ }
      return next;
    });
  }, []);

  // Auto-open window from ?open= query param (e.g. /?open=about)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const openId = params.get("open");
    if (openId) {
      const item = findFSItem(openId);
      // Owner-only apps cannot be opened by link.
      if (item && !item.ownerOnly) {
        dispatch({ type: "OPEN_WINDOW", payload: { fsItem: item } });
      }
      // Clean URL without reload
      window.history.replaceState({}, "", "/");
    }
  }, [dispatch]);

  // On mobile first load (no ?open param), auto-open the README window
  useEffect(() => {
    if (!isMobile || didOpenRef.current) return;
    if (sessionStorage.getItem(MOBILE_WELCOME_KEY)) return;
    // Skip if we just opened something via ?open=
    const params = new URLSearchParams(window.location.search);
    if (params.get("open")) return;

    didOpenRef.current = true;
    sessionStorage.setItem(MOBILE_WELCOME_KEY, "1");

    const readme = findFSItem("readme");
    if (readme) {
      dispatch({ type: "OPEN_WINDOW", payload: { fsItem: readme } });
    }
  }, [isMobile, dispatch]);

  // Toast auto-dismiss
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const showSecretToast = useCallback(() => {
    if (!revealed) {
      reveal();
      setToast("You found the Secrets folder!");
    }
  }, [revealed, reveal]);

  // Exposé & Spotlight keyboard shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // F9 → toggle Exposé
      if (e.key === "F9") {
        e.preventDefault();
        setSpotlightActive(false);
        setExposeActive((v) => !v);
        return;
      }
      // Cmd/Ctrl + Space → toggle Spotlight
      if ((e.metaKey || e.ctrlKey) && e.code === "Space") {
        e.preventDefault();
        setExposeActive(false);
        setSpotlightActive((v) => !v);
        return;
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Konami code listener
  useEffect(() => {
    const buffer: string[] = [];
    function onKey(e: KeyboardEvent) {
      buffer.push(e.key);
      if (buffer.length > KONAMI.length) buffer.shift();
      if (buffer.length === KONAMI.length && buffer.every((k, i) => k === KONAMI[i])) {
        showSecretToast();
        buffer.length = 0;
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showSecretToast]);

  // Option+click 3x easter egg
  const clickTimesRef = useRef<number[]>([]);
  const handleDesktopClick = useCallback((e: React.MouseEvent) => {
    if (e.target !== e.currentTarget) return;
    dispatch({ type: "FOCUS_WINDOW", payload: { id: "" } });

    if (e.altKey) {
      const now = Date.now();
      clickTimesRef.current.push(now);
      // Keep only clicks within last 3 seconds
      clickTimesRef.current = clickTimesRef.current.filter((t) => now - t < 3000);
      if (clickTimesRef.current.length >= 3) {
        showSecretToast();
        clickTimesRef.current = [];
      }
    }
  }, [dispatch, showSecretToast]);

  // Right-click context menu on desktop
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    // Only on the desktop surface itself
    if (e.target !== e.currentTarget) return;
    e.preventDefault();

    const items: ContextMenuItem[] = [
      {
        label: "New Sticky Note",
        action: () => setStickiesVisible(true),
      },
      { label: "", separator: true },
      {
        label: "Change Background...",
        shortcut: "⌘,",
        action: () => {
          const s = findFSItem("settings");
          if (s) dispatch({ type: "OPEN_WINDOW", payload: { fsItem: s } });
        },
      },
      {
        label: "About This Mac",
        action: () => {
          const a = findFSItem("about");
          if (a) dispatch({ type: "OPEN_WINDOW", payload: { fsItem: a } });
        },
      },
      { label: "", separator: true },
      {
        label: "Close All Windows",
        shortcut: "⌘H",
        action: () => dispatch({ type: "CLOSE_ALL_WINDOWS" }),
      },
      {
        label: "Open Terminal",
        action: () => {
          const t = findFSItem("terminal");
          if (t) dispatch({ type: "OPEN_WINDOW", payload: { fsItem: t } });
        },
      },
    ];

    setContextMenu({ x: e.clientX, y: e.clientY, items });
  }, [dispatch]);

  // Leave one row above the Dock for Trash when the screen is short.
  const shortcutRows = Math.max(1, Math.min(4, Math.floor((viewport.height - 174) / 90)));

  return (
    <main aria-label="Desktop workspace" className="fixed inset-0 overflow-hidden">
      <h1 className="sr-only">{profile.fullName}</h1>
      {/* Skip to content for keyboard / screen reader users */}
      <a
        href="#desktop-workspace"
        className="sr-only focus:not-sr-only focus:absolute focus:top-1 focus:left-2 focus:z-boot focus:bg-white focus:text-black focus:px-3 focus:py-1.5 focus:rounded focus:text-sm focus:shadow-lg"
      >
        Skip to desktop workspace
      </a>

      {/* Wallpaper background */}
      <ZenBackground />

      {/* Menu bar */}
      <MenuBar />

      {/* Click on empty desktop to unfocus + easter egg + right-click */}
      <div
        id="desktop-workspace"
        tabIndex={-1}
        className="absolute top-[26px] left-0 right-0 bottom-0"
        onClick={handleDesktopClick}
        onContextMenu={handleContextMenu}
      />

      {/* Desktop icons (draggable, hidden on mobile) */}
      {!isMobile && DESKTOP_ICON_IDS.map((id, index) => {
        const item = findFSItem(id);
        if (!item) return null;
        const defaultPosition = id === "trash"
          ? { x: viewport.width - 100, y: viewport.height - 158 }
          : { x: viewport.width - (Math.floor(index / shortcutRows) + 1) * 100, y: 36 + (index % shortcutRows) * 90 };
        const pos = iconPositions[id] ?? defaultPosition;
        return (
          <DesktopIcon
            key={id}
            item={item}
            x={Math.max(0, Math.min(pos.x, viewport.width - 80))}
            y={Math.max(26, Math.min(pos.y, viewport.height - 88))}
            onDragEnd={handleIconDragEnd}
          />
        );
      })}

      {/* Windows */}
      <WindowManager contentMap={contentMap} />

      {/* Floating Stickies */}
      <FloatingStickies visible={stickiesVisible} />

      {/* Dock */}
      <Dock onStickiesToggle={() => setStickiesVisible((v) => !v)} stickiesActive={stickiesVisible} />

      {/* Exposé overlay */}
      <Expose active={exposeActive} onClose={() => setExposeActive(false)} />

      {/* Spotlight search */}
      <Spotlight active={spotlightActive} onClose={() => setSpotlightActive(false)} />

      {/* Right-click context menu */}
      {contextMenu && (
        <ContextMenu
          items={contextMenu.items}
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
        />
      )}

      {/* Toast notification */}
      {toast && (
        <div
          className="fixed top-10 left-1/2 -translate-x-1/2 z-boot
                     px-4 py-2 rounded-lg shadow-lg text-[12px] font-medium
                     animate-fade-in"
          style={{
            background: "var(--desktop-surface)",
            border: "1px solid var(--desktop-border)",
            color: "var(--desktop-text)",
          }}
        >
          {toast}
        </div>
      )}
    </main>
  );
}
