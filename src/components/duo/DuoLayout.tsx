"use client";

import React, { useMemo } from "react";
import { motion, useReducedMotion } from "motion/react";
import { findFSItem } from "@/data/fs";
import { recipes } from "@/content/recipes/index";
import { useDesktop } from "@/hooks/useDesktopStore";
import { setDesktopViewport } from "@/lib/viewport";
import type { DuoState, Rect } from "@/lib/duo";
import { setDuoPreference } from "@/lib/duo";
import { springs, FADE } from "@/lib/motion";
import Desktop from "@/components/desktop/Desktop";
import Dock from "@/components/desktop/Dock";
import WindowContent from "@/components/desktop/WindowContent";
import { PantherIcon } from "@/components/desktop/PantherIcons";
import TurntableDeck from "@/components/apps/turntable/TurntableDeck";
import TurntablePlaylist from "@/components/apps/turntable/TurntablePlaylist";
import FoodRoomApp from "@/components/apps/FoodRoomApp";
import ChessApp from "@/components/apps/ChessApp";
import PhotoBoothApp from "@/components/apps/PhotoBoothApp";
import Trackpad from "./Trackpad";
import {
  WorkTop,
  ContactCard,
  HealthTop,
  HealthBottom,
  RecipeTop,
  RecipeBottom,
  FoodRoomBottom,
  ChessTop,
  PhotoBoothBottom,
} from "./DuoViews";

// ============================================================================
// DUO LAYOUT
// ============================================================================
// The site as a tiny laptop: the top screen (segment 0,0) is upright like a
// monitor, the bottom screen (segment 0,1) lies flat like a keyboard deck,
// and the fold between them stays empty. Each app supplies a top and a
// bottom view; anything without its own split shows the app on top and the
// dock and app switcher below. In the book pose the same two halves sit
// side by side, never across the fold.
// ============================================================================

type AppKey = "desktop" | "turntable" | "work" | "about" | "health" | "recipes" | "food-room" | "chess" | "photo-booth" | "other";

const WORK_IDS = new Set(["work", "resume", "work-overview"]);
const ABOUT_IDS = new Set(["about", "card", "contact"]);
/** Book pose reads content left, companion right. Where the laptop pose puts
 * the companion on top (the record, the chess clocks), the halves swap. */
const BOOK_SWAP = new Set<AppKey>(["turntable", "chess"]);
const HEALTH_IDS = new Set(["health", "health-overview", "life", "whoop-dashboard", "nutrition", "top-foods", "whoop-splits", "get-whoop"]);
const RECIPE_SLUGS = new Set(recipes.map((r) => r.slug));

function classify(fsItemId: string | undefined): AppKey {
  if (!fsItemId) return "desktop";
  if (fsItemId === "turntable") return "turntable";
  if (WORK_IDS.has(fsItemId)) return "work";
  if (ABOUT_IDS.has(fsItemId)) return "about";
  if (HEALTH_IDS.has(fsItemId) || fsItemId.startsWith("whoop-split-")) return "health";
  if (fsItemId === "recipes" || RECIPE_SLUGS.has(fsItemId)) return "recipes";
  if (fsItemId === "food-room") return "food-room";
  if (fsItemId === "chess") return "chess";
  if (fsItemId === "photo-booth") return "photo-booth";
  return "other";
}

function regionStyle(r: Rect): React.CSSProperties {
  return { left: r.x, top: r.y, width: r.width, height: r.height };
}

export default function DuoLayout({ duo, contentMap }: { duo: Exclude<DuoState, { mode: "off" }>; contentMap: Record<string, string> }) {
  const { state, dispatch } = useDesktop();
  const reduce = useReducedMotion();
  const first = duo.mode === "laptop" ? duo.top : duo.left;
  const second = duo.mode === "laptop" ? duo.bottom : duo.right;

  // Windows, boards, icons and Exposé measure the top screen, not the page.
  setDesktopViewport({ width: first.width, height: first.height });

  const focused = state.windows.find((w) => w.id === state.focusedWindowId && !w.isMinimized);
  const app = classify(focused?.fsItemId);
  const recipeSlug = focused && RECIPE_SLUGS.has(focused.fsItemId) ? focused.fsItemId : recipes[0]?.slug;
  const appName = focused ? findFSItem(focused.fsItemId)?.name ?? "" : "Desktop";

  const top = useMemo(() => {
    switch (app) {
      case "turntable":
        return <TurntableDeck />;
      case "work":
        return <WorkTop contentMap={contentMap} />;
      case "about":
        return focused ? (
          <div className="duo-app-frame">
            <WindowContent windowState={focused} contentMap={contentMap} />
          </div>
        ) : null;
      case "health":
        return <HealthTop />;
      case "recipes":
        return recipeSlug ? <RecipeTop slug={recipeSlug} /> : null;
      case "food-room":
        return <FoodRoomApp />;
      case "chess":
        return <ChessTop />;
      case "photo-booth":
        return <PhotoBoothApp part="camera" />;
      case "other":
        return focused ? (
          <div className="duo-app-frame">
            <WindowContent windowState={focused} contentMap={contentMap} />
          </div>
        ) : null;
      default:
        return null;
    }
  }, [app, contentMap, focused, recipeSlug]);

  const bottom = (() => {
    switch (app) {
      case "turntable":
        return <TurntablePlaylist compact />;
      case "work":
      case "about":
        return <ContactCard />;
      case "health":
        return <HealthBottom />;
      case "recipes":
        return recipeSlug ? <RecipeBottom slug={recipeSlug} /> : null;
      case "food-room":
        return <FoodRoomBottom />;
      case "chess":
        return <ChessApp />;
      case "photo-booth":
        return <PhotoBoothBottom />;
      default:
        return null;
    }
  })();

  const t = reduce ? FADE : springs.window;
  const swap = duo.mode === "book" && BOOK_SWAP.has(app) && bottom != null;
  const firstContent = swap ? bottom : top;
  const secondContent = swap ? top : bottom;

  return (
    <div className="duo-root" data-duo={duo.mode} data-duo-forced={duo.forced || undefined}>
      <h2 className="sr-only">Two screen layout</h2>
      <section className="duo-region duo-top" style={regionStyle(first)} aria-label={`${duo.mode === "book" ? "Left" : "Top"} screen: ${appName}`}>
        {app === "desktop" ? (
          <div className="duo-desktop">
            <Desktop contentMap={contentMap} hideDock />
          </div>
        ) : (
          <motion.div key={app} className="duo-fill" initial={{ opacity: 0.4, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={t}>
            {firstContent}
          </motion.div>
        )}
      </section>

      <section className="duo-region duo-bottom metal" style={regionStyle(second)} aria-label={duo.mode === "book" ? "Right screen" : "Bottom screen"}>
        <div className="duo-bottom-bar">
          <button
            type="button"
            className="aqua-button"
            onClick={() => dispatch({ type: "FOCUS_WINDOW", payload: { id: "" } })}
            disabled={app === "desktop"}
          >
            <span aria-hidden="true">‹</span> Desktop
          </button>
          <p className="duo-bottom-title">{appName}</p>
          {duo.forced && (
            <button type="button" className="aqua-button" onClick={() => setDuoPreference(false)}>
              Leave Duo Layout
            </button>
          )}
        </div>

        {secondContent ? (
          <motion.div key={app} className="duo-bottom-body" initial={{ opacity: 0.4 }} animate={{ opacity: 1 }} transition={t}>
            {secondContent}
          </motion.div>
        ) : (
          <div className="duo-bottom-body duo-desk">
            <Dock large />
            <div className="duo-switcher" role="group" aria-label="Open apps">
              {state.windows.length === 0 ? (
                <p className="duo-note">Open an app from the dock.</p>
              ) : (
                state.windows.map((w) => (
                  <button
                    key={w.id}
                    type="button"
                    className="duo-switch"
                    aria-pressed={w.id === state.focusedWindowId}
                    onClick={() => dispatch({ type: w.isMinimized ? "RESTORE_WINDOW" : "FOCUS_WINDOW", payload: { id: w.id } })}
                  >
                    <PantherIcon itemId={w.fsItemId} size={22} />
                    {w.title}
                  </button>
                ))
              )}
            </div>
            {app === "desktop" && duo.mode === "laptop" && <Trackpad topRect={first} />}
          </div>
        )}
      </section>
    </div>
  );
}
