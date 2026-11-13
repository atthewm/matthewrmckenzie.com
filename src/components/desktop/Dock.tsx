"use client";

import React, { useState, useCallback, useRef } from "react";
import {
  motion,
  useAnimate,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from "motion/react";
import { dockItemIds, findFSItem, type FSItem } from "@/data/fs";
import { useDesktop } from "@/hooks/useDesktopStore";
import { PantherIcon } from "./PantherIcons";
import { trackEvent } from "@/lib/analytics";
import { springs, setLaunchOrigin } from "@/lib/motion";

// ============================================================================
// DOCK
// ============================================================================
// Glass shelf at the bottom of the desktop. Hover magnification follows the
// pointer on a snappy spring, an app bounces while it opens, and open apps
// get a glowing dot. Keyboard: a roving tab stop with arrow keys (WAI-ARIA
// toolbar). Reduced motion turns magnification and the bounce off.
// ============================================================================

const ICON = 48;
const MAX_SCALE = 1.55;
const REACH = 140;

function DockTooltip({ label, visible }: { label: string; visible: boolean }) {
  return (
    <span
      className="dock-tooltip"
      style={{ opacity: visible ? 1 : 0, transform: `translate(-50%, ${visible ? 0 : 4}px)` }}
      aria-hidden="true"
    >
      {label}
    </span>
  );
}

interface DockIconProps {
  item: FSItem;
  mouseX: MotionValue<number>;
  isOpen: boolean;
  tabIndex: number;
  pressed?: boolean;
  reduceMotion: boolean;
  onActivate: (item: FSItem, el: HTMLElement | null, bounce: () => void) => void;
  onFocus: () => void;
  buttonRef: (el: HTMLButtonElement | null) => void;
}

function DockIcon({ item, mouseX, isOpen, tabIndex, pressed, reduceMotion, onActivate, onFocus, buttonRef }: DockIconProps) {
  const ref = useRef<HTMLButtonElement | null>(null);
  const [artScope, animate] = useAnimate<HTMLSpanElement>();
  const [hovered, setHovered] = useState(false);

  const distance = useTransform(mouseX, (x) => {
    const el = ref.current;
    if (!el || x === Infinity) return REACH * 2;
    const r = el.getBoundingClientRect();
    return x - (r.left + r.width / 2);
  });
  const target = useTransform(distance, [-REACH, 0, REACH], [1, MAX_SCALE, 1], { clamp: true });
  const scale = useSpring(target, springs.snappy);
  const lift = useTransform(scale, (s) => -(s - 1) * 22);

  const bounce = useCallback(() => {
    if (reduceMotion || !artScope.current) return;
    animate(artScope.current, { y: [0, -18, 0, -9, 0, -3, 0] }, { duration: 1.1, ease: "easeOut" });
  }, [animate, artScope, reduceMotion]);

  return (
    <motion.button
      ref={(el) => {
        ref.current = el;
        buttonRef(el);
      }}
      data-dock-id={item.id}
      className="dock-item relative flex flex-col items-center rounded-lg"
      style={reduceMotion ? undefined : { scale, y: lift, transformOrigin: "50% 100%" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => {
        setHovered(true);
        onFocus();
      }}
      onBlur={() => setHovered(false)}
      onClick={() => onActivate(item, ref.current, bounce)}
      tabIndex={tabIndex}
      aria-pressed={pressed}
      aria-label={`Open ${item.name}`}
    >
      <DockTooltip label={item.name} visible={hovered} />
      <span ref={artScope} className="flex items-center justify-center" style={{ width: ICON, height: ICON }}>
        <PantherIcon itemId={item.id} size={ICON - 4} />
      </span>
      <span className="dock-dot" style={{ opacity: isOpen ? 1 : 0 }} aria-hidden="true" />
    </motion.button>
  );
}

interface DockProps {
  onStickiesToggle?: () => void;
  stickiesActive?: boolean;
  /** Larger, in-flow dock for the bottom screen of the Duo laptop pose. */
  large?: boolean;
}

export default function Dock({ onStickiesToggle, stickiesActive, large = false }: DockProps = {}) {
  const { state, openItem, focusWindow, restoreWindow } = useDesktop();
  const reduceMotion = !!useReducedMotion();
  const mouseX = useMotionValue(Infinity);
  const [rovingIndex, setRovingIndex] = useState(0);
  const itemButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const entries: ({ type: "sep" } | { type: "item"; item: FSItem; index: number })[] = [];
  let count = 0;
  for (const id of dockItemIds) {
    if (id === "|") {
      entries.push({ type: "sep" });
      continue;
    }
    const item = findFSItem(id);
    if (item) entries.push({ type: "item", item, index: count++ });
  }
  const active = Math.min(rovingIndex, Math.max(0, count - 1));

  const focusItemAt = useCallback((index: number) => {
    setRovingIndex(index);
    itemButtonRefs.current[index]?.focus();
  }, []);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (count === 0) return;
      const moves: Record<string, number> = {
        ArrowRight: (active + 1) % count,
        ArrowLeft: (active - 1 + count) % count,
        Home: 0,
        End: count - 1,
      };
      if (e.key in moves) {
        e.preventDefault();
        focusItemAt(moves[e.key]);
      }
    },
    [count, active, focusItemAt],
  );

  const activate = useCallback(
    (item: FSItem, el: HTMLElement | null, bounce: () => void) => {
      trackEvent("app_opened", { app: item.id, source: "dock" });
      if (item.id === "stickies" && onStickiesToggle) {
        onStickiesToggle();
        return;
      }
      if (item.type === "link" && item.href) {
        window.open(item.href, "_blank", "noopener,noreferrer");
        return;
      }
      const existing = state.windows.find((w) => w.fsItemId === item.id);
      if (existing) {
        if (existing.isMinimized) restoreWindow(existing.id);
        else focusWindow(existing.id);
        return;
      }
      bounce();
      setLaunchOrigin(item.id, el);
      openItem(item);
    },
    [state.windows, openItem, focusWindow, restoreWindow, onStickiesToggle],
  );

  return (
    <div
      role="toolbar"
      aria-label="Dock"
      aria-orientation="horizontal"
      onKeyDown={onKeyDown}
      onMouseMove={(e) => mouseX.set(e.clientX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={`dock-shelf ${large ? "is-large" : ""}`}
    >
      {entries.map((entry, i) => {
        if (entry.type === "sep") return <span key={`sep-${i}`} className="dock-sep" aria-hidden="true" />;
        const { item, index } = entry;
        const isOpen = item.id === "stickies" ? !!stickiesActive : state.windows.some((w) => w.fsItemId === item.id);
        const isFocused =
          item.id === "stickies"
            ? !!stickiesActive
            : state.windows.some((w) => w.fsItemId === item.id && state.focusedWindowId === w.id && !w.isMinimized);
        return (
          <DockIcon
            key={item.id}
            item={item}
            mouseX={mouseX}
            isOpen={isOpen}
            tabIndex={index === active ? 0 : -1}
            pressed={item.type === "link" ? undefined : isFocused}
            reduceMotion={reduceMotion}
            onActivate={activate}
            onFocus={() => setRovingIndex(index)}
            buttonRef={(el) => {
              itemButtonRefs.current[index] = el;
            }}
          />
        );
      })}
    </div>
  );
}
