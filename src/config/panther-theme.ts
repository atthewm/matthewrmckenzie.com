// ============================================================================
// PANTHER THEME - Mac OS X 10.3 Aqua Design Tokens
// ============================================================================
// Brushed metal gradients, traffic light colors, glossy Aqua buttons,
// Lucida Grande typography, and the signature Panther look.
// ============================================================================

export const panther = {
  // Traffic light button colors
  trafficLight: {
    close: { from: "#FF6458", to: "#FF3B30", border: "rgba(180,40,30,0.5)" },
    minimize: { from: "#FFC130", to: "#FFBD2E", border: "rgba(180,140,20,0.5)" },
    zoom: { from: "#2ACB42", to: "#28C840", border: "rgba(20,140,40,0.5)" },
    unfocused: "#D4D4D4",
    size: 12,
    gap: 8,
  },

  // Window chrome
  window: {
    borderRadius: 10,
    titleBarHeight: 22,
    focused: {
      bg: "linear-gradient(180deg, #E8E8E8 0%, #CFCFCF 45%, #B8B8B8 55%, #C8C8C8 100%)",
      shadow: "0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.10)",
      border: "rgba(0,0,0,0.35)",
    },
    unfocused: {
      bg: "linear-gradient(180deg, #F0F0F0 0%, #E8E8E8 100%)",
      shadow: "0 2px 12px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)",
      border: "rgba(0,0,0,0.15)",
    },
    divider: "rgba(0,0,0,0.15)",
  },

  // Typography - Lucida Grande-like stack
  font: {
    system: '"Lucida Grande", "Lucida Sans Unicode", "Helvetica Neue", Helvetica, Arial, sans-serif',
    titleSize: "13px",
    titleWeight: 600,
    bodySize: "13px",
  },

  // Dock
  dock: {
    bg: "rgba(255,255,255,0.25)",
    bgDark: "rgba(40,40,44,0.35)",
    border: "rgba(255,255,255,0.4)",
    borderDark: "rgba(255,255,255,0.08)",
    blur: 28,
    insetHighlight: "inset 0 1px 0 rgba(255,255,255,0.45)",
    insetHighlightDark: "inset 0 1px 0 rgba(255,255,255,0.08)",
    shadow: "0 4px 24px rgba(0,0,0,0.18), 0 1px 6px rgba(0,0,0,0.12)",
  },

  // Menu bar
  menuBar: {
    bg: "rgba(241,241,241,0.92)",
    bgDark: "rgba(40,40,44,0.92)",
    border: "#B0B0B0",
    borderDark: "#444448",
    blur: 24,
  },

  // Colors
  colors: {
    accent: "#2F6AE5",
    accentDark: "#5BA3FF",
    surface: "#FFFFFF",
    surfaceDark: "#2E2E32",
    desktopBg: "#4A7DC7",
    desktopBgDark: "#1E2530",
    text: "#1A1A1A",
    textDark: "#F0F0F0",
    textSecondary: "#6E6E73",
    textSecondaryDark: "#98989D",
    border: "#D2D2D7",
    borderDark: "#48484A",
  },

  // Scrollbar
  scrollbar: {
    width: 8,
    trackBg: "rgba(0,0,0,0.04)",
    thumbBg: "rgba(0,0,0,0.18)",
    thumbHover: "rgba(0,0,0,0.32)",
  },
} as const;
