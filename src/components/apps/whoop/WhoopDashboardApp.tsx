"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  whoopStats,
  whoopScreenshots,
  statGroups,
  type WhoopScreenshot,
} from "@/data/whoop/dashboard";

// ============================================================================
// WHOOP DASHBOARD -- Mac OS 9 "System Profiler" Aesthetic
// ============================================================================
// Light gray beveled panels, Chicago-style fonts, inset borders, chunky
// pixel-art icons. Looks like Apple System Profiler circa 1999.
// ============================================================================

// ---------------------------------------------------------------------------
// Types for live API data
// ---------------------------------------------------------------------------

interface LiveDashboardData {
  connected: true;
  lastSynced: string;
  profile: {
    user_id: number;
    email: string;
    first_name: string;
    last_name: string;
  } | null;
  bodyMeasurement: {
    height_meter: number;
    weight_kilogram: number;
    max_heart_rate: number;
  } | null;
  latestRecovery: {
    cycle_id: number;
    sleep_id: number;
    user_id: number;
    score_state: string;
    score?: {
      user_calibrating: boolean;
      recovery_score: number;
      resting_heart_rate: number;
      hrv_rmssd_milli: number;
      spo2_percentage?: number;
      skin_temp_celsius?: number;
    };
  } | null;
  latestCycle: {
    id: number;
    start: string;
    end: string | null;
    score_state: string;
    score?: {
      strain: number;
      kilojoule: number;
      average_heart_rate: number;
      max_heart_rate: number;
    };
  } | null;
  latestSleep: {
    id: number;
    start: string;
    end: string;
    score_state: string;
    nap: boolean;
    score?: {
      stage_summary: {
        total_in_bed_time_milli: number;
        total_awake_time_milli: number;
        total_light_sleep_time_milli: number;
        total_slow_wave_sleep_time_milli: number;
        total_rem_sleep_time_milli: number;
        sleep_cycle_count: number;
        disturbance_count: number;
      };
      sleep_needed: {
        baseline_milli: number;
        need_from_sleep_debt_milli: number;
        need_from_recent_strain_milli: number;
        need_from_recent_nap_milli: number;
      };
      respiratory_rate?: number;
      sleep_performance_percentage?: number;
      sleep_consistency_percentage?: number;
      sleep_efficiency_percentage?: number;
    };
  } | null;
  recentWorkouts: Array<{
    id: number;
    start: string;
    end: string;
    sport_id: number;
    score_state: string;
    score?: {
      strain: number;
      average_heart_rate: number;
      max_heart_rate: number;
      kilojoule: number;
      percent_recorded: number;
    };
  }>;
}

type DashboardResponse = LiveDashboardData | { connected: false };

// ---------------------------------------------------------------------------
// OS 9 Retro SVG Icons (32x32 pixel-art style)
// ---------------------------------------------------------------------------

function HeartIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M16 28C16 28 4 20 4 12C4 7 8 4 12 4C14 4 16 5.5 16 5.5C16 5.5 18 4 20 4C24 4 28 7 28 12C28 20 16 28 16 28Z" fill="#FF6B6B" stroke="#333" strokeWidth="2" strokeLinejoin="round"/>
      <path d="M10 10C10 10 8 10 8 13" stroke="#FFB3B3" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function BoltIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M18 4L8 18H15L14 28L24 14H17L18 4Z" fill="#FFD93D" stroke="#333" strokeWidth="2" strokeLinejoin="round"/>
    </svg>
  );
}

function MoonIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M26 18C26 24 21 28 15 28C9 28 4 23 4 17C4 11 9 6 15 6C12 9 12 15 15 19C18 23 22 22 26 18Z" fill="#A0A0D8" stroke="#333" strokeWidth="2" strokeLinejoin="round"/>
      <circle cx="11" cy="14" r="1" fill="#8080B0"/>
      <circle cx="15" cy="20" r="0.8" fill="#8080B0"/>
    </svg>
  );
}

function RunnerIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="20" cy="6" r="3" fill="#5B8DEF" stroke="#333" strokeWidth="1.5"/>
      <path d="M12 14L17 11L22 14L20 22L24 28" stroke="#333" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M17 11L14 18L8 20" stroke="#333" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14 18L16 26L12 30" stroke="#333" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function PulseIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect x="3" y="8" width="26" height="16" rx="3" fill="#F0F0F0" stroke="#333" strokeWidth="2"/>
      <polyline points="6,16 10,16 12,10 15,22 18,12 20,20 22,16 26,16" stroke="#FF4444" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function ThermIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect x="13" y="4" width="6" height="18" rx="3" fill="#F0F0F0" stroke="#333" strokeWidth="2"/>
      <circle cx="16" cy="25" r="4" fill="#FF6B6B" stroke="#333" strokeWidth="2"/>
      <rect x="14.5" y="12" width="3" height="10" rx="1.5" fill="#FF6B6B"/>
      <line x1="20" y1="8" x2="23" y2="8" stroke="#333" strokeWidth="1.5"/>
      <line x1="20" y1="12" x2="22" y2="12" stroke="#333" strokeWidth="1.5"/>
      <line x1="20" y1="16" x2="23" y2="16" stroke="#333" strokeWidth="1.5"/>
    </svg>
  );
}

function LungIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M16 6V20" stroke="#333" strokeWidth="2" strokeLinecap="round"/>
      <path d="M16 10C16 10 10 12 8 16C6 20 6 26 10 26C14 26 14 22 14 20" fill="#A0C8E8" stroke="#333" strokeWidth="2" strokeLinejoin="round"/>
      <path d="M16 10C16 10 22 12 24 16C26 20 26 26 22 26C18 26 18 22 18 20" fill="#A0C8E8" stroke="#333" strokeWidth="2" strokeLinejoin="round"/>
    </svg>
  );
}

function ClockIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="12" fill="#FFFFF0" stroke="#333" strokeWidth="2"/>
      <circle cx="16" cy="16" r="10" fill="none" stroke="#999" strokeWidth="1"/>
      <line x1="16" y1="16" x2="16" y2="9" stroke="#333" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="16" y1="16" x2="22" y2="16" stroke="#333" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="16" cy="16" r="1.5" fill="#333"/>
      {[0,30,60,90,120,150,180,210,240,270,300,330].map(deg => (
        <line key={deg} x1="16" y1="6" x2="16" y2="7.5" stroke="#666" strokeWidth="1" transform={`rotate(${deg} 16 16)`}/>
      ))}
    </svg>
  );
}

function ScaleIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect x="6" y="18" width="20" height="10" rx="2" fill="#D8D8D0" stroke="#333" strokeWidth="2"/>
      <path d="M8 18C8 12 11 8 16 8C21 8 24 12 24 18" fill="#FFFFF0" stroke="#333" strokeWidth="2"/>
      <line x1="16" y1="18" x2="20" y2="11" stroke="#FF4444" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="16" cy="18" r="2" fill="#333"/>
    </svg>
  );
}

function FlameIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M16 4C16 4 10 12 10 18C10 24 12 28 16 28C20 28 22 24 22 18C22 12 16 4 16 4Z" fill="#FF8C42" stroke="#333" strokeWidth="2" strokeLinejoin="round"/>
      <path d="M16 16C16 16 14 19 14 22C14 24 15 26 16 26C17 26 18 24 18 22C18 19 16 16 16 16Z" fill="#FFD93D" stroke="#333" strokeWidth="1.5"/>
    </svg>
  );
}

function BedIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect x="4" y="18" width="24" height="6" rx="1" fill="#8B7355" stroke="#333" strokeWidth="2"/>
      <rect x="6" y="14" width="8" height="4" rx="2" fill="#C8B89A" stroke="#333" strokeWidth="1.5"/>
      <line x1="4" y1="24" x2="4" y2="28" stroke="#333" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="28" y1="24" x2="28" y2="28" stroke="#333" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="10" cy="12" r="3" fill="#FFD4A0" stroke="#333" strokeWidth="1.5"/>
    </svg>
  );
}

function BrainIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M16 28V16" stroke="#333" strokeWidth="2"/>
      <path d="M10 8C6 8 4 11 4 14C4 17 6 18 6 18C4 19 4 22 6 24C8 26 12 26 14 24C14 26 16 28 16 28C16 28 18 26 18 24C20 26 24 26 26 24C28 22 28 19 26 18C26 18 28 17 28 14C28 11 26 8 22 8C22 6 20 4 16 4C12 4 10 6 10 8Z" fill="#E8A0C8" stroke="#333" strokeWidth="2" strokeLinejoin="round"/>
      <path d="M16 8C16 8 14 12 14 16" stroke="#C87098" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M12 10C12 12 13 14 16 16" stroke="#C87098" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function WhoopLogoIcon({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect x="2" y="2" width="36" height="36" rx="8" fill="#F0F0F0" stroke="#333" strokeWidth="2"/>
      <text x="20" y="24" textAnchor="middle" fontFamily="Geneva, Chicago, monospace" fontSize="11" fontWeight="bold" fill="#333">WHOOP</text>
      <rect x="8" y="28" width="24" height="3" rx="1.5" fill="#00CC88"/>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// OS 9 style helpers
// ---------------------------------------------------------------------------

const os9Font = '"Geneva", "Chicago", "Charcoal", "Lucida Grande", Monaco, monospace';

// Beveled "inset" panel like OS 9 list boxes
const insetPanel: React.CSSProperties = {
  background: "#FFFFFF",
  border: "2px solid #999",
  borderTopColor: "#666",
  borderLeftColor: "#666",
  borderBottomColor: "#DDD",
  borderRightColor: "#DDD",
  borderRadius: 0,
};

// Beveled "outset" panel like OS 9 group boxes
const outsetPanel: React.CSSProperties = {
  background: "#ECECEC",
  border: "2px solid #999",
  borderTopColor: "#FFF",
  borderLeftColor: "#FFF",
  borderBottomColor: "#888",
  borderRightColor: "#888",
  borderRadius: 0,
};

// OS 9 section divider label
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mt-1 mb-2">
      <div style={{ height: 1, flex: 1, background: "#999" }} />
      <span style={{ fontFamily: os9Font, fontSize: 11, fontWeight: "bold", color: "#333", whiteSpace: "nowrap" }}>
        {children}
      </span>
      <div style={{ height: 1, flex: 1, background: "#999" }} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function msToHours(ms: number): string {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  return `${hours}h ${minutes}m`;
}

function recoveryLabel(score: number): { text: string; color: string; bg: string } {
  if (score >= 67) return { text: "Green", color: "#007700", bg: "#C8F0C8" };
  if (score >= 34) return { text: "Yellow", color: "#886600", bg: "#FFF0B0" };
  return { text: "Red", color: "#CC0000", bg: "#FFCCCC" };
}

function formatTimeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function metersToFeetInches(m: number): string {
  const totalInches = m * 39.3701;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return `${feet}'${inches}"`;
}

function kgToLbs(kg: number): string {
  return `${Math.round(kg * 2.20462)} lbs`;
}

// ---------------------------------------------------------------------------
// Big OS 9 stat tile
// ---------------------------------------------------------------------------

function RetroStatTile({
  icon,
  label,
  value,
  unit,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit?: string;
  highlight?: { color: string; bg: string };
}) {
  return (
    <div style={outsetPanel} className="flex items-center gap-3 px-3 py-2.5">
      <div className="shrink-0">{icon}</div>
      <div className="min-w-0 flex-1">
        <p style={{ fontFamily: os9Font, fontSize: 10, color: "#666", lineHeight: 1.2 }}>{label}</p>
        <p style={{
          fontFamily: os9Font,
          fontSize: 18,
          fontWeight: "bold",
          color: highlight?.color || "#000",
          lineHeight: 1.3,
          background: highlight?.bg,
          display: "inline-block",
          padding: highlight ? "0 4px" : 0,
        }}>
          {value}
          {unit && <span style={{ fontSize: 11, fontWeight: "normal", color: "#666", marginLeft: 3 }}>{unit}</span>}
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// OS 9 key-value row for detail tables
// ---------------------------------------------------------------------------

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between items-baseline px-2 py-0.5" style={{ borderBottom: "1px solid #DDD" }}>
      <span style={{ fontFamily: os9Font, fontSize: 11, color: "#333" }}>{label}</span>
      <span style={{ fontFamily: mono ? "Monaco, monospace" : os9Font, fontSize: 11, fontWeight: "bold", color: "#000" }}>{value}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Lightbox
// ---------------------------------------------------------------------------

function Lightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70"
      onClick={onClose}
    >
      <div className="relative max-w-[90vw] max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute -top-7 right-0"
          style={{ fontFamily: os9Font, fontSize: 11, color: "#FFF" }}
        >
          Close
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="max-w-full max-h-[85vh] object-contain" style={{ border: "2px solid #333" }} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Screenshot Collage (static fallback)
// ---------------------------------------------------------------------------

function ScreenshotCollage({
  screenshots,
  onSelect,
}: {
  screenshots: WhoopScreenshot[];
  onSelect: (s: WhoopScreenshot) => void;
}) {
  const [loadErrors, setLoadErrors] = useState<Set<string>>(new Set());

  return (
    <div className="grid grid-cols-5 gap-1" style={{ padding: 4 }}>
      {screenshots.map((s) => (
        <button
          key={s.id}
          onClick={() => onSelect(s)}
          className="relative aspect-[9/16] overflow-hidden"
          title={s.label}
          style={{
            ...insetPanel,
            padding: 2,
          }}
        >
          {!loadErrors.has(s.id) ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={s.path}
              alt={s.label}
              className="w-full h-full object-cover object-top"
              onError={() => setLoadErrors((prev) => new Set(prev).add(s.id))}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ fontFamily: os9Font, fontSize: 9, color: "#666" }}>
              {s.label}
            </div>
          )}
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Static stat card (OS 9 style)
// ---------------------------------------------------------------------------

function StatCard({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit?: string;
  iconKey: string;
}) {
  return (
    <div className="flex justify-between items-baseline px-2 py-1" style={{ borderBottom: "1px solid #DDD" }}>
      <span style={{ fontFamily: os9Font, fontSize: 11, color: "#333" }}>{label}</span>
      <span style={{ fontFamily: os9Font, fontSize: 11, fontWeight: "bold", color: "#000" }}>
        {value}{unit && <span style={{ fontWeight: "normal", color: "#666", marginLeft: 2 }}>{unit}</span>}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Live data section -- OS 9 System Profiler
// ---------------------------------------------------------------------------

function LiveDashboard({ data }: { data: LiveDashboardData }) {
  const { profile, bodyMeasurement, latestRecovery, latestCycle, latestSleep, recentWorkouts, lastSynced } = data;

  const recovery = latestRecovery?.score;
  const cycle = latestCycle?.score;
  const sleep = latestSleep?.score;
  const recov = recovery ? recoveryLabel(recovery.recovery_score) : null;

  return (
    <div className="space-y-3">
      {/* Status bar */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#00AA00", border: "1px solid #007700", display: "inline-block" }} />
          <span style={{ fontFamily: os9Font, fontSize: 10, color: "#333" }}>Connected</span>
        </div>
        <span style={{ fontFamily: os9Font, fontSize: 10, color: "#666" }}>
          Synced {formatTimeAgo(lastSynced)}
        </span>
      </div>

      {/* Big hero tiles - 2 column grid */}
      <div className="grid grid-cols-2 gap-2">
        {recovery && (
          <RetroStatTile
            icon={<HeartIcon size={36} />}
            label="Recovery"
            value={`${Math.round(recovery.recovery_score)}%`}
            highlight={recov ? { color: recov.color, bg: recov.bg } : undefined}
          />
        )}
        {cycle && (
          <RetroStatTile
            icon={<BoltIcon size={36} />}
            label="Day Strain"
            value={cycle.strain.toFixed(1)}
            unit="/ 21"
          />
        )}
        {sleep?.sleep_performance_percentage != null && (
          <RetroStatTile
            icon={<MoonIcon size={36} />}
            label="Sleep Performance"
            value={`${Math.round(sleep.sleep_performance_percentage)}%`}
          />
        )}
        {cycle && (
          <RetroStatTile
            icon={<FlameIcon size={36} />}
            label="Calories Burned"
            value={String(Math.round(cycle.kilojoule * 0.239006))}
            unit="kcal"
          />
        )}
      </div>

      {/* Recovery Details */}
      {recovery && (
        <div>
          <SectionLabel>Recovery Details</SectionLabel>
          <div style={insetPanel}>
            <DetailRow label="Recovery Score" value={`${Math.round(recovery.recovery_score)}%`} />
            <DetailRow label="Resting Heart Rate" value={`${Math.round(recovery.resting_heart_rate)} bpm`} mono />
            <DetailRow label="Heart Rate Variability" value={`${Math.round(recovery.hrv_rmssd_milli)} ms`} mono />
            {recovery.spo2_percentage != null && (
              <DetailRow label="Blood Oxygen (SpO2)" value={`${Math.round(recovery.spo2_percentage)}%`} mono />
            )}
            {recovery.skin_temp_celsius != null && (
              <DetailRow label="Skin Temperature" value={`${recovery.skin_temp_celsius.toFixed(1)} C`} mono />
            )}
          </div>
        </div>
      )}

      {/* Strain Details */}
      {cycle && (
        <div>
          <SectionLabel>Strain Details</SectionLabel>
          <div style={insetPanel}>
            <DetailRow label="Day Strain" value={cycle.strain.toFixed(1)} mono />
            <DetailRow label="Calories" value={`${Math.round(cycle.kilojoule * 0.239006)} kcal`} mono />
            <DetailRow label="Average Heart Rate" value={`${Math.round(cycle.average_heart_rate)} bpm`} mono />
            <DetailRow label="Max Heart Rate" value={`${Math.round(cycle.max_heart_rate)} bpm`} mono />
          </div>
        </div>
      )}

      {/* Sleep Details */}
      {sleep && (
        <div>
          <SectionLabel>Sleep Details</SectionLabel>
          <div style={insetPanel}>
            {sleep.sleep_performance_percentage != null && (
              <DetailRow label="Sleep Performance" value={`${Math.round(sleep.sleep_performance_percentage)}%`} mono />
            )}
            {sleep.sleep_efficiency_percentage != null && (
              <DetailRow label="Sleep Efficiency" value={`${Math.round(sleep.sleep_efficiency_percentage)}%`} mono />
            )}
            {sleep.sleep_consistency_percentage != null && (
              <DetailRow label="Sleep Consistency" value={`${Math.round(sleep.sleep_consistency_percentage)}%`} mono />
            )}
            <DetailRow label="Time in Bed" value={msToHours(sleep.stage_summary.total_in_bed_time_milli)} mono />
            <DetailRow label="Awake Time" value={msToHours(sleep.stage_summary.total_awake_time_milli)} mono />
            <DetailRow label="Light Sleep" value={msToHours(sleep.stage_summary.total_light_sleep_time_milli)} mono />
            <DetailRow label="Deep (SWS) Sleep" value={msToHours(sleep.stage_summary.total_slow_wave_sleep_time_milli)} mono />
            <DetailRow label="REM Sleep" value={msToHours(sleep.stage_summary.total_rem_sleep_time_milli)} mono />
            <DetailRow label="Sleep Cycles" value={String(sleep.stage_summary.sleep_cycle_count)} mono />
            <DetailRow label="Disturbances" value={String(sleep.stage_summary.disturbance_count)} mono />
            {sleep.respiratory_rate != null && (
              <DetailRow label="Respiratory Rate" value={`${sleep.respiratory_rate.toFixed(1)} rpm`} mono />
            )}
            <DetailRow label="Sleep Need (Baseline)" value={msToHours(sleep.sleep_needed.baseline_milli)} mono />
            {sleep.sleep_needed.need_from_sleep_debt_milli > 0 && (
              <DetailRow label="Sleep Debt Need" value={msToHours(sleep.sleep_needed.need_from_sleep_debt_milli)} mono />
            )}
          </div>
        </div>
      )}

      {/* Body Measurements */}
      {bodyMeasurement && (
        <div>
          <SectionLabel>Body Measurements</SectionLabel>
          <div style={insetPanel}>
            <DetailRow label="Height" value={metersToFeetInches(bodyMeasurement.height_meter)} mono />
            <DetailRow label="Weight" value={kgToLbs(bodyMeasurement.weight_kilogram)} mono />
            <DetailRow label="Max Heart Rate" value={`${bodyMeasurement.max_heart_rate} bpm`} mono />
          </div>
        </div>
      )}

      {/* Recent Workouts */}
      {recentWorkouts.length > 0 && (
        <div>
          <SectionLabel>Recent Workouts ({recentWorkouts.length})</SectionLabel>
          <div style={insetPanel}>
            {/* Table header */}
            <div className="flex justify-between px-2 py-1" style={{ background: "#E0E0E0", borderBottom: "2px solid #999" }}>
              <span style={{ fontFamily: os9Font, fontSize: 10, fontWeight: "bold", color: "#333", width: "30%" }}>Date</span>
              <span style={{ fontFamily: os9Font, fontSize: 10, fontWeight: "bold", color: "#333", width: "20%", textAlign: "right" }}>Strain</span>
              <span style={{ fontFamily: os9Font, fontSize: 10, fontWeight: "bold", color: "#333", width: "25%", textAlign: "right" }}>Calories</span>
              <span style={{ fontFamily: os9Font, fontSize: 10, fontWeight: "bold", color: "#333", width: "25%", textAlign: "right" }}>Max HR</span>
            </div>
            {recentWorkouts.map((w, i) => (
              <div
                key={w.id}
                className="flex justify-between px-2 py-1"
                style={{
                  background: i % 2 === 0 ? "#FFF" : "#F5F5F5",
                  borderBottom: "1px solid #E8E8E8",
                }}
              >
                <span style={{ fontFamily: os9Font, fontSize: 11, color: "#000", width: "30%" }}>
                  {new Date(w.start).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
                <span style={{ fontFamily: "Monaco, monospace", fontSize: 11, fontWeight: "bold", color: "#000", width: "20%", textAlign: "right" }}>
                  {w.score ? w.score.strain.toFixed(1) : "--"}
                </span>
                <span style={{ fontFamily: "Monaco, monospace", fontSize: 11, color: "#000", width: "25%", textAlign: "right" }}>
                  {w.score ? `${Math.round(w.score.kilojoule * 0.239006)}` : "--"}
                </span>
                <span style={{ fontFamily: "Monaco, monospace", fontSize: 11, color: "#000", width: "25%", textAlign: "right" }}>
                  {w.score ? `${w.score.max_heart_rate}` : "--"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Profile */}
      {profile && (
        <p style={{ fontFamily: os9Font, fontSize: 10, color: "#888", textAlign: "center", paddingTop: 4 }}>
          {profile.first_name} {profile.last_name} -- WHOOP Developer API v1
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Static fallback (OS 9 style)
// ---------------------------------------------------------------------------

function StaticDashboard({
  onSelectScreenshot,
}: {
  onSelectScreenshot: (s: WhoopScreenshot) => void;
}) {
  return (
    <>
      {/* Screenshots Collage */}
      <div>
        <SectionLabel>Screenshots</SectionLabel>
        <ScreenshotCollage
          screenshots={whoopScreenshots}
          onSelect={onSelectScreenshot}
        />
        <p style={{ fontFamily: os9Font, fontSize: 9, color: "#888", textAlign: "center", marginTop: 4 }}>
          Click to enlarge
        </p>
      </div>

      {/* Stat Groups */}
      {statGroups.map((group) => {
        const stats = whoopStats.filter((s) => s.group === group.key);
        if (stats.length === 0) return null;
        return (
          <div key={group.key}>
            <SectionLabel>{group.label}</SectionLabel>
            <div style={insetPanel}>
              {stats.map((stat) => (
                <StatCard
                  key={stat.label}
                  label={stat.label}
                  value={stat.value}
                  unit={stat.unit}
                  iconKey={stat.iconKey}
                />
              ))}
            </div>
          </div>
        );
      })}

      <p style={{ fontFamily: os9Font, fontSize: 9, color: "#888", textAlign: "center", paddingTop: 8, paddingBottom: 16 }}>
        Source: WHOOP app screenshots (Feb 2026)
      </p>
    </>
  );
}

// ---------------------------------------------------------------------------
// OS 9 beveled button
// ---------------------------------------------------------------------------

function OS9Button({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        fontFamily: os9Font,
        fontSize: 11,
        fontWeight: "bold",
        color: disabled ? "#999" : "#000",
        background: disabled ? "#CCC" : "#ECECEC",
        border: "2px solid #999",
        borderTopColor: disabled ? "#CCC" : "#FFF",
        borderLeftColor: disabled ? "#CCC" : "#FFF",
        borderBottomColor: disabled ? "#AAA" : "#666",
        borderRightColor: disabled ? "#AAA" : "#666",
        padding: "3px 14px",
        cursor: disabled ? "default" : "pointer",
        borderRadius: 3,
      }}
    >
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Main Dashboard
// ---------------------------------------------------------------------------

export default function WhoopDashboardApp() {
  const [lightboxImg, setLightboxImg] = useState<WhoopScreenshot | null>(null);
  const [dashData, setDashData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/whoop/data");
      if (res.ok) {
        const data: DashboardResponse = await res.json();
        setDashData(data);
      } else {
        setDashData({ connected: false });
      }
    } catch {
      setDashData({ connected: false });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("whoop_auth") === "success") {
      fetchData();
      const url = new URL(window.location.href);
      url.searchParams.delete("whoop_auth");
      url.searchParams.delete("whoop_message");
      window.history.replaceState({}, "", url.toString());
    }
  }, [fetchData]);

  const handleConnect = () => {
    window.location.href = "/api/whoop/auth/start";
  };

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      const res = await fetch("/api/whoop/auth/disconnect", { method: "POST" });
      if (res.ok) {
        setDashData({ connected: false });
      }
    } catch {
      // Ignore
    } finally {
      setDisconnecting(false);
    }
  };

  const isConnected = dashData?.connected === true;

  return (
    <div
      className="h-full overflow-y-auto"
      style={{
        background: "#DDDDDD",
        fontFamily: os9Font,
      }}
    >
      {lightboxImg && (
        <Lightbox
          src={lightboxImg.path}
          alt={lightboxImg.label}
          onClose={() => setLightboxImg(null)}
        />
      )}

      <div className="max-w-[680px] mx-auto" style={{ padding: "8px 12px 20px" }}>
        {/* Header -- like Apple System Profiler title bar area */}
        <div className="flex items-center justify-between mb-3" style={{ padding: "6px 0", borderBottom: "2px solid #999" }}>
          <div className="flex items-center gap-3">
            <WhoopLogoIcon size={40} />
            <div>
              <h1 style={{ fontFamily: os9Font, fontSize: 14, fontWeight: "bold", color: "#000", margin: 0 }}>
                WHOOP Health Monitor
              </h1>
              <p style={{ fontFamily: os9Font, fontSize: 10, color: "#666", margin: 0 }}>
                {isConnected && (dashData as LiveDashboardData).profile
                  ? `${(dashData as LiveDashboardData).profile!.first_name} ${(dashData as LiveDashboardData).profile!.last_name}`
                  : "@atthewm"
                }
              </p>
            </div>
          </div>
          <div>
            {loading ? (
              <span style={{ fontFamily: os9Font, fontSize: 10, color: "#666" }}>Loading...</span>
            ) : isConnected ? (
              <OS9Button onClick={handleDisconnect} disabled={disconnecting}>
                {disconnecting ? "Disconnecting..." : "Disconnect"}
              </OS9Button>
            ) : (
              <OS9Button onClick={handleConnect}>Connect WHOOP</OS9Button>
            )}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center" style={{ padding: "48px 0" }}>
            <span style={{ fontFamily: os9Font, fontSize: 12, color: "#666" }}>Loading WHOOP data...</span>
          </div>
        ) : isConnected ? (
          <LiveDashboard data={dashData as LiveDashboardData} />
        ) : (
          <StaticDashboard onSelectScreenshot={(s) => setLightboxImg(s)} />
        )}
      </div>
    </div>
  );
}
