"use client";

// ============================================================================
// DESKTOP STORE - React Context + useReducer
// ============================================================================
// Central state management for all open windows, z-index ordering, theme,
// and localStorage persistence.
// ============================================================================

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useRef,
  type Dispatch,
} from "react";
import type { FSItem } from "@/data/fs";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface WindowState {
  id: string;
  fsItemId: string;
  title: string;
  icon: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  isMinimized: boolean;
  isMaximized: boolean;
  /** Store pre-maximize geometry so we can restore */
  preMaximize?: { x: number; y: number; width: number; height: number };
}

export type Theme = "light" | "dark" | "system";

export interface DesktopState {
  windows: WindowState[];
  nextZIndex: number;
  focusedWindowId: string | null;
  theme: Theme;
  resolvedTheme: "light" | "dark";
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export type DesktopAction =
  | { type: "OPEN_WINDOW"; payload: { fsItem: FSItem } }
  | { type: "CLOSE_WINDOW"; payload: { id: string } }
  | { type: "FOCUS_WINDOW"; payload: { id: string } }
  | { type: "MINIMIZE_WINDOW"; payload: { id: string } }
  | { type: "RESTORE_WINDOW"; payload: { id: string } }
  | { type: "MAXIMIZE_WINDOW"; payload: { id: string } }
  | { type: "UNMAXIMIZE_WINDOW"; payload: { id: string } }
  | { type: "MOVE_WINDOW"; payload: { id: string; x: number; y: number } }
  | { type: "RESIZE_WINDOW"; payload: { id: string; width: number; height: number; x?: number; y?: number } }
  | { type: "SET_THEME"; payload: { theme: Theme } }
  | { type: "SET_RESOLVED_THEME"; payload: { resolvedTheme: "light" | "dark" } }
  | { type: "HYDRATE"; payload: DesktopState };

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

export const initialDesktopState: DesktopState = {
  windows: [],
  nextZIndex: 1,
  focusedWindowId: null,
  theme: "system",
  resolvedTheme: "light",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getDefaultWindowPosition(index: number) {
  const base = 80;
  const offset = index * 30;
  return {
    x: base + offset,
    y: base + offset,
  };
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

export function desktopReducer(state: DesktopState, action: DesktopAction): DesktopState {
  switch (action.type) {
    case "OPEN_WINDOW": {
      const { fsItem } = action.payload;
      // If already open, focus it instead
      const existing = state.windows.find((w) => w.fsItemId === fsItem.id);
      if (existing) {
        return desktopReducer(state, {
          type: existing.isMinimized ? "RESTORE_WINDOW" : "FOCUS_WINDOW",
          payload: { id: existing.id },
        });
      }
      const pos = getDefaultWindowPosition(state.windows.length);
      const newWindow: WindowState = {
        id: `win-${fsItem.id}-${Date.now()}`,
        fsItemId: fsItem.id,
        title: fsItem.name,
        icon: fsItem.icon,
        x: pos.x,
        y: pos.y,
        width: fsItem.defaultSize?.width ?? 600,
        height: fsItem.defaultSize?.height ?? 450,
        zIndex: state.nextZIndex,
        isMinimized: false,
        isMaximized: false,
      };
      return {
        ...state,
        windows: [...state.windows, newWindow],
        nextZIndex: state.nextZIndex + 1,
        focusedWindowId: newWindow.id,
      };
    }

    case "CLOSE_WINDOW": {
      const filtered = state.windows.filter((w) => w.id !== action.payload.id);
      return {
        ...state,
        windows: filtered,
        focusedWindowId:
          state.focusedWindowId === action.payload.id
            ? filtered.length > 0
              ? filtered.reduce((a, b) => (a.zIndex > b.zIndex ? a : b)).id
              : null
            : state.focusedWindowId,
      };
    }

    case "FOCUS_WINDOW": {
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.id === action.payload.id ? { ...w, zIndex: state.nextZIndex } : w
        ),
        nextZIndex: state.nextZIndex + 1,
        focusedWindowId: action.payload.id,
      };
    }

    case "MINIMIZE_WINDOW": {
      const nextFocused = state.windows
        .filter((w) => w.id !== action.payload.id && !w.isMinimized)
        .sort((a, b) => b.zIndex - a.zIndex)[0];
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.id === action.payload.id ? { ...w, isMinimized: true } : w
        ),
        focusedWindowId: nextFocused?.id ?? null,
      };
    }

    case "RESTORE_WINDOW": {
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.id === action.payload.id
            ? { ...w, isMinimized: false, zIndex: state.nextZIndex }
            : w
        ),
        nextZIndex: state.nextZIndex + 1,
        focusedWindowId: action.payload.id,
      };
    }

    case "MAXIMIZE_WINDOW": {
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.id === action.payload.id
            ? {
                ...w,
                isMaximized: true,
                preMaximize: { x: w.x, y: w.y, width: w.width, height: w.height },
                x: 0,
                y: 0,
                width: typeof window !== "undefined" ? window.innerWidth : 1200,
                height: typeof window !== "undefined" ? window.innerHeight - 48 : 700,
                zIndex: state.nextZIndex,
              }
            : w
        ),
        nextZIndex: state.nextZIndex + 1,
        focusedWindowId: action.payload.id,
      };
    }

    case "UNMAXIMIZE_WINDOW": {
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.id === action.payload.id && w.preMaximize
            ? {
                ...w,
                isMaximized: false,
                x: w.preMaximize.x,
                y: w.preMaximize.y,
                width: w.preMaximize.width,
                height: w.preMaximize.height,
                preMaximize: undefined,
              }
            : w
        ),
      };
    }

    case "MOVE_WINDOW": {
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.id === action.payload.id
            ? { ...w, x: action.payload.x, y: action.payload.y, isMaximized: false, preMaximize: undefined }
            : w
        ),
      };
    }

    case "RESIZE_WINDOW": {
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.id === action.payload.id
            ? {
                ...w,
                width: Math.max(320, action.payload.width),
                height: Math.max(200, action.payload.height),
                ...(action.payload.x !== undefined ? { x: action.payload.x } : {}),
                ...(action.payload.y !== undefined ? { y: action.payload.y } : {}),
                isMaximized: false,
                preMaximize: undefined,
              }
            : w
        ),
      };
    }

    case "SET_THEME": {
      return { ...state, theme: action.payload.theme };
    }

    case "SET_RESOLVED_THEME": {
      return { ...state, resolvedTheme: action.payload.resolvedTheme };
    }

    case "HYDRATE": {
      return { ...action.payload };
    }

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

export interface DesktopContextValue {
  state: DesktopState;
  dispatch: Dispatch<DesktopAction>;
  openItem: (fsItem: FSItem) => void;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  toggleMaximize: (id: string) => void;
}

export const DesktopContext = createContext<DesktopContextValue | null>(null);

export function useDesktop(): DesktopContextValue {
  const ctx = useContext(DesktopContext);
  if (!ctx) throw new Error("useDesktop must be used within DesktopProvider");
  return ctx;
}

// ---------------------------------------------------------------------------
// Persistence
// ---------------------------------------------------------------------------

const STORAGE_KEY = "mmck-desktop-state";

export function saveState(state: DesktopState) {
  if (typeof window === "undefined") return;
  try {
    const serializable = {
      windows: state.windows,
      nextZIndex: state.nextZIndex,
      focusedWindowId: state.focusedWindowId,
      theme: state.theme,
      resolvedTheme: state.resolvedTheme,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
  } catch {
    // Storage full or unavailable
  }
}

export function loadState(): DesktopState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DesktopState;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Hook for persistence (debounced save)
// ---------------------------------------------------------------------------

export function usePersistence(state: DesktopState) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => saveState(state), 300);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [state]);
}

// ---------------------------------------------------------------------------
// Hook for theme resolution
// ---------------------------------------------------------------------------

export function useThemeResolver(
  theme: Theme,
  dispatch: Dispatch<DesktopAction>
) {
  useEffect(() => {
    function resolve() {
      let resolved: "light" | "dark" = "light";
      if (theme === "system") {
        resolved = window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
      } else {
        resolved = theme;
      }
      dispatch({ type: "SET_RESOLVED_THEME", payload: { resolvedTheme: resolved } });
    }
    resolve();

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if (theme === "system") resolve();
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme, dispatch]);
}
