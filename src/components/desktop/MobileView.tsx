"use client";

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useAnimate, useReducedMotion } from "motion/react";
import { getRootItems, findFSItem, type FSItem } from "@/data/fs";
import { useDesktop } from "@/hooks/useDesktopStore";
import { PantherIcon } from "./PantherIcons";
import WindowContent from "./WindowContent";
import BoardView from "@/components/board/BoardView";
import SlideToUnlock, { UNLOCK_KEY } from "./SlideToUnlock";
import { springs, FADE, setLaunchOrigin, peekLaunchOrigin } from "@/lib/motion";

// ============================================================================
// PHONE: iPhone OS 1 SPRINGBOARD
// ============================================================================
// Under 768 px the desktop becomes a springboard: status bar, glossy rounded
// icons in a 4 column grid across swipeable pages with page dots, and a dock
// of four (Work, Health, Recipes, Contact). The first visit shows slide to
// unlock once. Each app opens full screen with a top bar and a back button,
// zooming out of its icon and back into it. It shares the desktop store, so
// Spotlight, ?open= links and Start Here all work here too.
// ============================================================================

interface MobileViewProps {
  contentMap: Record<string, string>;
}

const DOCK_IDS = ["work", "health", "recipes", "contact"];
const ROW_HEIGHT = 100;

/** Gel tile colors, picked per app so neighbors differ. */
const TILES = [
  ["#7fb4f7", "#1f5fcf"],
  ["#9adf7c", "#2f8f2a"],
  ["#ffd67a", "#d78a0b"],
  ["#ff9d8f", "#c7362a"],
  ["#c6b0f5", "#6a47c7"],
  ["#8fe3e0", "#1b8f8a"],
  ["#f7f7f7", "#a9b0b9"],
  ["#5d6570", "#1d2228"],
];
function tileFor(id: string) {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return TILES[h % TILES.length];
}

function useClock() {
  const [t, setT] = useState("");
  useEffect(() => {
    const tick = () => setT(new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }));
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, []);
  return t;
}

function StatusBar() {
  const time = useClock();
  return (
    <div className="status-bar" aria-hidden="true">
      <span>McKenzie</span>
      <span className="font-semibold">{time}</span>
      <span className="status-battery">
        <span />
      </span>
    </div>
  );
}

function AppTile({ item, index, onOpen }: { item: FSItem; index: number; onOpen: (item: FSItem, el: HTMLElement) => void }) {
  const reduce = useReducedMotion();
  const [a, b] = tileFor(item.id);
  return (
    <motion.button
      type="button"
      className="sb-app"
      onClick={(e) => onOpen(item, e.currentTarget.querySelector(".sb-tile") as HTMLElement)}
      aria-label={`Open ${item.name}`}
      initial={reduce ? false : { scale: 0.6 }}
      animate={{ scale: 1 }}
      transition={reduce ? FADE : { ...springs.snappy, delay: 0.02 * index }}
      whileTap={{ scale: 0.92 }}
    >
      <span className="sb-tile" style={{ background: `linear-gradient(180deg, ${a} 0%, ${b} 100%)` }}>
        <PantherIcon itemId={item.id} size={44} />
      </span>
      <span className="sb-label">{item.shortName ?? item.name}</span>
    </motion.button>
  );
}

function AppScreen({
  item,
  top,
  contentMap,
  onBack,
  onOpen,
}: {
  item: FSItem;
  top: NonNullable<ReturnType<typeof useDesktop>["state"]["windows"][number]>;
  contentMap: Record<string, string>;
  onBack: () => void;
  onOpen: (item: FSItem) => void;
}) {
  const reduce = useReducedMotion();
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const origin = useRef(peekLaunchOrigin(item.id));

  // Zoom out of the icon (start pose written before paint).
  useLayoutEffect(() => {
    const el = scope.current;
    if (!el) return;
    const o = origin.current;
    if (reduce || !o) {
      el.style.opacity = "0";
      animate(el, { opacity: 1 }, FADE);
      return;
    }
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const s = o.width / vw;
    const x = o.x + o.width / 2 - vw / 2;
    const y = o.y + o.height / 2 - vh / 2;
    el.style.transform = `translateX(${x}px) translateY(${y}px) scale(${s})`;
    animate(el, { x: [x, 0], y: [y, 0], scale: [s, 1], borderRadius: ["40px", "0px"] }, springs.window);
    // mount only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function back() {
    const el = scope.current;
    const o = origin.current;
    if (el) {
      if (reduce || !o) await animate(el, { opacity: 0 }, FADE);
      else {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        await animate(
          el,
          { x: o.x + o.width / 2 - vw / 2, y: o.y + o.height / 2 - vh / 2, scale: o.width / vw, opacity: 0 },
          { ...springs.window, opacity: { duration: 0.25 } },
        );
      }
    }
    onBack();
  }

  return (
    <div ref={scope} className="app-screen" role="dialog" aria-label={item.name}>
      <div className="app-navbar">
        <button type="button" className="app-back" onClick={back}>
          <span aria-hidden="true">‹</span> Home
        </button>
        <h2 className="app-title">{item.name}</h2>
        <span className="w-[72px]" aria-hidden="true" />
      </div>
      <div className={`app-body ${item.type === "folder" ? "overflow-hidden" : "overflow-auto"}`}>
        {item.type === "folder" ? (
          <BoardView item={item} contentMap={contentMap} onOpen={onOpen} />
        ) : (
          <WindowContent windowState={top} contentMap={contentMap} />
        )}
      </div>
    </div>
  );
}

export default function MobileView({ contentMap }: MobileViewProps) {
  const { state, openItem, closeWindow, dispatch } = useDesktop();
  const startedRef = useRef(false);
  const homeRef = useRef<HTMLDivElement>(null);
  const pagerRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  // Decided on first render (this view is client only) so a first visit
  // never flashes the springboard before the lock screen.
  const [locked, setLocked] = useState(() => {
    try {
      if (new URLSearchParams(window.location.search).get("open")) return false;
      return !localStorage.getItem(UNLOCK_KEY);
    } catch {
      return false;
    }
  });

  // Start every visit on the home screen at the very top (browsers otherwise
  // restore an old offset past the header), honor ?open=<id>, and show the
  // lock screen on the first visit only.
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    dispatch({ type: "CLOSE_ALL_WINDOWS" });
    const params = new URLSearchParams(window.location.search);
    const id = params.get("open");
    const item = id ? findFSItem(id) : undefined;
    if (item) {
      openItem(item);
      window.history.replaceState({}, "", "/");
    }
  }, [dispatch, openItem]);

  // Rows per page from the screen height: status bar, dots and dock take
  // about 170 px; each icon row is 100 px.
  const [perPage] = useState(() => {
    const rows = Math.max(3, Math.min(6, Math.floor((window.innerHeight - 170) / ROW_HEIGHT)));
    return rows * 4;
  });
  const pages = useMemo(() => {
    const root = getRootItems().filter((i) => !DOCK_IDS.includes(i.id));
    const more = findFSItem("more")?.children ?? [];
    const all = [...root, ...more];
    const out: FSItem[][] = [];
    for (let i = 0; i < all.length; i += perPage) out.push(all.slice(i, i + perPage));
    return out;
  }, [perPage]);
  const dockItems = DOCK_IDS.map((id) => findFSItem(id)).filter(Boolean) as FSItem[];

  const top = useMemo(
    () => [...state.windows].filter((w) => !w.isMinimized).sort((a, b) => b.zIndex - a.zIndex)[0],
    [state.windows],
  );
  const currentItem = top ? findFSItem(top.fsItemId) : undefined;

  function open(item: FSItem, el?: HTMLElement | null) {
    if (item.type === "link" && item.href) {
      window.open(item.href, "_blank", "noopener,noreferrer");
      return;
    }
    if (el) setLaunchOrigin(item.id, el);
    openItem(item);
  }

  function onPagerScroll() {
    const el = pagerRef.current;
    if (el) setPage(Math.round(el.scrollLeft / el.clientWidth));
  }

  return (
    <div ref={homeRef} className="springboard">
      <StatusBar />
      <h2 className="sr-only">Home screen</h2>
      {/* While the lock screen is up, the icons wait: they spring in on unlock. */}
      {!locked && (
      <>
      <div ref={pagerRef} className="sb-pager" onScroll={onPagerScroll}>
        {pages.map((items, p) => (
          <div key={p} className="sb-page" aria-label={`Page ${p + 1} of ${pages.length}`} role="group">
            {items.map((item, i) => (
              <AppTile key={item.id} item={item} index={i} onOpen={open} />
            ))}
          </div>
        ))}
      </div>
      <div className="sb-dots" aria-hidden="true">
        {pages.map((_, p) => (
          <span key={p} data-active={p === page || undefined} />
        ))}
      </div>
      <nav className="sb-dock" aria-label="Dock">
        {dockItems.map((item, i) => (
          <AppTile key={item.id} item={item} index={i} onOpen={open} />
        ))}
      </nav>
      </>
      )}

      <AnimatePresence>{locked && <SlideToUnlock key="lock" onUnlock={() => setLocked(false)} />}</AnimatePresence>

      {top && currentItem && (
        <AppScreen
          key={top.id}
          item={currentItem}
          top={top}
          contentMap={contentMap}
          onBack={() => closeWindow(top.id)}
          onOpen={(i) => open(i)}
        />
      )}
    </div>
  );
}
