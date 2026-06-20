"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Heart, RefreshCw } from "lucide-react";
import { findFSItem } from "@/data/fs";
import { useDesktop } from "@/hooks/useDesktopStore";
import { whoopSplits } from "@/data/whoop/splits";
import type { NutritionDay } from "@/data/notion/types";
import {
  ActivitySection,
  NutritionSection,
  TrainingSection,
  type WhoopActivity,
  type LatestWorkout,
  type NutritionState,
} from "./LifeSections";

// ============================================================================
// LIFE DASHBOARD — unified public "Health and Diet" view
// ============================================================================
// One screen composing three sections in the Panther window style:
//   Activity  -> GET /api/whoop/data        (calories burned, strain, recovery, sleep)
//   Nutrition -> GET /api/notion/data?dataset=nutrition (calories, macros, streak)
//   Training  -> static workout splits + the latest WHOOP workout
// Reuses the existing HTTP feeds; no data-aggregation logic is duplicated here.
// The synced nutrition model holds daily totals only (no per-meal items), so
// the Nutrition list surfaces recent daily logs.
// ============================================================================

const KJ_TO_KCAL = 0.239006;

interface WhoopRaw {
  connected?: boolean;
  latestCycle?: { score?: { strain?: number; kilojoule?: number } } | null;
  latestRecovery?: { score?: { recovery_score?: number; resting_heart_rate?: number } } | null;
  latestSleep?: {
    score?: {
      sleep_performance_percentage?: number;
      stage_summary?: { total_in_bed_time_milli?: number; total_awake_time_milli?: number };
    };
  } | null;
  recentWorkouts?: Array<{ start?: string; end?: string; score?: { strain?: number; kilojoule?: number } }>;
}

function normalizeWhoop(raw: WhoopRaw): { activity: WhoopActivity; latestWorkout: LatestWorkout } {
  const cycle = raw.latestCycle?.score;
  const recovery = raw.latestRecovery?.score;
  const sleep = raw.latestSleep?.score;
  const stage = sleep?.stage_summary;
  const sleepMs =
    stage?.total_in_bed_time_milli != null
      ? stage.total_in_bed_time_milli - (stage.total_awake_time_milli ?? 0)
      : null;

  const w0 = raw.recentWorkouts?.[0];
  const durationMs =
    w0?.start && w0?.end ? new Date(w0.end).getTime() - new Date(w0.start).getTime() : null;

  return {
    activity: {
      connected: raw.connected === true,
      caloriesBurned: cycle?.kilojoule != null ? cycle.kilojoule * KJ_TO_KCAL : null,
      strain: cycle?.strain ?? null,
      recovery: recovery?.recovery_score ?? null,
      restingHr: recovery?.resting_heart_rate ?? null,
      sleepPct: sleep?.sleep_performance_percentage ?? null,
      sleepMs,
    },
    latestWorkout: {
      strain: w0?.score?.strain ?? null,
      calories: w0?.score?.kilojoule != null ? w0.score.kilojoule * KJ_TO_KCAL : null,
      durationMs,
    },
  };
}

export default function LifeDashboardApp() {
  const { openItem } = useDesktop();

  const [whoopLoading, setWhoopLoading] = useState(true);
  const [activity, setActivity] = useState<WhoopActivity | null>(null);
  const [latestWorkout, setLatestWorkout] = useState<LatestWorkout | null>(null);

  const [nutritionState, setNutritionState] = useState<NutritionState>("loading");
  const [days, setDays] = useState<NutritionDay[]>([]);

  const load = useCallback(() => {
    setWhoopLoading(true);
    fetch("/api/whoop/data")
      .then((r) => (r.ok ? r.json() : { connected: false }))
      .catch(() => ({ connected: false }))
      .then((raw: WhoopRaw) => {
        const normalized = normalizeWhoop(raw);
        setActivity(normalized.activity);
        setLatestWorkout(normalized.latestWorkout);
      })
      .finally(() => setWhoopLoading(false));

    setNutritionState("loading");
    fetch("/api/notion/data?dataset=nutrition")
      .then((r) => {
        if (!r.ok) throw new Error("nutrition feed unavailable");
        return r.json();
      })
      .then((json: { items?: NutritionDay[] }) => {
        const items = json.items ?? [];
        setDays(items);
        setNutritionState(items.length ? "ready" : "empty");
      })
      .catch(() => {
        setDays([]);
        setNutritionState("error");
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openById = useCallback(
    (id: string) => {
      const item = findFSItem(id);
      if (item) openItem(item);
    },
    [openItem],
  );

  return (
    <div className="flex h-full flex-col bg-desktop-bg text-desktop-text">
      <div
        className="flex h-[28px] shrink-0 items-center justify-between border-b px-3 text-[10px]"
        style={{ borderColor: "var(--desktop-border)", background: "var(--desktop-surface)" }}
      >
        <span className="font-medium uppercase tracking-wider text-desktop-text-secondary">
          Health and Diet
        </span>
        <button
          type="button"
          onClick={load}
          className="flex items-center gap-1 text-desktop-text-secondary hover:text-desktop-text"
        >
          <RefreshCw className="h-3 w-3" /> Refresh
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[560px] px-4 py-3">
          <div className="mb-1 flex items-center gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-desktop-border"
              style={{ background: "rgba(0,0,0,0.04)" }}
            >
              <Heart size={20} className="text-desktop-text-secondary" />
            </div>
            <div>
              <h1 className="text-base font-semibold leading-tight">Health and Diet</h1>
              <p className="text-[11px] text-desktop-text-secondary">
                What I eat, calories burned, and how I train. One screen.
              </p>
            </div>
          </div>

          <ActivitySection
            activity={activity}
            loading={whoopLoading}
            onOpenWhoop={() => openById("whoop-dashboard")}
          />
          <NutritionSection
            state={nutritionState}
            days={days}
            onOpenNutrition={() => openById("nutrition")}
          />
          <TrainingSection
            splits={whoopSplits}
            latestWorkout={latestWorkout}
            onOpenSplit={(slug) => openById(`whoop-split-${slug}`)}
          />
        </div>
      </div>

      <div
        className="flex h-[22px] shrink-0 items-center border-t px-3 text-[10px] text-desktop-text-secondary"
        style={{ borderColor: "var(--desktop-border)", background: "var(--desktop-surface)" }}
      >
        Life
      </div>
    </div>
  );
}
