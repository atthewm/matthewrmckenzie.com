"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { useDesktop, type Theme } from "@/hooks/useDesktopStore";
import { getRootItems, findFSItem, type FSItem } from "@/data/fs";
import { useOpenInBrowser } from "@/lib/browserStore";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useShutdown } from "./ShutdownContext";

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

  return <span className="text-2xs font-medium tabular-nums">{time}</span>;
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

/** Items that can take focus while arrowing through a menu. */
function canFocusItem(item: MenuItem): boolean {
  return item.type === "submenu" || (item.type === "action" && !item.disabled);
}

function MenuDropdown({
  items,
  label,
  onClose,
  initialFocus,
  onNavigate,
  onEscape,
}: {
  items: MenuItem[];
  label: string;
  onClose: () => void;
  /** "first"/"last" focus that item on open (keyboard); null keeps focus on the trigger (mouse). */
  initialFocus: "first" | "last" | null;
  /** Move to the adjacent top-level menu (ArrowLeft/ArrowRight inside the menu). */
  onNavigate: (direction: 1 | -1) => void;
  /** Close this menu and return focus to its menubar trigger (Escape). */
  onEscape: () => void;
}) {
  const itemRefs = useRef<(HTMLElement | null)[]>([]);

  const focusableEls = useCallback(() => {
    return items
      .map((item, i) => (canFocusItem(item) ? itemRefs.current[i] : null))
      .filter((el): el is HTMLElement => el !== null);
  }, [items]);

  const moveFocus = useCallback(
    (delta: 1 | -1) => {
      const els = focusableEls();
      if (els.length === 0) return;
      const current = els.indexOf(document.activeElement as HTMLElement);
      const next =
        current === -1
          ? delta === 1 ? 0 : els.length - 1
          : (current + delta + els.length) % els.length;
      els[next].focus();
    },
    [focusableEls]
  );

  // Keyboard-opened menus focus their first/last item; mouse-opened menus
  // leave focus on the trigger so hover browsing feels unchanged. Apply only
  // when the directive changes: parent re-renders rebuild the items array,
  // and re-running on identity churn would snap focus back to the first item.
  const lastAppliedFocus = useRef<"first" | "last" | null>(null);
  useEffect(() => {
    if (!initialFocus || lastAppliedFocus.current === initialFocus) return;
    lastAppliedFocus.current = initialFocus;
    const els = focusableEls();
    (initialFocus === "first" ? els[0] : els[els.length - 1])?.focus();
  }, [initialFocus, focusableEls]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        e.stopPropagation();
        moveFocus(1);
        break;
      case "ArrowUp":
        e.preventDefault();
        e.stopPropagation();
        moveFocus(-1);
        break;
      case "Home":
        e.preventDefault();
        e.stopPropagation();
        focusableEls()[0]?.focus();
        break;
      case "End": {
        e.preventDefault();
        e.stopPropagation();
        const els = focusableEls();
        els[els.length - 1]?.focus();
        break;
      }
      case "Escape":
        e.preventDefault();
        e.stopPropagation();
        onEscape();
        break;
      // ArrowRight on a closed submenu trigger is handled (and stopped) by
      // SubmenuItem; reaching here means move on to the adjacent menu.
      case "ArrowRight":
        e.preventDefault();
        e.stopPropagation();
        onNavigate(1);
        break;
      case "ArrowLeft":
        e.preventDefault();
        e.stopPropagation();
        onNavigate(-1);
        break;
      case "Tab":
        // Close and let the browser move focus out of the menubar.
        onClose();
        break;
    }
  };

  return (
    // The menubar root (fixed + z-menubar) establishes a stacking context, so
    // dropdown and submenu layering is local: standard z-10/z-20 suffice.
    <div
      role="menu"
      aria-label={label}
      onKeyDown={handleKeyDown}
      className="absolute left-0 top-full mt-0 min-w-[180px] py-1 rounded-b-md shadow-lg animate-fade-in z-10"
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
              role="separator"
              className="my-1 mx-2 border-t"
              style={{ borderColor: "var(--desktop-border)" }}
            />
          );
        }

        if (item.type === "submenu") {
          return (
            <SubmenuItem
              key={item.label}
              item={item}
              onClose={onClose}
              registerRef={(el) => { itemRefs.current[i] = el; }}
            />
          );
        }

        return (
          <button
            key={item.label}
            ref={(el) => { itemRefs.current[i] = el; }}
            role="menuitem"
            tabIndex={-1}
            onClick={() => {
              if (!item.disabled) {
                item.action();
                onClose();
              }
            }}
            disabled={item.disabled}
            className={`
              w-full flex items-center justify-between px-4 py-1 text-2xs text-left
              transition-colors duration-75
              ${item.disabled
                ? "text-desktop-text-secondary/50 cursor-default"
                : "text-desktop-text hover:bg-desktop-accent hover:text-white focus:bg-desktop-accent focus:text-white focus:outline-none"
              }
            `}
          >
            <span>{item.label}</span>
            {item.shortcut && (
              <span className="ml-6 text-3xs opacity-50">{item.shortcut}</span>
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
  registerRef,
}: {
  item: Extract<MenuItem, { type: "submenu" }>;
  onClose: () => void;
  /** Registers the submenu trigger with the parent menu's roving focus list. */
  registerRef: (el: HTMLElement | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const childRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const focusFirstOnOpen = useRef(false);

  // On mobile, toggle on click instead of hover
  const isMobileView = typeof window !== "undefined" && window.innerWidth < 768;

  useEffect(() => {
    if (open && focusFirstOnOpen.current) {
      focusFirstOnOpen.current = false;
      childRefs.current.find((el) => el !== null)?.focus();
    }
  }, [open]);

  const openWithKeyboard = () => {
    focusFirstOnOpen.current = true;
    setOpen(true);
  };

  const closeAndRefocusTrigger = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  const handleTriggerKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      e.stopPropagation();
      openWithKeyboard();
    }
  };

  const moveChildFocus = (delta: 1 | -1) => {
    const els = childRefs.current.filter((el): el is HTMLButtonElement => el !== null);
    if (els.length === 0) return;
    const current = els.indexOf(document.activeElement as HTMLButtonElement);
    const next =
      current === -1
        ? delta === 1 ? 0 : els.length - 1
        : (current + delta + els.length) % els.length;
    els[next].focus();
  };

  const handleSubmenuKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        e.stopPropagation();
        moveChildFocus(1);
        break;
      case "ArrowUp":
        e.preventDefault();
        e.stopPropagation();
        moveChildFocus(-1);
        break;
      // Close just the submenu and put focus back on its parent item.
      case "ArrowLeft":
      case "Escape":
        e.preventDefault();
        e.stopPropagation();
        closeAndRefocusTrigger();
        break;
      // ArrowRight and Tab bubble to the parent menu (next menu / exit).
    }
  };

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => { if (!isMobileView) setOpen(true); }}
      onMouseLeave={() => { if (!isMobileView) setOpen(false); }}
    >
      <div
        ref={(el) => { triggerRef.current = el; registerRef(el); }}
        role="menuitem"
        aria-haspopup="menu"
        aria-expanded={open}
        tabIndex={-1}
        onKeyDown={handleTriggerKeyDown}
        className="w-full flex items-center justify-between px-4 py-1 text-2xs
                   text-desktop-text hover:bg-desktop-accent hover:text-white
                   focus:bg-desktop-accent focus:text-white focus:outline-none
                   transition-colors duration-75 cursor-default"
        onClick={() => { if (isMobileView) setOpen(!open); }}
      >
        <span>{item.label}</span>
        <span className="text-3xs" aria-hidden="true">{open ? "\u25BE" : "\u25B8"}</span>
      </div>
      {open && (
        <div
          role="menu"
          aria-label={item.label}
          onKeyDown={handleSubmenuKeyDown}
          className={`${isMobileView ? "relative w-full" : "absolute left-full top-0"} min-w-[160px] py-1 rounded-md shadow-lg z-20`}
          style={{
            background: "var(--desktop-surface)",
            border: isMobileView ? "none" : "1px solid var(--desktop-border)",
            borderTop: isMobileView ? "1px solid var(--desktop-border)" : undefined,
          }}
        >
          {item.children.map((child, j) => {
            if (child.type === "separator") {
              return (
                <div
                  key={`sub-sep-${j}`}
                  role="separator"
                  className="my-1 mx-2 border-t"
                  style={{ borderColor: "var(--desktop-border)" }}
                />
              );
            }
            if (child.type === "action") {
              return (
                <button
                  key={child.label}
                  ref={(el) => { childRefs.current[j] = el; }}
                  role="menuitem"
                  tabIndex={-1}
                  onClick={() => {
                    child.action();
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between ${isMobileView ? "px-6" : "px-4"} py-1 text-2xs text-left
                             text-desktop-text hover:bg-desktop-accent hover:text-white
                             focus:bg-desktop-accent focus:text-white focus:outline-none
                             transition-colors duration-75`}
                >
                  <span>{child.label}</span>
                  {child.shortcut && (
                    <span className="ml-4 text-3xs opacity-50">{child.shortcut}</span>
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
  // Roving tab stop across the menubar triggers, plus whether an opening
  // dropdown should grab focus (keyboard) or leave it on the trigger (mouse).
  const [focusTopIndex, setFocusTopIndex] = useState(0);
  const [dropdownFocus, setDropdownFocus] = useState<"first" | "last" | null>(null);
  const triggerRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const openInBrowser = useOpenInBrowser();
  const isMobile = useIsMobile();
  const shutdown = useShutdown();

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
        label: "Links",
        action: () => openInBrowser("https://mckm.at/", "Links"),
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
        label: "Restart...",
        action: () => {
          sessionStorage.removeItem("mmck-booted");
          window.location.reload();
        },
      },
      {
        type: "action",
        label: "Shut Down...",
        action: () => shutdown(),
      },
    ];

    return { "\uF8FF": osItems, File: fileItems, Edit: editItems, View: viewItems, Window: windowItems, Help: helpItems };
  }, [state, focusedWin, hasWindows, dispatch, openItem, closeWindow, toggleMaximize, minimizeWindow, rootItems, openInBrowser, shutdown]);

  const menus = buildMenus();

  // On mobile, only show OS menu + Window menu to save space
  const visibleMenuKeys = isMobile
    ? ["\uF8FF", "Window"]
    : Object.keys(menus);

  // --- Menubar keyboard navigation (WAI-ARIA menubar pattern) ---
  const menuCount = visibleMenuKeys.length;
  // Keep the roving tab stop valid when the menu set shrinks (mobile).
  const activeTopIndex = Math.min(focusTopIndex, menuCount - 1);

  function openMenuFromMouse(name: string | null) {
    setDropdownFocus(null);
    setActiveMenu(name);
  }

  function openMenuFromKeyboard(index: number, focus: "first" | "last") {
    setFocusTopIndex(index);
    setDropdownFocus(focus);
    setActiveMenu(visibleMenuKeys[index]);
  }

  function navigateMenu(direction: 1 | -1) {
    const current = activeMenu ? visibleMenuKeys.indexOf(activeMenu) : activeTopIndex;
    openMenuFromKeyboard((current + direction + menuCount) % menuCount, "first");
  }

  function closeMenuAndRefocusTrigger() {
    const current = activeMenu ? visibleMenuKeys.indexOf(activeMenu) : activeTopIndex;
    setActiveMenu(null);
    triggerRefs.current[current]?.focus();
  }

  function handleTriggerKeyDown(e: React.KeyboardEvent, index: number) {
    switch (e.key) {
      case "ArrowRight":
      case "ArrowLeft": {
        e.preventDefault();
        const delta = e.key === "ArrowRight" ? 1 : -1;
        const next = (index + delta + menuCount) % menuCount;
        setFocusTopIndex(next);
        triggerRefs.current[next]?.focus();
        // With a menu open, browsing the menubar moves the open menu along.
        if (activeMenu) {
          setDropdownFocus(null);
          setActiveMenu(visibleMenuKeys[next]);
        }
        break;
      }
      case "ArrowDown":
      case "Enter":
      case " ":
        e.preventDefault();
        openMenuFromKeyboard(index, "first");
        break;
      case "ArrowUp":
        e.preventDefault();
        openMenuFromKeyboard(index, "last");
        break;
      case "Escape":
        if (activeMenu) {
          e.preventDefault();
          setActiveMenu(null);
        }
        break;
      case "Tab":
        // Let the browser move focus on; just close any open menu.
        if (activeMenu) setActiveMenu(null);
        break;
    }
  }

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
      className="fixed top-0 left-0 right-0 h-menubar z-menubar
                  flex items-center justify-between px-3
                  border-b select-none"
      style={{
        background: "var(--menubar-bg)",
        borderBottomColor: "var(--menubar-border)",
        backdropFilter: "saturate(180%) blur(20px)",
      }}
    >
      {/* Left: app name + menu items */}
      <div className="flex items-center gap-0 min-w-0">
        <div role="menubar" aria-label="Application menus" className="flex items-center gap-0">
          {visibleMenuKeys.map((name, index) => (
            <div key={name} role="none" className="relative shrink-0">
              <button
                ref={(el) => { triggerRefs.current[index] = el; }}
                role="menuitem"
                aria-haspopup="menu"
                aria-expanded={activeMenu === name}
                tabIndex={index === activeTopIndex ? 0 : -1}
                onFocus={() => setFocusTopIndex(index)}
                onKeyDown={(e) => handleTriggerKeyDown(e, index)}
                className={`text-2xs px-2 py-0.5 rounded
                           transition-colors duration-75 text-desktop-text
                           focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-desktop-accent
                           ${name === "\uF8FF" ? "font-bold tracking-wide" : "font-normal"}
                           ${activeMenu === name ? "bg-desktop-accent text-white" : "hover:bg-desktop-accent/20"}`}
                onMouseDown={() => openMenuFromMouse(activeMenu === name ? null : name)}
                onMouseEnter={() => { if (activeMenu) openMenuFromMouse(name); }}
              >
                {name === "\uF8FF" ? (isMobile ? "MCK_OS" : "McKenzie OS") : name}
              </button>
              {activeMenu === name && (
                <MenuDropdown
                  items={menus[name]}
                  label={name === "\uF8FF" ? "McKenzie OS" : name}
                  onClose={() => setActiveMenu(null)}
                  initialFocus={dropdownFocus}
                  onNavigate={navigateMenu}
                  onEscape={closeMenuAndRefocusTrigger}
                />
              )}
            </div>
          ))}
        </div>

        {/* Active window title (subtle, like classic Mac) - hidden on mobile */}
        {activeTitle && !isMobile && (
          <span className="text-2xs text-desktop-text-secondary ml-4 truncate max-w-[200px]">
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
            aria-haspopup="menu"
            aria-expanded={showThemeMenu}
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
                  className={`w-full flex items-center gap-2 px-3 py-1 text-2xs
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
