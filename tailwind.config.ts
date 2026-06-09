import type { Config } from "tailwindcss";
import { Z_INDEX } from "./src/lib/z-index";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "SF Pro Display",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "SF Mono",
          "Fira Code",
          "monospace",
        ],
      },
      colors: {
        desktop: {
          bg: "var(--desktop-bg)",
          surface: "var(--desktop-surface)",
          border: "var(--desktop-border)",
          text: "var(--desktop-text)",
          "text-secondary": "var(--desktop-text-secondary)",
          accent: "var(--desktop-accent)",
          dock: "var(--desktop-dock)",
        },
        menubar: {
          bg: "var(--menubar-bg)",
          border: "var(--menubar-border)",
        },
      },
      // Panther system type ramp. Font-size only (no line-height tuple) so
      // each token is a drop-in equivalent for the old arbitrary
      // text-[..px] values. Pixel units on purpose: desktop chrome is
      // pixel-true to Panther and must not scale with the root font-size
      // (the View menu zoom adjusts documentElement font-size). 12px stays
      // text-[12px] for now: Tailwind's text-xs would also set line-height
      // and shift tight chrome layouts.
      fontSize: {
        "4xs": "9px",  // fine print: boot captions, badges
        "3xs": "10px", // menu shortcuts, captions, status text
        "2xs": "11px", // system chrome: menus, dock, icon labels
        title: "13px", // window title bars, list/result titles
      },
      // Desktop chrome dimensions (design-system README section 2.3).
      // Pixel units for the same reason as fontSize above.
      spacing: {
        menubar: "22px",          // menu bar height
        titlebar: "22px",         // window title bar height
        "titlebar-mobile": "32px", // window title bar on touch
      },
      backdropBlur: {
        xs: "2px",
      },
      // Desktop stacking order. Values and documentation live in
      // src/lib/z-index.ts; this generates z-base, z-sticky, z-dock,
      // z-menubar, z-modal, z-contextmenu, z-spotlight, z-expose,
      // z-screensaver, z-boot, z-shutdown.
      zIndex: Object.fromEntries(
        Object.entries(Z_INDEX).map(([name, value]) => [name, String(value)])
      ),
      animation: {
        "window-open": "windowOpen 0.2s ease-out",
        "window-close": "windowClose 0.15s ease-in forwards",
        "window-minimize": "windowMinimize 0.35s cubic-bezier(0.4, 0, 0.2, 1) forwards",
        "window-restore": "windowRestore 0.3s cubic-bezier(0, 0, 0.2, 1)",
        "fade-in": "fadeIn 0.2s ease-out",
        "slide-up": "slideUp 0.25s ease-out",
        "dock-bounce": "dockBounce 0.3s ease-out",
      },
      keyframes: {
        windowOpen: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        windowClose: {
          "0%": { opacity: "1", transform: "scale(1)" },
          "100%": { opacity: "0", transform: "scale(0.95)" },
        },
        windowMinimize: {
          "0%": { opacity: "1", transform: "scale(1) translateY(0)" },
          "100%": { opacity: "0", transform: "scale(0.3) translateY(80vh)" },
        },
        windowRestore: {
          "0%": { opacity: "0", transform: "scale(0.3) translateY(80vh)" },
          "100%": { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        dockBounce: {
          "0%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
          "100%": { transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
