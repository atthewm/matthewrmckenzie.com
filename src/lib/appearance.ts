export type Appearance = "light" | "dark" | "system";

const APPEARANCE_KEY = "mmck-appearance";
export const APPEARANCE_EVENT = "mmck-appearance-change";

export function readAppearance(): Appearance {
  try {
    const stored = localStorage.getItem(APPEARANCE_KEY) || JSON.parse(localStorage.getItem("mmck-desktop-state") || "{}").theme;
    return stored === "light" || stored === "dark" ? stored : "system";
  } catch { return "system"; }
}

export function chooseAppearance(theme: Appearance) {
  document.documentElement.dataset.appearance = theme;
  document.documentElement.classList.toggle("dark", theme === "dark" || (theme === "system" && matchMedia("(prefers-color-scheme: dark)").matches));
  try { localStorage.setItem(APPEARANCE_KEY, theme); } catch { /* The current page still changes. */ }
  window.dispatchEvent(new CustomEvent(APPEARANCE_EVENT, { detail: theme }));
}

// Runs in the head of static HTML so a direct visit respects a saved preference before paint.
export const initialAppearanceScript = `try{var t=localStorage.getItem("${APPEARANCE_KEY}")||JSON.parse(localStorage.getItem("mmck-desktop-state")||"{}").theme;var r=document.documentElement;r.dataset.appearance=t==="dark"||t==="light"?t:"system";r.classList.toggle("dark",r.dataset.appearance==="dark"||(r.dataset.appearance==="system"&&matchMedia("(prefers-color-scheme:dark)").matches));}catch(e){}`;
