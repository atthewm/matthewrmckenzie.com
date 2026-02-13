"use client";

import React, { useState, useRef, useEffect } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { useDesktop, type Theme } from "@/hooks/useDesktopStore";

// ============================================================================
// MENU BAR (Classic Mac Style)
// ============================================================================
// Opaque top bar with bold app name, classic menu items (File, Edit, View,
// Window, Help), theme toggle, and clock.
// ============================================================================

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

const MENU_ITEMS = ["File", "Edit", "View", "Window", "Help"];

export default function MenuBar() {
  const { state, dispatch } = useDesktop();
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowThemeMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const themes: { value: Theme; label: string; icon: React.ReactNode }[] = [
    { value: "light", label: "Light", icon: <Sun size={13} /> },
    { value: "dark", label: "Dark", icon: <Moon size={13} /> },
    { value: "system", label: "System", icon: <Monitor size={13} /> },
  ];

  return (
    <div
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
        <span className="text-[11px] font-bold tracking-wide px-2">
          McKenzie OS
        </span>
        {MENU_ITEMS.map((item) => (
          <button
            key={item}
            className="text-[11px] font-normal px-2 py-0.5 rounded
                       hover:bg-desktop-accent hover:text-white
                       transition-colors duration-75 text-desktop-text"
          >
            {item}
          </button>
        ))}
      </div>

      {/* Right: theme toggle + clock */}
      <div className="flex items-center gap-2">
        <div ref={menuRef} className="relative">
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
