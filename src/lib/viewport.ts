// ============================================================================
// DESKTOP VIEWPORT
// ============================================================================
// The desktop normally fills the browser window. In the Duo laptop pose it
// fills only the top screen, so window placement, boards, icons and Exposé
// read their bounds from here instead of window.innerWidth/innerHeight.
// ============================================================================

let override: { width: number; height: number } | null = null;

export function setDesktopViewport(size: { width: number; height: number } | null) {
  override = size;
}

export function desktopViewport(): { width: number; height: number } {
  if (override) return override;
  if (typeof window === "undefined") return { width: 1440, height: 900 };
  return { width: window.innerWidth, height: window.innerHeight };
}
