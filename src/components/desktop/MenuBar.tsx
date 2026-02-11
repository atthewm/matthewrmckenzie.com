"use client";

import React, { useState, useRef, useEffect } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { useDesktop, type Theme } from "@/hooks/useDesktopStore";

// ============================================================================
// MENU BAR
// ============================================================================
// Top bar with site name, clock, and theme toggle.
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

  return <span className="text-xs font-medium tabular-nums">{time}</span>;
}

export default function MenuBar() {
  const { state, dispatch } = useDesktop();
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on click outside
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
    { value: "light", label: "Light", icon: <Sun size={14} /> },
    { value: "dark", label: "Dark", icon: <Moon size={14} /> },
    { value: "system", label: "System", icon: <Monitor size={14} /> },
  ];

  return (
    <div className="fixed top-0 left-0 right-0 h-7 z-[10000]
                    flex items-center justify-between px-4
                    bg-desktop-surface/70 backdrop-blur-xl
                    border-b border-desktop-border/50
                    text-desktop-text select-none">
      {/* Left: site name */}
      <div className="text-xs font-semibold tracking-wide">
        matthewrmckenzie.com
      </div>

      {/* Right: theme + clock */}
      <div className="flex items-center gap-3">
        {/* Theme toggle */}
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setShowThemeMenu(!showThemeMenu)}
            className="p-1 rounded hover:bg-desktop-border/50 transition-colors"
            aria-label="Change theme"
          >
            {state.resolvedTheme === "dark" ? <Moon size={13} /> : <Sun size={13} />}
          </button>
          {showThemeMenu && (
            <div className="absolute right-0 top-full mt-1
                            bg-desktop-surface border border-desktop-border
                            rounded-lg shadow-xl py-1 min-w-[120px] animate-fade-in">
              {themes.map((t) => (
                <button
                  key={t.value}
                  onClick={() => {
                    dispatch({ type: "SET_THEME", payload: { theme: t.value } });
                    setShowThemeMenu(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs
                    hover:bg-desktop-border/50 transition-colors
                    ${state.theme === t.value ? "text-desktop-accent font-medium" : "text-desktop-text"}`}
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
