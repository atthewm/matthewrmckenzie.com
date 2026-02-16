"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { useDesktop, type Theme } from "@/hooks/useDesktopStore";
import { getRootItems, findFSItem, type FSItem } from "@/data/fs";
import { useOpenInBrowser } from "@/lib/browserStore";

// ============================================================================
// MENU BAR (Classic Mac Style) - Functional Dropdowns
// ============================================================================
// Opaque top bar with bold app name, classic menu items with working dropdowns,
// theme toggle, and clock. Menus have real actions: open items, manage windows,
// toggle theme, close all, etc.
// ============================================================================

// ---------------------------------------------------------------------------
// Clock
// ---------------------------------------------------------------------------

function Clock() {
  const [time, setTime] = useState("");

  useEffect(() => {
    function tick() {
      setTime(
        new Date().toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      );
    }
    tick();
    const interval = setInterval(tick, 30000);
    return () => clearInterval(interval);
  }, []);

  return <span className="text-[11px] font-medium tabular-nums">{time}</span>;
}

// ---------------------------------------------------------------------------
// Menu item types
// ---------------------------------------------------------------------------

type MenuItem =
  | { type: "action"; label: string; shortcut?: string; action: () => void; disabled?: boolean }
  | { type: "separator" }
  | { type: "submenu"; label: string; children: MenuItem[] };

// ---------------------------------------------------------------------------
// Dropdown component
// ---------------------------------------------------------------------------

function MenuDropdown({
  items,
  onClose,
}: {
  items: MenuItem[];
  onClose: () => void;
}) {
  return (
    <div
      className="absolute left-0 top-full mt-0 min-w-[180px] py-1 rounded-b-md shadow-lg animate-fade-in z-[10001]"
      style={{
        background: "var(--desktop-surface)",
        border: "1px solid var(--desktop-border)",
        borderTop: "none",
      }}
    >
      {items.map((item, i) => {
        if (item.type === "separator") {
          return (
            <div
              key={`sep-${i}`}
              className="my-1 mx-2 border-t"
              style={{ borderColor: "var(--desktop-border)" }}
            />
          );
        }

        if (item.type === "submenu") {
          return <SubmenuItem key={item.label} item={item} onClose={onClose} />;
        }

        return (
          <button
            key={item.label}
            onClick={() => {
              if (!item.disabled) {
                item.action();
                onClose();
              }
            }}
            disabled={item.disabled}
            className={`
              w-full flex items-center justify-between px-4 py-1 text-[11px] text-left
              transition-colors duration-75
              ${item.disabled
                ? "text-desktop-text-secondary/50 cursor-default"
                : "text-desktop-text hover:bg-desktop-accent hover:text-white"
              }
            `}
          >
            <span>{item.label}</span>
            {item.shortcut && (
              <span className="ml-6 text-[10px] opacity-50">{item.shortcut}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function SubmenuItem({
  item,
  onClose,
}: {
  item: Extract<MenuItem, { type: "submenu" }>;
  onClose: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <div
        className="w-full flex items-center justify-between px-4 py-1 text-[11px]
                   text-desktop-text hover:bg-desktop-accent hover:text-white
                   transition-colors duration-75 cursor-default"
      >
        <span>{item.label}</span>
        <span className="text-[10px]">&#9656;</span>
      </div>
      {open && (
        <div
          className="absolute left-full top-0 min-w-[160px] py-1 rounded-md shadow-lg z-[10002]"
          style={{
            background: "var(--desktop-surface)",
            border: "1px solid var(--desktop-border)",
          }}
        >
          {item.children.map((child, j) => {
            if (child.type === "separator") {
              return (
                <div
                  key={`sub-sep-${j}`}
                  className="my-1 mx-2 border-t"
                  style={{ borderColor: "var(--desktop-border)" }}
                />
              );
            }
            if (child.type === "action") {
              return (
                <button
                  key={child.label}
                  onClick={() => {
                    child.action();
                    onClose();
                  }}
                  className="w-full flex items-center justify-between px-4 py-1 text-[11px] text-left
                             text-desktop-text hover:bg-desktop-accent hover:text-white
                             transition-colors duration-75"
                >
                  <span>{child.label}</span>
                  {child.shortcut && (
                    <span className="ml-4 text-[10px] opacity-50">{child.shortcut}</span>
                  )}
                </button>
              );
            }
            return null;
          })}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main MenuBar
// ---------------------------------------------------------------------------

export default function MenuBar() {
  const { state, dispatch, openItem, closeWindow, toggleMaximize, minimizeWindow } = useDesktop();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const themeRef = useRef<HTMLDivElement>(null);
  const openInBrowser = useOpenInBrowser();

  // Close menus on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) {
        setShowThemeMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const rootItems = getRootItems();
  const focusedWin = state.windows.find((w) => w.id === state.focusedWindowId);
  const hasWindows = state.windows.length > 0;

  // Build menu items
  const buildMenus = useCallback((): Record<string, MenuItem[]> => {
    const fileItems: MenuItem[] = [
      {
        type: "submenu",
        label: "Open",
        children: rootItems.map((item: FSItem) => ({
          type: "action" as const,
          label: item.name,
          action: () => openItem(item),
        })),
      },
      { type: "separator" },
      {
        type: "action",
        label: "Close Window",
        shortcut: "\u2318W",
        action: () => { if (focusedWin) closeWindow(focusedWin.id); },
        disabled: !focusedWin,
      },
      {
        type: "action",
        label: "Close All Windows",
        action: () => dispatch({ type: "CLOSE_ALL_WINDOWS" }),
        disabled: !hasWindows,
      },
    ];

    const editItems: MenuItem[] = [
      { type: "action", label: "Cut", shortcut: "\u2318X", action: () => document.execCommand("cut"), disabled: true },
      { type: "action", label: "Copy", shortcut: "\u2318C", action: () => document.execCommand("copy"), disabled: true },
      { type: "action", label: "Paste", shortcut: "\u2318V", action: () => document.execCommand("paste"), disabled: true },
      { type: "separator" },
      { type: "action", label: "Select All", shortcut: "\u2318A", action: () => document.execCommand("selectAll") },
    ];

    const viewItems: MenuItem[] = [
      {
        type: "action",
        label: state.resolvedTheme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode",
        action: () => dispatch({
          type: "SET_THEME",
          payload: { theme: state.resolvedTheme === "dark" ? "light" : "dark" },
        }),
      },
      { type: "separator" },
      {
        type: "action",
        label: "Zoom In",
        shortcut: "\u2318+",
        action: () => {
          const root = document.documentElement;
          const current = parseFloat(getComputedStyle(root).fontSize);
          root.style.fontSize = `${Math.min(current + 1, 20)}px`;
        },
      },
      {
        type: "action",
        label: "Zoom Out",
        shortcut: "\u2318\u2212",
        action: () => {
          const root = document.documentElement;
          const current = parseFloat(getComputedStyle(root).fontSize);
          root.style.fontSize = `${Math.max(current - 1, 10)}px`;
        },
      },
      {
        type: "action",
        label: "Actual Size",
        shortcut: "\u23180",
        action: () => { document.documentElement.style.fontSize = ""; },
      },
    ];

    const windowItems: MenuItem[] = [
      {
        type: "action",
        label: "Minimize",
        shortcut: "\u2318M",
        action: () => { if (focusedWin) minimizeWindow(focusedWin.id); },
        disabled: !focusedWin,
      },
      {
        type: "action",
        label: focusedWin?.isMaximized ? "Restore" : "Zoom",
        action: () => { if (focusedWin) toggleMaximize(focusedWin.id); },
        disabled: !focusedWin,
      },
      { type: "separator" },
      {
        type: "action",
        label: "Tile All Windows",
        action: () => {
          const visible = state.windows.filter((w) => !w.isMinimized);
          if (visible.length === 0) return;
          const cols = Math.ceil(Math.sqrt(visible.length));
          const rows = Math.ceil(visible.length / cols);
          const w = Math.floor((window.innerWidth - 88) / cols);
          const h = Math.floor((window.innerHeight - 70) / rows);
          visible.forEach((win, i) => {
            const col = i % cols;
            const row = Math.floor(i / cols);
            dispatch({
              type: "RESIZE_WINDOW",
              payload: {
                id: win.id,
                width: w - 4,
                height: h - 4,
                x: col * w + 2,
                y: 24 + row * h + 2,
              },
            });
          });
        },
        disabled: !hasWindows,
      },
      { type: "separator" },
      // List open windows
      ...state.windows.map((win): MenuItem => ({
        type: "action",
        label: `${state.focusedWindowId === win.id ? "\u2713 " : "  "}${win.title}`,
        action: () => {
          if (win.isMinimized) {
            dispatch({ type: "RESTORE_WINDOW", payload: { id: win.id } });
          } else {
            dispatch({ type: "FOCUS_WINDOW", payload: { id: win.id } });
          }
        },
      })),
    ];

    const helpItems: MenuItem[] = [
      {
        type: "action",
        label: "About McKenzie OS",
        action: () => {
          const aboutItem = rootItems.find((i: FSItem) => i.id === "about");
          if (aboutItem) openItem(aboutItem);
        },
      },
      { type: "separator" },
      {
        type: "action",
        label: "View Source on GitHub",
        action: () => window.open("https://github.com/atthewm/matthewrmckenzie.com", "_blank"),
      },
    ];

    const osItems: MenuItem[] = [
      {
        type: "action",
        label: "About McKenzie OS",
        action: () => {
          const about = findFSItem("about");
          if (about) openItem(about);
        },
      },
      { type: "separator" },
      {
        type: "action",
        label: "Start Here",
        action: () => {
          const sh = findFSItem("start-here");
          if (sh) openItem(sh);
        },
      },
      {
        type: "action",
        label: "Now",
        action: () => {
          const now = findFSItem("now");
          if (now) openItem(now);
        },
      },
      {
        type: "action",
        label: "Guestbook",
        action: () => {
          const gb = findFSItem("guestbook");
          if (gb) openItem(gb);
        },
      },
      {
        type: "action",
        label: "Contact",
        action: () => {
          const c = findFSItem("contact");
          if (c) openItem(c);
        },
      },
      { type: "separator" },
      {
        type: "action",
        label: "Recipes",
        action: () => {
          const r = findFSItem("recipes");
          if (r) openItem(r);
        },
      },
      {
        type: "action",
        label: "Photos",
        action: () => {
          const p = findFSItem("photos");
          if (p) openItem(p);
        },
      },
      {
        type: "action",
        label: "Linktree",
        action: () => openInBrowser("https://mckm.at/", "Linktree"),
      },
      { type: "separator" },
      {
        type: "action",
        label: "Close All Windows",
        action: () => dispatch({ type: "CLOSE_ALL_WINDOWS" }),
        disabled: !hasWindows,
      },
      {
        type: "action",
        label: "Reload OS",
        action: () => {
          sessionStorage.removeItem("mmck-booted");
          window.location.reload();
        },
      },
    ];

    return { "\uF8FF": osItems, File: fileItems, Edit: editItems, View: viewItems, Window: windowItems, Help: helpItems };
  }, [state, focusedWin, hasWindows, dispatch, openItem, closeWindow, toggleMaximize, minimizeWindow, rootItems, openInBrowser]);

  const menus = buildMenus();

  const themes: { value: Theme; label: string; icon: React.ReactNode }[] = [
    { value: "light", label: "Light", icon: <Sun size={13} /> },
    { value: "dark", label: "Dark", icon: <Moon size={13} /> },
    { value: "system", label: "System", icon: <Monitor size={13} /> },
  ];

  // Focused window title for the apple menu area
  const activeTitle = focusedWin ? focusedWin.title : "";

  return (
    <div
      ref={barRef}
      className="fixed top-0 left-0 right-0 h-[22px] z-[10000]
                  flex items-center justify-between px-3
                  border-b select-none"
      style={{
        background: "var(--menubar-bg)",
        borderBottomColor: "var(--menubar-border)",
        backdropFilter: "saturate(180%) blur(20px)",
      }}
    >
      {/* Left: app name + menu items */}
      <div className="flex items-center gap-0">
        {Object.keys(menus).map((name) => (
          <div key={name} className="relative">
            <button
              className={`text-[11px] px-2 py-0.5 rounded
                         transition-colors duration-75 text-desktop-text
                         ${name === "\uF8FF" ? "font-bold tracking-wide" : "font-normal"}
                         ${activeMenu === name ? "bg-desktop-accent text-white" : "hover:bg-desktop-accent/20"}`}
              onMouseDown={() => setActiveMenu(activeMenu === name ? null : name)}
              onMouseEnter={() => { if (activeMenu) setActiveMenu(name); }}
            >
              {name === "\uF8FF" ? "McKenzie OS" : name}
            </button>
            {activeMenu === name && (
              <MenuDropdown
                items={menus[name]}
                onClose={() => setActiveMenu(null)}
              />
            )}
          </div>
        ))}

        {/* Active window title (subtle, like classic Mac) */}
        {activeTitle && (
          <span className="text-[11px] text-desktop-text-secondary ml-4 truncate max-w-[200px]">
            {activeTitle}
          </span>
        )}
      </div>

      {/* Right: theme toggle + clock */}
      <div className="flex items-center gap-2">
        <div ref={themeRef} className="relative">
          <button
            onClick={() => setShowThemeMenu(!showThemeMenu)}
            className="p-0.5 rounded hover:bg-desktop-border/50 transition-colors"
            aria-label="Change theme"
          >
            {state.resolvedTheme === "dark" ? (
              <Moon size={12} />
            ) : (
              <Sun size={12} />
            )}
          </button>
          {showThemeMenu && (
            <div
              className="absolute right-0 top-full mt-1
                          bg-desktop-surface border border-desktop-border
                          rounded-lg shadow-xl py-1 min-w-[110px] animate-fade-in"
            >
              {themes.map((t) => (
                <button
                  key={t.value}
                  onClick={() => {
                    dispatch({
                      type: "SET_THEME",
                      payload: { theme: t.value },
                    });
                    setShowThemeMenu(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-1 text-[11px]
                    hover:bg-desktop-accent hover:text-white transition-colors
                    ${
                      state.theme === t.value
                        ? "text-desktop-accent font-medium"
                        : "text-desktop-text"
                    }`}
                >
                  {t.icon}
                  {t.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <Clock />
      </div>
    </div>
  );
}
