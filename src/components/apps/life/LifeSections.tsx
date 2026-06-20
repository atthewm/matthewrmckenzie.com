"use client";

import React from "react";
import {
  Flame,
  Activity,
  Zap,
  Dumbbell,
  ExternalLink,
  ArrowUpRight,
  RefreshCw,
} from "lucide-react";
import {
  DEFAULT_NUTRITION_TARGETS,
  type NutritionDay,
} from "@/data/notion/types";
import type { WhoopSplit } from "@/data/whoop/splits";

// ============================================================================
// LIFE DASHBOARD — presentational sections (Panther aesthetic)
// ============================================================================
// Pure, prop-driven pieces composed by LifeDashboardApp. All data fetching
// lives in the container; these only render. Panther tokens only (the same
// classes the WHOOP and Nutrition apps use), no em dashes, "-" for missing
// values.
// ============================================================================

const T = DEFAULT_NUTRITION_TARGETS;

export interface WhoopActivity {
  connected: boolean;
  caloriesBurned: number | null;
  strain: number | null;
  recovery: number | null;
  restingHr: number | null;
  sleepPct: number | null;
  sleepMs: number | null;
}

export interface LatestWorkout {
  strain: number | null;
  calories: number | null;
  durationMs: number | null;
}

export type NutritionState = "loading" | "empty" | "error" | "ready";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function msToHm(ms: number): string {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return `${h}h ${m}m`;
}

function fmt(value: number | null, suffix = ""): string {
  return value != null ? `${Math.round(value)}${suffix}` : "-";
}

function fmtPct(value: number | null): string {
  return value != null ? `${Math.round(value)}%` : "-";
}

function recoveryColor(score: number): string {
  if (score >= 67) return "#1a7a1a";
  if (score >= 34) return "#8a6d00";
  return "#b0341d";
}

// ---------------------------------------------------------------------------
// Shared primitives
// ---------------------------------------------------------------------------

export function SectionHeader({
  icon,
  title,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-2 mt-4 flex items-center gap-2">
      <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-desktop-text-secondary">
        {icon} {title}
      </span>
      <div className="h-px flex-1 bg-desktop-border" />
      {action}
    </div>
  );
}

function OpenLink({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-0.5 text-[10px] font-medium text-desktop-text-secondary hover:text-desktop-text"
    >
      {label} <ArrowUpRight className="h-3 w-3" />
    </button>
  );
}

function StatTile({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5 rounded-lg border border-desktop-border bg-desktop-surface px-3 py-2.5">
      <span className="text-[10px] font-medium uppercase tracking-wide text-desktop-text-secondary">
        {label}
      </span>
      <span
        className="text-[17px] font-semibold leading-none text-desktop-text"
        style={accent ? { color: accent } : undefined}
      >
        {value}
      </span>
      {sub ? (
        <span className="text-[10px] text-desktop-text-secondary">{sub}</span>
      ) : null}
    </div>
  );
}

function MiniRing({
  label,
  value,
  target,
  unit,
  color,
}: {
  label: string;
  value: number | null;
  target: number;
  unit: string;
  color: string;
}) {
  const pct = value != null && target > 0 ? Math.min(value / target, 1) : 0;
  const r = 26;
  const c = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative h-[68px] w-[68px]">
        <svg width="68" height="68" viewBox="0 0 68 68" className="-rotate-90">
          <circle cx="34" cy="34" r={r} fill="none" stroke="var(--desktop-border)" strokeWidth="6" />
          <circle
            cx="34"
            cy="34"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - pct)}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[12px] font-semibold text-desktop-text">
            {value != null ? Math.round(value) : "-"}
          </span>
        </div>
      </div>
      <div className="text-center leading-tight">
        <div className="text-[10px] font-medium text-desktop-text">{label}</div>
        <div className="text-[9px] text-desktop-text-secondary">
          {Math.round(target)} {unit}
        </div>
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-desktop-border bg-desktop-surface px-3 py-3 text-[11px] text-desktop-text-secondary">
      <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Loading...
    </div>
  );
}

function Notice({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-desktop-border bg-desktop-surface px-3 py-3 text-[11px] text-desktop-text-secondary">
      {text}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Activity (WHOOP)
// ---------------------------------------------------------------------------

export function ActivitySection({
  activity,
  loading,
  onOpenWhoop,
}: {
  activity: WhoopActivity | null;
  loading: boolean;
  onOpenWhoop: () => void;
}) {
  return (
    <section>
      <SectionHeader
        icon={<Zap className="h-3 w-3" />}
        title="Activity"
        action={<OpenLink onClick={onOpenWhoop} label="WHOOP" />}
      />
      {loading ? (
        <Skeleton />
      ) : !activity || !activity.connected ? (
        <div className="flex items-center justify-between rounded-lg border border-desktop-border bg-desktop-surface px-3 py-3">
          <span className="flex items-center gap-2 text-[11px] text-desktop-text-secondary">
            <Activity className="h-4 w-4" /> WHOOP is not connected yet.
          </span>
          <button
            type="button"
            onClick={onOpenWhoop}
            className="rounded border border-desktop-border px-2 py-1 text-[11px] text-desktop-text hover:bg-desktop-bg"
          >
            Open WHOOP
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <StatTile label="Calories burned" value={fmt(activity.caloriesBurned, " kcal")} accent="#e8743b" />
          <StatTile
            label="Day strain"
            value={activity.strain != null ? activity.strain.toFixed(1) : "-"}
            sub="0 to 21"
          />
          <StatTile
            label="Recovery"
            value={fmtPct(activity.recovery)}
            accent={activity.recovery != null ? recoveryColor(activity.recovery) : undefined}
            sub={activity.restingHr != null ? `${Math.round(activity.restingHr)} bpm rest` : undefined}
          />
          <StatTile
            label="Sleep"
            value={activity.sleepMs != null ? msToHm(activity.sleepMs) : fmtPct(activity.sleepPct)}
            sub={activity.sleepPct != null ? `${Math.round(activity.sleepPct)}% performance` : undefined}
          />
        </div>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Nutrition (Notion daily logs)
// ---------------------------------------------------------------------------

export function NutritionSection({
  state,
  days,
  onOpenNutrition,
}: {
  state: NutritionState;
  days: NutritionDay[];
  onOpenNutrition: () => void;
}) {
  const today = days[0];
  let streak = 0;
  for (const d of days) {
    if (d.hitTargets) streak++;
    else break;
  }
  const recent = days.slice(0, 5);

  return (
    <section>
      <SectionHeader
        icon={<Flame className="h-3 w-3" />}
        title="Nutrition"
        action={<OpenLink onClick={onOpenNutrition} label="Open" />}
      />
      {state === "loading" ? (
        <Skeleton />
      ) : state === "error" ? (
        <Notice text="Nutrition feed is unavailable right now." />
      ) : state === "empty" ? (
        <Notice text="No nutrition logs synced yet." />
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between rounded-lg border border-desktop-border bg-desktop-surface px-3 py-2">
            <span className="text-[11px] text-desktop-text-secondary">
              {today?.date ?? "-"}
              {today?.status ? ` · ${today.status}` : ""}
            </span>
            <span className="flex items-center gap-1 text-[11px] text-desktop-text-secondary">
              <Flame className="h-3 w-3" /> {streak}-day streak
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 rounded-lg border border-desktop-border bg-desktop-surface p-3">
            <MiniRing label="Calories" value={today?.calories ?? null} target={today?.calorieTarget ?? T.calories} unit="kcal" color="#e8743b" />
            <MiniRing
              label="Protein"
              value={today?.proteinBioavailable ?? today?.proteinGross ?? null}
              target={today?.proteinTarget ?? T.proteinBioavailable}
              unit="g bio"
              color="#3b82f6"
            />
            <MiniRing label="Fiber" value={today?.fiberFood ?? today?.fiberTotal ?? null} target={T.fiber} unit="g" color="#22a06b" />
          </div>
          <div>
            <div className="mb-1 text-[10px] font-medium uppercase tracking-wide text-desktop-text-secondary">
              Recent days
            </div>
            <div className="space-y-1">
              {recent.map((d) => (
                <div
                  key={d.date}
                  className="flex items-center justify-between rounded border border-desktop-border bg-desktop-surface px-2 py-1.5 text-[11px]"
                >
                  <span className="w-16 shrink-0 font-medium">{d.date.slice(5)}</span>
                  <span className="flex-1 text-desktop-text-secondary">
                    {d.calories != null ? `${Math.round(d.calories)} kcal` : "-"} ·{" "}
                    {d.proteinBioavailable != null ? `${Math.round(d.proteinBioavailable)}g P` : "-"} ·{" "}
                    {d.fiberFood != null ? `${Math.round(d.fiberFood)}g fib` : "-"}
                  </span>
                  <span
                    className={
                      "ml-2 inline-block h-2.5 w-2.5 rounded-full " +
                      (d.hitTargets ? "bg-[#22a06b]" : d.hitTargets === false ? "bg-[#e8743b]" : "bg-desktop-border")
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Training (workout splits)
// ---------------------------------------------------------------------------

export function TrainingSection({
  splits,
  latestWorkout,
  onOpenSplit,
}: {
  splits: WhoopSplit[];
  latestWorkout: LatestWorkout | null;
  onOpenSplit: (slug: string) => void;
}) {
  const sorted = [...splits].sort((a, b) => a.sortOrder - b.sortOrder);
  const hasLatest =
    latestWorkout != null &&
    (latestWorkout.strain != null || latestWorkout.calories != null || latestWorkout.durationMs != null);

  return (
    <section className="pb-2">
      <SectionHeader icon={<Dumbbell className="h-3 w-3" />} title="Training" />
      {hasLatest ? (
        <div className="mb-2 flex items-center gap-3 rounded-lg border border-desktop-border bg-desktop-surface px-3 py-2 text-[11px]">
          <span className="font-medium text-desktop-text">Latest workout</span>
          <span className="text-desktop-text-secondary">
            {latestWorkout?.strain != null ? `${latestWorkout.strain.toFixed(1)} strain` : ""}
            {latestWorkout?.calories != null ? ` · ${Math.round(latestWorkout.calories)} kcal` : ""}
            {latestWorkout?.durationMs != null ? ` · ${msToHm(latestWorkout.durationMs)}` : ""}
          </span>
        </div>
      ) : null}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {sorted.map((s) => (
          <div key={s.slug} className="flex flex-col gap-1 rounded-lg border border-desktop-border bg-desktop-surface px-3 py-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold text-desktop-text">{s.displayName}</span>
              <button
                type="button"
                onClick={() => onOpenSplit(s.slug)}
                className="flex items-center gap-0.5 text-[10px] text-desktop-text-secondary hover:text-desktop-text"
              >
                Open <ArrowUpRight className="h-3 w-3" />
              </button>
            </div>
            <span className="text-[10px] text-desktop-text-secondary">{s.description}</span>
            <a
              href={s.shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-0.5 flex items-center gap-1 text-[10px] text-desktop-text-secondary hover:text-desktop-text"
            >
              <ExternalLink className="h-3 w-3" /> {s.sillyFileName}
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
