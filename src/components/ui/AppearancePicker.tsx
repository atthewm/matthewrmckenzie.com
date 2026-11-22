"use client";

import { useEffect, useState } from "react";
import { APPEARANCE_EVENT, chooseAppearance, readAppearance, type Appearance } from "@/lib/appearance";

export default function AppearancePicker() {
  const [appearance, setAppearance] = useState<Appearance>("system");
  useEffect(() => {
    const refresh = () => setAppearance(readAppearance());
    refresh();
    window.addEventListener(APPEARANCE_EVENT, refresh);
    return () => window.removeEventListener(APPEARANCE_EVENT, refresh);
  }, []);
  return (
    <label className="appearance-picker">
      <span>Appearance</span>
      <select aria-label="Appearance" value={appearance} onChange={(event) => {
        const next = event.target.value;
        if (next === "dark" || next === "light" || next === "system") { setAppearance(next); chooseAppearance(next); }
      }}>
        <option value="system">System</option><option value="light">Light</option><option value="dark">Graphite</option>
      </select>
    </label>
  );
}
