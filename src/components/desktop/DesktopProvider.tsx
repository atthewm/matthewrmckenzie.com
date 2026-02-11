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
    setHydrated(true);
  }, []);

  // Persist state changes
  usePersistence(state);

  // Resolve theme
  useThemeResolver(state.theme, dispatch);

  // Apply theme class to document
  useEffect(() => {
    if (state.resolvedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [state.resolvedTheme]);

  // Action helpers
  const openItem = useCallback(
    (fsItem: FSItem) => {
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

  // Don't render until hydrated to prevent flash
  if (!hydrated) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950" />
    );
  }

  return (
    <DesktopContext.Provider value={contextValue}>
      {children}
    </DesktopContext.Provider>
  );
}
