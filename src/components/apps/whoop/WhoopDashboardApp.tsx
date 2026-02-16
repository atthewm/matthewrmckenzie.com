"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  whoopStats,
  whoopScreenshots,
  statGroups,
  type WhoopScreenshot,
} from "@/data/whoop/dashboard";
import * as Icons from "lucide-react";

// ============================================================================
// WHOOP DASHBOARD (Live + Static Fallback)
// ============================================================================
// When connected via OAuth, shows live metrics from the WHOOP Developer API.
// When disconnected, falls back to the original static screenshot collage
// and manually extracted stats.
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
// Icon helpers
// ---------------------------------------------------------------------------

const iconMap = Icons as unknown as Record<
  string,
  React.ComponentType<{ size?: number; className?: string }>
>;

function StatIcon({ name, size = 14, className = "" }: { name: string; size?: number; className?: string }) {
  const Comp = iconMap[name];
  if (!Comp) return null;
  return <Comp size={size} className={className} />;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function msToHours(ms: number): string {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  return `${hours}h ${minutes}m`;
}

function recoveryColor(score: number): string {
  if (score >= 67) return "#00f19b"; // green
  if (score >= 34) return "#f5a623"; // yellow
  return "#f5222d"; // red
}

function strainColor(strain: number): string {
  if (strain >= 18) return "#0084ff"; // all out
  if (strain >= 14) return "#00b4e6"; // overreaching
  if (strain >= 10) return "#00f19b"; // optimal
  return "#636e72"; // light
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

// ---------------------------------------------------------------------------
// Lightbox
// ---------------------------------------------------------------------------

function Lightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="relative max-w-[90vw] max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute -top-8 right-0 text-white/70 hover:text-white text-sm"
        >
          Close
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className="max-w-full max-h-[85vh] rounded-lg shadow-2xl object-contain"
        />
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
    <div className="grid grid-cols-5 gap-1.5">
      {screenshots.map((s) => (
        <button
          key={s.id}
          onClick={() => onSelect(s)}
          className="relative aspect-[9/16] rounded-lg overflow-hidden bg-[#1a2332]
                     hover:ring-2 hover:ring-[#00f19b]/50 transition-all group"
          title={s.label}
        >
          {!loadErrors.has(s.id) ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={s.path}
              alt={s.label}
              className="w-full h-full object-cover object-top opacity-80 group-hover:opacity-100 transition-opacity"
              onError={() => setLoadErrors((prev) => new Set(prev).add(s.id))}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[9px] text-gray-500 p-1 text-center">
              {s.label}
            </div>
          )}
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Static stat card (same as before)
// ---------------------------------------------------------------------------

function StatCard({
  label,
  value,
  unit,
  iconKey,
}: {
  label: string;
  value: string;
  unit?: string;
  iconKey: string;
}) {
  return (
    <div
      className="flex items-center gap-2.5 px-3 py-2 rounded-lg"
      style={{
        background: "linear-gradient(135deg, rgba(0,241,155,0.06) 0%, rgba(0,180,230,0.04) 100%)",
        border: "1px solid rgba(0,241,155,0.1)",
      }}
    >
      <div className="shrink-0 w-7 h-7 rounded-md flex items-center justify-center bg-[#00f19b]/10">
        <StatIcon name={iconKey} size={14} className="text-[#00f19b]" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] text-gray-400 leading-tight truncate">{label}</p>
        <p className="text-sm font-bold text-white leading-tight">
          {value}
          {unit && <span className="text-[10px] font-normal text-gray-400 ml-0.5">{unit}</span>}
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Live metric tile
// ---------------------------------------------------------------------------

function LiveMetric({
  label,
  value,
  unit,
  iconKey,
  accentColor,
}: {
  label: string;
  value: string;
  unit?: string;
  iconKey: string;
  accentColor?: string;
}) {
  const color = accentColor || "#00f19b";
  return (
    <div
      className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg"
      style={{
        background: `linear-gradient(135deg, ${color}0F 0%, ${color}08 100%)`,
        border: `1px solid ${color}22`,
      }}
    >
      <div
        className="shrink-0 w-8 h-8 rounded-md flex items-center justify-center"
        style={{ background: `${color}18` }}
      >
        <StatIcon name={iconKey} size={15} className="text-white" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] text-gray-400 leading-tight truncate">{label}</p>
        <p className="text-base font-bold text-white leading-tight">
          {value}
          {unit && <span className="text-[11px] font-normal text-gray-400 ml-1">{unit}</span>}
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Live data section
// ---------------------------------------------------------------------------

function LiveDashboard({ data }: { data: LiveDashboardData }) {
  const { profile, latestRecovery, latestCycle, latestSleep, recentWorkouts, lastSynced } = data;

  const recovery = latestRecovery?.score;
  const cycle = latestCycle?.score;
  const sleep = latestSleep?.score;

  return (
    <div className="space-y-4">
      {/* Synced timestamp */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00f19b] animate-pulse" />
          <span className="text-[10px] text-gray-400">Live</span>
        </div>
        <span className="text-[10px] text-gray-500">
          Synced {formatTimeAgo(lastSynced)}
        </span>
      </div>

      {/* Recovery */}
      {recovery && (
        <div>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Recovery</p>
          <div className="grid grid-cols-2 gap-1.5">
            <LiveMetric
              label="Recovery Score"
              value={`${Math.round(recovery.recovery_score)}%`}
              iconKey="Heart"
              accentColor={recoveryColor(recovery.recovery_score)}
            />
            <LiveMetric
              label="Resting HR"
              value={String(Math.round(recovery.resting_heart_rate))}
              unit="bpm"
              iconKey="HeartPulse"
            />
            <LiveMetric
              label="HRV"
              value={String(Math.round(recovery.hrv_rmssd_milli))}
              unit="ms"
              iconKey="Activity"
            />
            {recovery.spo2_percentage != null && (
              <LiveMetric
                label="SpO2"
                value={`${Math.round(recovery.spo2_percentage)}%`}
                iconKey="Wind"
              />
            )}
          </div>
        </div>
      )}

      {/* Strain */}
      {cycle && (
        <div>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Strain</p>
          <div className="grid grid-cols-2 gap-1.5">
            <LiveMetric
              label="Day Strain"
              value={cycle.strain.toFixed(1)}
              iconKey="Zap"
              accentColor={strainColor(cycle.strain)}
            />
            <LiveMetric
              label="Calories"
              value={String(Math.round(cycle.kilojoule * 0.239006))}
              unit="kcal"
              iconKey="Flame"
            />
            <LiveMetric
              label="Avg HR"
              value={String(Math.round(cycle.average_heart_rate))}
              unit="bpm"
              iconKey="HeartPulse"
            />
            <LiveMetric
              label="Max HR"
              value={String(Math.round(cycle.max_heart_rate))}
              unit="bpm"
              iconKey="Heart"
            />
          </div>
        </div>
      )}

      {/* Sleep */}
      {sleep && (
        <div>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Sleep</p>
          <div className="grid grid-cols-2 gap-1.5">
            {sleep.sleep_performance_percentage != null && (
              <LiveMetric
                label="Sleep Performance"
                value={`${Math.round(sleep.sleep_performance_percentage)}%`}
                iconKey="Moon"
              />
            )}
            <LiveMetric
              label="Time in Bed"
              value={msToHours(sleep.stage_summary.total_in_bed_time_milli)}
              iconKey="BedDouble"
            />
            <LiveMetric
              label="REM Sleep"
              value={msToHours(sleep.stage_summary.total_rem_sleep_time_milli)}
              iconKey="Brain"
            />
            <LiveMetric
              label="Deep Sleep"
              value={msToHours(sleep.stage_summary.total_slow_wave_sleep_time_milli)}
              iconKey="CloudMoon"
            />
            {sleep.sleep_efficiency_percentage != null && (
              <LiveMetric
                label="Sleep Efficiency"
                value={`${Math.round(sleep.sleep_efficiency_percentage)}%`}
                iconKey="Timer"
              />
            )}
            {sleep.respiratory_rate != null && (
              <LiveMetric
                label="Resp Rate"
                value={sleep.respiratory_rate.toFixed(1)}
                unit="rpm"
                iconKey="Wind"
              />
            )}
          </div>
        </div>
      )}

      {/* Recent Workouts */}
      {recentWorkouts.length > 0 && (
        <div>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">
            Recent Workouts ({recentWorkouts.length})
          </p>
          <div className="space-y-1.5">
            {recentWorkouts.map((w) => (
              <div
                key={w.id}
                className="flex items-center justify-between px-3 py-2 rounded-lg"
                style={{
                  background: "rgba(0,241,155,0.04)",
                  border: "1px solid rgba(0,241,155,0.08)",
                }}
              >
                <div className="flex items-center gap-2">
                  <StatIcon name="Dumbbell" size={13} className="text-gray-400" />
                  <div>
                    <p className="text-[11px] text-white font-medium">
                      {new Date(w.start).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-[9px] text-gray-500">
                      {w.score ? `${Math.round(w.score.kilojoule * 0.239006)} kcal` : "Pending"}
                    </p>
                  </div>
                </div>
                {w.score && (
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">{w.score.strain.toFixed(1)}</p>
                    <p className="text-[9px] text-gray-500">strain</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Profile note */}
      {profile && (
        <p className="text-[9px] text-gray-600 text-center pt-1">
          {profile.first_name} {profile.last_name}
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Static fallback (same as original)
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
        <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Screenshots</p>
        <ScreenshotCollage
          screenshots={whoopScreenshots}
          onSelect={onSelectScreenshot}
        />
        <p className="text-[8px] text-gray-600 mt-1 text-center">Click to enlarge</p>
      </div>

      {/* Stat Groups */}
      {statGroups.map((group) => {
        const stats = whoopStats.filter((s) => s.group === group.key);
        if (stats.length === 0) return null;
        return (
          <div key={group.key}>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">
              {group.label}
            </p>
            <div className="grid grid-cols-2 gap-1.5">
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

      {/* Source note */}
      <p className="text-[9px] text-gray-600 text-center pt-2 pb-4">
        Source: WHOOP app screenshots (Feb 2026)
      </p>
    </>
  );
}

// ---------------------------------------------------------------------------
// Connect / Disconnect button
// ---------------------------------------------------------------------------

function ConnectButton({ onConnect }: { onConnect: () => void }) {
  return (
    <button
      onClick={onConnect}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-medium
                 transition-all hover:brightness-110"
      style={{
        background: "linear-gradient(135deg, #00f19b 0%, #00b4e6 100%)",
        color: "#000",
      }}
    >
      <StatIcon name="Link" size={12} className="text-black" />
      Connect WHOOP
    </button>
  );
}

function DisconnectButton({ onDisconnect, loading }: { onDisconnect: () => void; loading: boolean }) {
  return (
    <button
      onClick={onDisconnect}
      disabled={loading}
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] text-gray-400
                 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50"
    >
      <StatIcon name="Unlink" size={11} className="" />
      {loading ? "Disconnecting..." : "Disconnect"}
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

  // Fetch live data on mount
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

  // Check URL for auth callback messages
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const authStatus = params.get("whoop_auth");
    if (authStatus === "success") {
      // Re-fetch data after successful auth
      fetchData();
      // Clean up URL params
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
      // Ignore disconnect errors
    } finally {
      setDisconnecting(false);
    }
  };

  const isConnected = dashData?.connected === true;

  return (
    <div
      className="h-full overflow-y-auto"
      style={{
        background: "linear-gradient(180deg, #0d1b2a 0%, #0b1622 50%, #091219 100%)",
        color: "#e0e0e0",
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
      }}
    >
      {/* Lightbox */}
      {lightboxImg && (
        <Lightbox
          src={lightboxImg.path}
          alt={lightboxImg.label}
          onClose={() => setLightboxImg(null)}
        />
      )}

      <div className="p-4 space-y-5 max-w-[680px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #00f19b 0%, #00b4e6 100%)",
              }}
            >
              <StatIcon name="Activity" size={18} className="text-black" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight">WHOOP Dashboard</h1>
              <p className="text-[10px] text-gray-500 tracking-wide uppercase">
                {isConnected && dashData.profile
                  ? `${dashData.profile.first_name} ${dashData.profile.last_name}`
                  : "@atthewm"
                }
              </p>
            </div>
          </div>
          <div>
            {loading ? (
              <span className="text-[10px] text-gray-500">Loading...</span>
            ) : isConnected ? (
              <DisconnectButton onDisconnect={handleDisconnect} loading={disconnecting} />
            ) : (
              <ConnectButton onConnect={handleConnect} />
            )}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <StatIcon name="Loader2" size={16} className="animate-spin" />
              Loading data...
            </div>
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
