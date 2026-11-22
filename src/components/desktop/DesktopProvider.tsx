"use client";

import React, { useReducer, useCallback, useEffect, useState } from "react";
import {
  DesktopContext,
  desktopReducer,
  initialDesktopState,
  loadState,
  usePersistence,
  useThemeResolver,
  type DesktopContextValue,
} from "@/hooks/useDesktopStore";
import type { FSItem } from "@/data/fs";
import { APPEARANCE_EVENT, readAppearance, type Appearance } from "@/lib/appearance";
import { trackEvent } from "@/lib/analytics";

// ============================================================================
// DESKTOP PROVIDER
// ============================================================================
// Wraps the app with desktop state context. Handles hydration from
// localStorage and theme resolution.
// ============================================================================

export default function DesktopProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(desktopReducer, initialDesktopState);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const saved = loadState();
    if (saved) {
      dispatch({ type: "HYDRATE", payload: saved });
    }
    const restore = () => dispatch({ type: "SET_THEME", payload: { theme: readAppearance() } });
    restore();
    const update = (event: Event) => dispatch({ type: "SET_THEME", payload: { theme: (event as CustomEvent<Appearance>).detail } });
    window.addEventListener(APPEARANCE_EVENT, update);
    setHydrated(true);
    return () => window.removeEventListener(APPEARANCE_EVENT, update);
  }, []);

  // Persist state changes
  usePersistence(state);

  // Resolve theme
  useThemeResolver(state.theme, dispatch);

  // Apply theme class to document
  useEffect(() => {
    if (!hydrated) return;
    if (state.resolvedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [hydrated, state.resolvedTheme]);

  // Action helpers
  const openItem = useCallback(
    (fsItem: FSItem) => {
      trackEvent("app_opened", { app: fsItem.id, name: fsItem.name, type: fsItem.type });
      dispatch({ type: "OPEN_WINDOW", payload: { fsItem } });
    },
    [dispatch]
  );

  const closeWindow = useCallback(
    (id: string) => {
      dispatch({ type: "CLOSE_WINDOW", payload: { id } });
    },
    [dispatch]
  );

  const focusWindow = useCallback(
    (id: string) => {
      dispatch({ type: "FOCUS_WINDOW", payload: { id } });
    },
    [dispatch]
  );

  const minimizeWindow = useCallback(
    (id: string) => {
      dispatch({ type: "MINIMIZE_WINDOW", payload: { id } });
    },
    [dispatch]
  );

  const restoreWindow = useCallback(
    (id: string) => {
      dispatch({ type: "RESTORE_WINDOW", payload: { id } });
    },
    [dispatch]
  );

  const toggleMaximize = useCallback(
    (id: string) => {
      const win = state.windows.find((w) => w.id === id);
      if (win?.isMaximized) {
        dispatch({ type: "UNMAXIMIZE_WINDOW", payload: { id } });
      } else {
        dispatch({ type: "MAXIMIZE_WINDOW", payload: { id } });
      }
    },
    [state.windows, dispatch]
  );

  const contextValue: DesktopContextValue = {
    state,
    dispatch,
    openItem,
    closeWindow,
    focusWindow,
    minimizeWindow,
    restoreWindow,
    toggleMaximize,
  };

  // Don't render until hydrated to prevent flash. The server-rendered home
  // intro stays visible underneath until the desktop is ready to cover it.
  if (!hydrated) return null;

  return (
    <DesktopContext.Provider value={contextValue}>
      {children}
    </DesktopContext.Provider>
  );
}
