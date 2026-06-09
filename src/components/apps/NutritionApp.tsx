"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Flame, Activity, Leaf, Lock, RefreshCw, TrendingUp } from "lucide-react";
import {
  DEFAULT_NUTRITION_TARGETS,
  type NutritionDay,
} from "@/data/notion/types";

// ============================================================================
// NUTRITION DASHBOARD — Notion (Daily Logs) -> /api/notion/data?dataset=nutrition
// ============================================================================
// PRIVATE app: the API returns 401 unless the admin gate cookie is present.
// Mirrors the WHOOP dashboard's panel idiom and the Nutrition OS targets.
// ============================================================================

type LoadState = "loading" | "private" | "empty" | "ready" | "error";

const T = DEFAULT_NUTRITION_TARGETS;

function Ring({
  label,
  value,
  target,
  unit,
  color,
  icon,
}: {
  label: string;
  value: number | null;
  target: number;
  unit: string;
  color: string;
  icon: React.ReactNode;
}) {
  const pct = value != null && target > 0 ? Math.min(value / target, 1) : 0;
  const r = 30;
  const c = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative h-[76px] w-[76px]">
        <svg width="76" height="76" viewBox="0 0 76 76" className="-rotate-90">
          <circle cx="38" cy="38" r={r} fill="none" stroke="var(--desktop-border)" strokeWidth="7" />
          <circle
            cx="38"
            cy="38"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - pct)}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {icon}
          <span className="text-[11px] font-semibold text-desktop-text">
            {value != null ? Math.round(value) : "—"}
          </span>
        </div>
      </div>
      <div className="text-center leading-tight">
        <div className="text-[11px] font-medium text-desktop-text">{label}</div>
        <div className="text-[10px] text-desktop-text-secondary">
          {Math.round(target)} {unit}
        </div>
      </div>
    </div>
  );
}

export default function NutritionApp() {
  const [state, setState] = useState<LoadState>("loading");
  const [days, setDays] = useState<NutritionDay[]>([]);
  const [syncedAt, setSyncedAt] = useState<string | null>(null);

  const load = useCallback(async () => {
    setState("loading");
    try {
      const res = await fetch("/api/notion/data?dataset=nutrition");
      if (res.status === 401) {
        setState("private");
        return;
      }
      if (!res.ok) {
        setState("error");
        return;
      }
      const json = await res.json();
      const items = (json.items ?? []) as NutritionDay[];
      setDays(items);
      setSyncedAt(json.syncedAt ?? null);
      setState(items.length ? "ready" : "empty");
    } catch {
      setState("error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (state === "loading") {
    return (
      <Centered>
        <RefreshCw className="h-5 w-5 animate-spin text-desktop-text-secondary" />
        <p className="text-sm text-desktop-text-secondary">Loading nutrition…</p>
      </Centered>
    );
  }

  if (state === "private") {
    return (
      <Centered>
        <Lock className="h-6 w-6 text-desktop-text-secondary" />
        <p className="text-sm font-medium text-desktop-text">Private dashboard</p>
        <p className="max-w-[280px] text-center text-xs text-desktop-text-secondary">
          Your daily nutrition logs are admin-only. Sign in via the gate to view
          calories, protein, and streaks here.
        </p>
      </Centered>
    );
  }

  if (state === "empty" || state === "error") {
    return (
      <Centered>
        <Activity className="h-6 w-6 text-desktop-text-secondary" />
        <p className="text-sm font-medium text-desktop-text">
          {state === "error" ? "Couldn’t load data" : "No data synced yet"}
        </p>
        <p className="max-w-[280px] text-center text-xs text-desktop-text-secondary">
          {state === "error"
            ? "The nutrition feed is unavailable. Try again shortly."
            : "Add NOTION_TOKEN + run the sync, then your Daily Logs appear here."}
        </p>
        <button
          onClick={load}
          className="mt-1 rounded border border-desktop-border px-3 py-1 text-xs text-desktop-text hover:bg-desktop-bg"
        >
          Retry
        </button>
      </Centered>
    );
  }

  const today = days[0];
  const last7 = days.slice(0, 7);
  let streak = 0;
  for (const d of days) {
    if (d.hitTargets) streak++;
    else break;
  }

  return (
    <div className="h-full overflow-y-auto bg-desktop-bg p-4 text-desktop-text">
      <header className="mb-3 flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold">Nutrition</h1>
          <p className="text-[11px] text-desktop-text-secondary">
            {today?.date ?? "—"}
            {today?.status ? ` · ${today.status}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-desktop-surface px-2 py-1 text-[11px] text-desktop-text-secondary">
          <Flame className="h-3 w-3" /> {streak}-day streak
        </div>
      </header>

      <section className="mb-4 grid grid-cols-3 gap-2 rounded-lg border border-desktop-border bg-desktop-surface p-3">
        <Ring
          label="Calories"
          value={today?.calories ?? null}
          target={today?.calorieTarget ?? T.calories}
          unit="kcal"
          color="#e8743b"
          icon={<Flame className="h-3 w-3 text-desktop-text-secondary" />}
        />
        <Ring
          label="Protein"
          value={today?.proteinBioavailable ?? today?.proteinGross ?? null}
          target={today?.proteinTarget ?? T.proteinBioavailable}
          unit="g bio"
          color="#3b82f6"
          icon={<Activity className="h-3 w-3 text-desktop-text-secondary" />}
        />
        <Ring
          label="Fiber"
          value={today?.fiberFood ?? today?.fiberTotal ?? null}
          target={T.fiber}
          unit="g"
          color="#22a06b"
          icon={<Leaf className="h-3 w-3 text-desktop-text-secondary" />}
        />
      </section>

      <section>
        <div className="mb-2 flex items-center gap-1 text-xs font-medium text-desktop-text-secondary">
          <TrendingUp className="h-3 w-3" /> Last 7 days
        </div>
        <div className="space-y-1">
          {last7.map((d) => (
            <div
              key={d.date}
              className="flex items-center justify-between rounded border border-desktop-border bg-desktop-surface px-2 py-1.5 text-[11px]"
            >
              <span className="w-20 shrink-0 font-medium">{d.date.slice(5)}</span>
              <span className="flex-1 text-desktop-text-secondary">
                {d.calories != null ? `${Math.round(d.calories)} kcal` : "—"} ·{" "}
                {d.proteinBioavailable != null
                  ? `${Math.round(d.proteinBioavailable)}g P`
                  : "—"}{" "}
                · {d.fiberFood != null ? `${Math.round(d.fiberFood)}g fib` : "—"}
              </span>
              <span
                className={
                  "ml-2 inline-block h-2.5 w-2.5 rounded-full " +
                  (d.hitTargets
                    ? "bg-[#22a06b]"
                    : d.hitTargets === false
                    ? "bg-[#e8743b]"
                    : "bg-desktop-border")
                }
                title={d.hitTargets ? "Hit targets" : "Missed"}
              />
            </div>
          ))}
        </div>
      </section>

      {syncedAt && (
        <p className="mt-3 text-center text-[10px] text-desktop-text-secondary">
          Synced from Notion · {new Date(syncedAt).toLocaleString()}
        </p>
      )}
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 bg-desktop-bg p-6">
      {children}
    </div>
  );
}
