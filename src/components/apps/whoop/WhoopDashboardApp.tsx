"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Heart,
  Zap,
  Moon,
  Activity,
  Flame,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import {
  whoopStats,
  whoopScreenshots,
  statGroups,
  whoopReferral,
  type WhoopScreenshot,
} from "@/data/whoop/dashboard";

// ============================================================================
// WHOOP DASHBOARD -- Mac OS X 10.3 Panther Aesthetic
// ============================================================================
// Clean Aqua-style panels, Lucida Grande typography, subtle borders and
// rounded corners. Matches the rest of the ryOS Panther shell.
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
// Helpers
// ---------------------------------------------------------------------------

function msToHours(ms: number): string {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  return `${hours}h ${minutes}m`;
}

function recoveryLabel(score: number): { text: string; color: string; bg: string } {
  if (score >= 67) return { text: "Green", color: "#1a7a1a", bg: "rgba(40,200,64,0.12)" };
  if (score >= 34) return { text: "Yellow", color: "#8a6d00", bg: "rgba(255,189,46,0.12)" };
  return { text: "Red", color: "#cc2222", bg: "rgba(255,59,48,0.12)" };
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
// Panther section header
// ---------------------------------------------------------------------------

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mt-4 mb-1.5">
      <span className="text-[11px] font-semibold text-desktop-text-secondary uppercase tracking-wider whitespace-nowrap">
        {children}
      </span>
      <div className="flex-1 h-px bg-desktop-border" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stat card for hero tiles
// ---------------------------------------------------------------------------

function StatTile({
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
    <div
      className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg border"
      style={{
        borderColor: "var(--desktop-border)",
        background: highlight?.bg || "rgba(0,0,0,0.02)",
      }}
    >
      <div className="shrink-0 text-desktop-text-secondary">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] text-desktop-text-secondary leading-tight">{label}</p>
        <p
          className="text-[17px] font-semibold leading-snug"
          style={{ color: highlight?.color || "var(--desktop-text)" }}
        >
          {value}
          {unit && (
            <span className="text-[11px] font-normal text-desktop-text-secondary ml-1">
              {unit}
            </span>
          )}
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Detail row for data tables
// ---------------------------------------------------------------------------

function DetailRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div
      className="flex justify-between items-baseline px-3 py-[5px]"
      style={{ borderBottom: "1px solid var(--desktop-border)" }}
    >
      <span className="text-[12px] text-desktop-text-secondary">{label}</span>
      <span
        className="text-[12px] font-semibold text-desktop-text"
        style={mono ? { fontFamily: "Menlo, Monaco, monospace", fontSize: 11 } : undefined}
      >
        {value}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Panther-style card wrapper for detail sections
// ---------------------------------------------------------------------------

function DetailCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-lg border overflow-hidden"
      style={{
        borderColor: "var(--desktop-border)",
        background: "var(--desktop-surface)",
      }}
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Lightbox
// ---------------------------------------------------------------------------

function Lightbox({
  src,
  alt,
  onClose,
}: {
  src: string;
  alt: string;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-w-[90vw] max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-8 right-0 text-[11px] text-white/80 hover:text-white transition-colors"
        >
          Close
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Screenshot collage (static fallback)
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
          className="relative aspect-[9/16] overflow-hidden rounded-md border
                     hover:border-desktop-accent hover:shadow-sm transition-all"
          title={s.label}
          style={{ borderColor: "var(--desktop-border)" }}
        >
          {!loadErrors.has(s.id) ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={s.path}
              alt={s.label}
              className="w-full h-full object-cover object-top"
              onError={() =>
                setLoadErrors((prev) => new Set(prev).add(s.id))
              }
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[9px] text-desktop-text-secondary">
              {s.label}
            </div>
          )}
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Static stat row
// ---------------------------------------------------------------------------

function StatRow({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit?: string;
}) {
  return (
    <div
      className="flex justify-between items-baseline px-3 py-[5px]"
      style={{ borderBottom: "1px solid var(--desktop-border)" }}
    >
      <span className="text-[12px] text-desktop-text-secondary">{label}</span>
      <span className="text-[12px] font-semibold text-desktop-text">
        {value}
        {unit && (
          <span className="font-normal text-desktop-text-secondary ml-1">
            {unit}
          </span>
        )}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Live dashboard
// ---------------------------------------------------------------------------

function LiveDashboard({ data }: { data: LiveDashboardData }) {
  const {
    profile,
    bodyMeasurement,
    latestRecovery,
    latestCycle,
    latestSleep,
    recentWorkouts,
    lastSynced,
  } = data;

  const recovery = latestRecovery?.score;
  const cycle = latestCycle?.score;
  const sleep = latestSleep?.score;
  const recov = recovery ? recoveryLabel(recovery.recovery_score) : null;

  return (
    <div>
      {/* Status indicator */}
      <div className="flex items-center justify-between px-1 mb-3">
        <div className="flex items-center gap-1.5">
          <span
            className="inline-block w-[7px] h-[7px] rounded-full"
            style={{
              background: "#28C840",
              boxShadow: "0 0 4px rgba(40,200,64,0.4)",
            }}
          />
          <span className="text-[11px] text-desktop-text-secondary">
            Connected
          </span>
        </div>
        <span className="text-[10px] text-desktop-text-secondary">
          Synced {formatTimeAgo(lastSynced)}
        </span>
      </div>

      {/* Hero stat tiles */}
      <div className="grid grid-cols-2 gap-2">
        {recovery && (
          <StatTile
            icon={<Heart size={20} />}
            label="Recovery"
            value={`${Math.round(recovery.recovery_score)}%`}
            highlight={
              recov ? { color: recov.color, bg: recov.bg } : undefined
            }
          />
        )}
        {cycle && (
          <StatTile
            icon={<Zap size={20} />}
            label="Day Strain"
            value={cycle.strain.toFixed(1)}
            unit="/ 21"
          />
        )}
        {sleep?.sleep_performance_percentage != null && (
          <StatTile
            icon={<Moon size={20} />}
            label="Sleep Performance"
            value={`${Math.round(sleep.sleep_performance_percentage)}%`}
          />
        )}
        {cycle && (
          <StatTile
            icon={<Flame size={20} />}
            label="Calories Burned"
            value={String(Math.round(cycle.kilojoule * 0.239006))}
            unit="kcal"
          />
        )}
      </div>

      {/* Recovery Details */}
      {recovery && (
        <>
          <SectionHeader>Recovery Details</SectionHeader>
          <DetailCard>
            <DetailRow
              label="Recovery Score"
              value={`${Math.round(recovery.recovery_score)}%`}
            />
            <DetailRow
              label="Resting Heart Rate"
              value={`${Math.round(recovery.resting_heart_rate)} bpm`}
              mono
            />
            <DetailRow
              label="Heart Rate Variability"
              value={`${Math.round(recovery.hrv_rmssd_milli)} ms`}
              mono
            />
            {recovery.spo2_percentage != null && (
              <DetailRow
                label="Blood Oxygen (SpO2)"
                value={`${Math.round(recovery.spo2_percentage)}%`}
                mono
              />
            )}
            {recovery.skin_temp_celsius != null && (
              <DetailRow
                label="Skin Temperature"
                value={`${recovery.skin_temp_celsius.toFixed(1)} C`}
                mono
              />
            )}
          </DetailCard>
        </>
      )}

      {/* Strain Details */}
      {cycle && (
        <>
          <SectionHeader>Strain Details</SectionHeader>
          <DetailCard>
            <DetailRow
              label="Day Strain"
              value={cycle.strain.toFixed(1)}
              mono
            />
            <DetailRow
              label="Calories"
              value={`${Math.round(cycle.kilojoule * 0.239006)} kcal`}
              mono
            />
            <DetailRow
              label="Average Heart Rate"
              value={`${Math.round(cycle.average_heart_rate)} bpm`}
              mono
            />
            <DetailRow
              label="Max Heart Rate"
              value={`${Math.round(cycle.max_heart_rate)} bpm`}
              mono
            />
          </DetailCard>
        </>
      )}

      {/* Sleep Details */}
      {sleep && (
        <>
          <SectionHeader>Sleep Details</SectionHeader>
          <DetailCard>
            {sleep.sleep_performance_percentage != null && (
              <DetailRow
                label="Sleep Performance"
                value={`${Math.round(sleep.sleep_performance_percentage)}%`}
                mono
              />
            )}
            {sleep.sleep_efficiency_percentage != null && (
              <DetailRow
                label="Sleep Efficiency"
                value={`${Math.round(sleep.sleep_efficiency_percentage)}%`}
                mono
              />
            )}
            {sleep.sleep_consistency_percentage != null && (
              <DetailRow
                label="Sleep Consistency"
                value={`${Math.round(sleep.sleep_consistency_percentage)}%`}
                mono
              />
            )}
            <DetailRow
              label="Time in Bed"
              value={msToHours(sleep.stage_summary.total_in_bed_time_milli)}
              mono
            />
            <DetailRow
              label="Awake Time"
              value={msToHours(sleep.stage_summary.total_awake_time_milli)}
              mono
            />
            <DetailRow
              label="Light Sleep"
              value={msToHours(
                sleep.stage_summary.total_light_sleep_time_milli
              )}
              mono
            />
            <DetailRow
              label="Deep (SWS) Sleep"
              value={msToHours(
                sleep.stage_summary.total_slow_wave_sleep_time_milli
              )}
              mono
            />
            <DetailRow
              label="REM Sleep"
              value={msToHours(
                sleep.stage_summary.total_rem_sleep_time_milli
              )}
              mono
            />
            <DetailRow
              label="Sleep Cycles"
              value={String(sleep.stage_summary.sleep_cycle_count)}
              mono
            />
            <DetailRow
              label="Disturbances"
              value={String(sleep.stage_summary.disturbance_count)}
              mono
            />
            {sleep.respiratory_rate != null && (
              <DetailRow
                label="Respiratory Rate"
                value={`${sleep.respiratory_rate.toFixed(1)} rpm`}
                mono
              />
            )}
            <DetailRow
              label="Sleep Need (Baseline)"
              value={msToHours(sleep.sleep_needed.baseline_milli)}
              mono
            />
            {sleep.sleep_needed.need_from_sleep_debt_milli > 0 && (
              <DetailRow
                label="Sleep Debt Need"
                value={msToHours(
                  sleep.sleep_needed.need_from_sleep_debt_milli
                )}
                mono
              />
            )}
          </DetailCard>
        </>
      )}

      {/* Body Measurements */}
      {bodyMeasurement && (
        <>
          <SectionHeader>Body Measurements</SectionHeader>
          <DetailCard>
            <DetailRow
              label="Height"
              value={metersToFeetInches(bodyMeasurement.height_meter)}
              mono
            />
            <DetailRow
              label="Weight"
              value={kgToLbs(bodyMeasurement.weight_kilogram)}
              mono
            />
            <DetailRow
              label="Max Heart Rate"
              value={`${bodyMeasurement.max_heart_rate} bpm`}
              mono
            />
          </DetailCard>
        </>
      )}

      {/* Recent Workouts */}
      {recentWorkouts.length > 0 && (
        <>
          <SectionHeader>
            Recent Workouts ({recentWorkouts.length})
          </SectionHeader>
          <DetailCard>
            {/* Table header */}
            <div
              className="flex justify-between px-3 py-1.5"
              style={{
                background: "rgba(0,0,0,0.03)",
                borderBottom: "1px solid var(--desktop-border)",
              }}
            >
              <span className="text-[10px] font-semibold text-desktop-text-secondary w-[30%]">
                Date
              </span>
              <span className="text-[10px] font-semibold text-desktop-text-secondary w-[20%] text-right">
                Strain
              </span>
              <span className="text-[10px] font-semibold text-desktop-text-secondary w-[25%] text-right">
                Calories
              </span>
              <span className="text-[10px] font-semibold text-desktop-text-secondary w-[25%] text-right">
                Max HR
              </span>
            </div>
            {recentWorkouts.map((w, i) => (
              <div
                key={w.id}
                className="flex justify-between px-3 py-[5px]"
                style={{
                  background:
                    i % 2 === 0
                      ? "transparent"
                      : "rgba(0,0,0,0.02)",
                  borderBottom: "1px solid var(--desktop-border)",
                }}
              >
                <span className="text-[11px] text-desktop-text w-[30%]">
                  {new Date(w.start).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <span
                  className="text-[11px] font-semibold text-desktop-text w-[20%] text-right"
                  style={{
                    fontFamily: "Menlo, Monaco, monospace",
                    fontSize: 10,
                  }}
                >
                  {w.score ? w.score.strain.toFixed(1) : "--"}
                </span>
                <span
                  className="text-[11px] text-desktop-text w-[25%] text-right"
                  style={{
                    fontFamily: "Menlo, Monaco, monospace",
                    fontSize: 10,
                  }}
                >
                  {w.score
                    ? `${Math.round(w.score.kilojoule * 0.239006)}`
                    : "--"}
                </span>
                <span
                  className="text-[11px] text-desktop-text w-[25%] text-right"
                  style={{
                    fontFamily: "Menlo, Monaco, monospace",
                    fontSize: 10,
                  }}
                >
                  {w.score ? `${w.score.max_heart_rate}` : "--"}
                </span>
              </div>
            ))}
          </DetailCard>
        </>
      )}

      {/* Profile */}
      {profile && (
        <p className="text-[10px] text-desktop-text-secondary text-center pt-3 pb-2">
          {profile.first_name} {profile.last_name} -- WHOOP Developer API v1
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Static fallback
// ---------------------------------------------------------------------------

function StaticDashboard({
  onSelectScreenshot,
}: {
  onSelectScreenshot: (s: WhoopScreenshot) => void;
}) {
  return (
    <>
      {/* Screenshots */}
      <SectionHeader>Screenshots</SectionHeader>
      <ScreenshotCollage
        screenshots={whoopScreenshots}
        onSelect={onSelectScreenshot}
      />
      <p className="text-[9px] text-desktop-text-secondary text-center mt-1.5 mb-1">
        Click to enlarge
      </p>

      {/* Stat Groups */}
      {statGroups.map((group) => {
        const stats = whoopStats.filter((s) => s.group === group.key);
        if (stats.length === 0) return null;
        return (
          <div key={group.key}>
            <SectionHeader>{group.label}</SectionHeader>
            <DetailCard>
              {stats.map((stat) => (
                <StatRow
                  key={stat.label}
                  label={stat.label}
                  value={stat.value}
                  unit={stat.unit}
                />
              ))}
            </DetailCard>
          </div>
        );
      })}

      <p className="text-[9px] text-desktop-text-secondary text-center pt-3 pb-4">
        Source: WHOOP app screenshots (Feb 2026)
      </p>
    </>
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
      const res = await fetch("/api/whoop/auth/disconnect", {
        method: "POST",
      });
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
    <div className="flex flex-col h-full">
      {lightboxImg && (
        <Lightbox
          src={lightboxImg.path}
          alt={lightboxImg.label}
          onClose={() => setLightboxImg(null)}
        />
      )}

      {/* Toolbar */}
      <div
        className="shrink-0 h-[28px] flex items-center justify-between px-3 border-b text-[10px]"
        style={{
          borderColor: "var(--desktop-border)",
          background: "rgba(0,0,0,0.02)",
        }}
      >
        <span className="text-desktop-text-secondary font-medium uppercase tracking-wider">
          WHOOP Health Monitor
        </span>
        <div className="flex items-center gap-2">
          {!loading && isConnected && (
            <button
              onClick={() => fetchData()}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded
                         text-desktop-text-secondary hover:bg-desktop-accent/10 transition-colors"
              title="Refresh data"
            >
              <RefreshCw size={10} />
            </button>
          )}
          {!loading && isConnected ? (
            <button
              onClick={handleDisconnect}
              disabled={disconnecting}
              className="flex items-center gap-1 px-2 py-0.5 rounded
                         text-desktop-text-secondary hover:bg-desktop-accent/10 transition-colors
                         disabled:opacity-50"
            >
              {disconnecting ? "Disconnecting..." : "Disconnect"}
            </button>
          ) : !loading ? (
            <button
              onClick={handleConnect}
              className="flex items-center gap-1 px-2 py-0.5 rounded
                         text-desktop-accent hover:bg-desktop-accent/10 transition-colors"
            >
              Connect WHOOP
            </button>
          ) : null}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="max-w-[640px] mx-auto px-4 py-3">
          {/* Header */}
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
              style={{
                background: "rgba(0,0,0,0.04)",
                border: "1px solid var(--desktop-border)",
              }}
            >
              <Activity size={20} className="text-desktop-text-secondary" />
            </div>
            <div>
              <h1 className="text-[14px] font-semibold text-desktop-text leading-tight">
                WHOOP Health Monitor
              </h1>
              <p className="text-[11px] text-desktop-text-secondary">
                {isConnected &&
                (dashData as LiveDashboardData).profile
                  ? `${(dashData as LiveDashboardData).profile!.first_name} ${(dashData as LiveDashboardData).profile!.last_name}`
                  : "@atthewm"}
              </p>
            </div>
          </div>

          {/* Main content */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <span className="text-[12px] text-desktop-text-secondary">
                Loading WHOOP data...
              </span>
            </div>
          ) : isConnected ? (
            <LiveDashboard data={dashData as LiveDashboardData} />
          ) : (
            <StaticDashboard
              onSelectScreenshot={(s) => setLightboxImg(s)}
            />
          )}

          {/* Referral link */}
          <div
            className="mt-4 mb-2 px-4 py-3 rounded-lg border flex items-center justify-between"
            style={{
              borderColor: "var(--desktop-border)",
              background: "rgba(0,0,0,0.02)",
            }}
          >
            <div>
              <p className="text-[11px] font-medium text-desktop-text">
                Try WHOOP
              </p>
              <p className="text-[10px] text-desktop-text-secondary">
                Free month with referral
              </p>
            </div>
            <a
              href={whoopReferral.joinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-1.5 rounded text-[10px] font-medium
                         bg-desktop-accent text-white hover:opacity-90 transition-opacity"
            >
              <ExternalLink size={10} />
              Join WHOOP
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        className="shrink-0 h-[22px] flex items-center px-3 border-t text-[10px] text-desktop-text-secondary"
        style={{
          borderColor: "var(--desktop-border)",
          background: "rgba(0,0,0,0.02)",
        }}
      >
        Health
      </div>
    </div>
  );
}
