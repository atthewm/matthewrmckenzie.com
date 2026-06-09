// ============================================================================
// Z-INDEX SCALE - single source of truth for desktop stacking order
// ============================================================================
// Consumed by tailwind.config.ts (generates z-base, z-sticky, z-dock, ...)
// and imported directly where a numeric value is needed in inline styles
// (Screensaver, DesktopIcon, FloatingStickies).
//
// Layers, bottom to top:
//   base        desktop icons at rest; windows stack dynamically from
//               useDesktopStore (nextZIndex starts at 1) within this band
//   sticky      floating stickies; each focus bumps a counter from this base
//   dock        the Dock shelf (a dragged desktop icon sits at dock - 1)
//   menubar     top menu bar; its dropdowns layer locally inside it
//   modal       in-app full-screen overlays (e.g. image lightbox)
//   contextmenu right-click context menu
//   spotlight   Spotlight search overlay
//   expose      Exposé window picker overlay
//   screensaver screensaver covers all chrome
//   boot        boot splash; also top-level chrome that must beat everything
//               below it (skip link, toast notifications)
//   shutdown    shutdown sequence covers even the boot splash
// ============================================================================

export const Z_INDEX = {
  base: 1,
  sticky: 100,
  dock: 9000,
  menubar: 9100,
  modal: 9200,
  contextmenu: 9300,
  spotlight: 9400,
  expose: 9500,
  screensaver: 9600,
  boot: 9700,
  shutdown: 9800,
} as const;

export type ZIndexLevel = keyof typeof Z_INDEX;
