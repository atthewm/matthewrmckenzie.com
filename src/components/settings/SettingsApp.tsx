"use client";

import React, { useState } from "react";
import { useSettings, type FontFamily } from "@/hooks/useSettingsStore";
import { zenThemes } from "@/config/themes";

// ============================================================================
// SETTINGS APP
// ============================================================================
// Tabbed settings panel: Appearance, Sound, Typography.
// All changes apply instantly and persist via the SettingsProvider.
// ============================================================================

type Tab = "appearance" | "sound" | "typography";

export default function SettingsApp() {
  const { settings, updateSettings, resetSettings } = useSettings();
  const [activeTab, setActiveTab] = useState<Tab>("appearance");

  const tabs: { id: Tab; label: string }[] = [
    { id: "appearance", label: "Appearance" },
    { id: "sound", label: "Sound" },
    { id: "typography", label: "Typography" },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Tab bar */}
      <div className="flex border-b border-gray-200 bg-gray-50 shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex-1 py-2 text-xs font-semibold text-center transition-colors
              ${activeTab === tab.id
                ? "text-blue-600 border-b-2 border-blue-600 bg-white"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-auto p-4 space-y-5">
        {activeTab === "appearance" && <AppearanceTab />}
        {activeTab === "sound" && <SoundTab />}
        {activeTab === "typography" && <TypographyTab />}

        {/* Reset */}
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={resetSettings}
            className="text-xs text-red-500 hover:text-red-700 transition-colors"
          >
            Reset all settings to defaults
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- APPEARANCE TAB ----------

function AppearanceTab() {
  const { settings, updateSettings } = useSettings();

  return (
    <div className="space-y-4">
      <SectionLabel>Theme</SectionLabel>
      <div className="grid grid-cols-2 gap-2">
        {zenThemes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => updateSettings({ zenThemeId: theme.id })}
            className={`
              p-2.5 rounded-lg border text-left transition-all text-xs
              ${settings.zenThemeId === theme.id
                ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                : "border-gray-200 hover:border-gray-300 bg-white"
              }
            `}
          >
            <div className="font-semibold text-gray-800">{theme.name}</div>
            <div className="text-gray-500 mt-0.5">{theme.description}</div>
          </button>
        ))}
      </div>

      <ToggleRow
        label="Zen Mode"
        description="Enable video/image background"
        checked={settings.zenModeEnabled}
        onChange={(v) => updateSettings({ zenModeEnabled: v })}
      />

      <SliderRow
        label="Background Blur"
        value={settings.backgroundBlur}
        min={0} max={20} step={1}
        unit="px"
        onChange={(v) => updateSettings({ backgroundBlur: v })}
      />

      <SliderRow
        label="Background Dim"
        value={settings.backgroundDim}
        min={0} max={80} step={5}
        unit="%"
        onChange={(v) => updateSettings({ backgroundDim: v })}
      />

      <ToggleRow
        label="Reduce Motion"
        description="Use still images instead of video"
        checked={settings.reduceMotion}
        onChange={(v) => updateSettings({ reduceMotion: v })}
      />

      <SectionLabel>Icon Size</SectionLabel>
      <div className="flex gap-2">
        {(["small", "medium", "large"] as const).map((size) => (
          <button
            key={size}
            onClick={() => updateSettings({ iconSize: size })}
            className={`
              px-3 py-1.5 rounded text-xs font-medium capitalize transition-all
              ${settings.iconSize === size
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }
            `}
          >
            {size}
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------- SOUND TAB ----------

function SoundTab() {
  const { settings, updateSettings } = useSettings();

  return (
    <div className="space-y-4">
      <ToggleRow
        label="Ambient Sound"
        description="Play nature audio with Zen themes (off by default)"
        checked={settings.ambientSoundEnabled}
        onChange={(v) => updateSettings({ ambientSoundEnabled: v })}
      />

      <SliderRow
        label="Ambient Volume"
        value={settings.ambientVolume}
        min={0} max={100} step={5}
        unit="%"
        onChange={(v) => updateSettings({ ambientVolume: v })}
        disabled={!settings.ambientSoundEnabled}
      />

      <ToggleRow
        label="UI Sounds"
        description="Play sounds on window open, close, etc."
        checked={settings.uiSoundsEnabled}
        onChange={(v) => updateSettings({ uiSoundsEnabled: v })}
      />

      {!settings.userHasInteracted && (
        <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
          Click or press a key anywhere first to enable audio playback (browser autoplay policy).
        </p>
      )}
    </div>
  );
}

// ---------- TYPOGRAPHY TAB ----------

function TypographyTab() {
  const { settings, updateSettings } = useSettings();

  const fontOptions: { value: FontFamily; label: string }[] = [
    { value: "system", label: "System (Inter)" },
    { value: "Georgia", label: "Georgia" },
    { value: "Times", label: "Times New Roman" },
    { value: "Verdana", label: "Verdana" },
    { value: "Trebuchet", label: "Trebuchet MS" },
    { value: "Courier", label: "Courier" },
  ];

  return (
    <div className="space-y-4">
      <SectionLabel>Font Family</SectionLabel>
      <select
        value={settings.fontFamily}
        onChange={(e) => updateSettings({ fontFamily: e.target.value as FontFamily })}
        className="w-full text-xs border border-gray-200 rounded-lg p-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {fontOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>

      <SliderRow
        label="Font Size"
        value={settings.fontSize}
        min={12} max={22} step={1}
        unit="px"
        onChange={(v) => updateSettings({ fontSize: v })}
      />

      <SliderRow
        label="Line Height"
        value={settings.lineHeight}
        min={1.2} max={2.0} step={0.1}
        onChange={(v) => updateSettings({ lineHeight: Math.round(v * 10) / 10 })}
      />

      <ToggleRow
        label="High Contrast"
        description="Increase text contrast and window opacity"
        checked={settings.highContrast}
        onChange={(v) => updateSettings({ highContrast: v })}
      />

      {/* Preview */}
      <div className="p-3 rounded-lg border border-gray-200 bg-white">
        <SectionLabel>Preview</SectionLabel>
        <p
          className="text-gray-700 mt-1"
          style={{
            fontFamily: "var(--user-font-family)",
            fontSize: "var(--user-font-size)",
            lineHeight: "var(--user-line-height)",
          }}
        >
          The quick brown fox jumps over the lazy dog. 0123456789.
        </p>
      </div>
    </div>
  );
}

// ---------- SHARED COMPONENTS ----------

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{children}</div>;
}

function ToggleRow({
  label, description, checked, onChange,
}: {
  label: string; description?: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <div className="text-xs font-semibold text-gray-700">{label}</div>
        {description && <div className="text-[10px] text-gray-400 mt-0.5">{description}</div>}
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`
          relative w-9 h-5 rounded-full transition-colors shrink-0
          ${checked ? "bg-blue-500" : "bg-gray-300"}
        `}
      >
        <span
          className={`
            absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform
            ${checked ? "translate-x-4" : "translate-x-0.5"}
          `}
        />
      </button>
    </div>
  );
}

function SliderRow({
  label, value, min, max, step, unit, onChange, disabled,
}: {
  label: string; value: number; min: number; max: number; step: number;
  unit?: string; onChange: (v: number) => void; disabled?: boolean;
}) {
  return (
    <div className={disabled ? "opacity-40 pointer-events-none" : ""}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold text-gray-700">{label}</span>
        <span className="text-[10px] text-gray-400 tabular-nums">
          {Number.isInteger(step) ? value : value.toFixed(1)}{unit || ""}
        </span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1 bg-gray-200 rounded-full appearance-none cursor-pointer accent-blue-500"
      />
    </div>
  );
}
