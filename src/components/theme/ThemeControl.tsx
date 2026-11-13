"use client";

import { useTheme, type ThemeChoice } from "@/lib/theme";

// ============================================================================
// THEME CONTROL
// ============================================================================
// Light, Dark, System as an Aqua segmented control. Used in the desktop menu
// bar and in the header of every static page.
// ============================================================================

const OPTIONS: { value: ThemeChoice; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

export default function ThemeControl({ size = "regular" }: { size?: "small" | "regular" }) {
  const { choice, setTheme } = useTheme();
  return (
    <div role="radiogroup" aria-label="Appearance" className={`aqua-segmented ${size === "small" ? "is-small" : ""}`}>
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={choice === o.value}
          onClick={() => setTheme(o.value)}
          className="aqua-segment"
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
