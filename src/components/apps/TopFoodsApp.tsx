"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { RefreshCw, Search, Trophy, Flame, Beef, Leaf } from "lucide-react";
import type { TopFood } from "@/data/notion/types";

// ============================================================================
// TOP FOODS — most-logged foods from the Notion meal log
// ============================================================================
// PUBLIC, read-only. The API serves an anonymous rollup that is aggregated at
// sync time: counts and average macros per food, never the underlying per-meal
// rows, so there is no daily meal detail here by construction.
// ============================================================================

type SortKey = "count" | "protein" | "calories" | "fiber";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "count", label: "Most logged" },
  { key: "protein", label: "Protein" },
  { key: "calories", label: "Calories" },
  { key: "fiber", label: "Fiber" },
];

/** Sort descending, always pushing missing values to the bottom. */
function sortValue(food: TopFood, key: SortKey): number {
  switch (key) {
    case "protein":
      return food.avgProtein ?? -1;
    case "calories":
      return food.avgCalories ?? -1;
    case "fiber":
      return food.avgFiber ?? -1;
    default:
      return food.count;
  }
}

function Macro({ value, unit, label }: { value: number | null; unit: string; label: string }) {
  return (
    <div className="flex flex-col items-end leading-tight" title={label}>
      <span className="text-[11px] font-semibold tabular-nums text-desktop-text">
        {value != null ? Math.round(value * 10) / 10 : "—"}
      </span>
      <span className="text-[9px] uppercase tracking-wide text-desktop-text-secondary">
        {unit}
      </span>
    </div>
  );
}

// Colors come through inline styles rather than Tailwind opacity modifiers
// (bg-desktop-accent/70 and friends): the desktop palette is exposed as CSS
// variables holding hex values, which Tailwind 3 cannot apply an alpha channel
// to, so those classes silently compute to transparent.
const TRACK_STYLE = { background: "var(--desktop-border)" } as const;
const FILL_STYLE = { background: "var(--desktop-accent)" } as const;

function FoodRow({ food, max }: { food: TopFood; max: number }) {
  const pct = max > 0 ? Math.max((food.count / max) * 100, 2) : 0;

  return (
    <li className="border-b border-desktop-border last:border-b-0">
      <div className="flex items-center gap-3 px-3 py-2">
        {/* Rank */}
        <span
          className={
            "w-6 shrink-0 text-right text-[11px] font-semibold tabular-nums " +
            (food.rank <= 3 ? "text-desktop-accent" : "text-desktop-text-secondary")
          }
        >
          {food.rank}
        </span>

        {/* Name + frequency bar */}
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span className="truncate text-[12px] font-medium text-desktop-text">
              {food.name}
            </span>
            {food.variants > 1 && (
              <span
                className="shrink-0 rounded border border-desktop-border px-1 text-[9px] text-desktop-text-secondary"
                title={`${food.variants} spellings of this food were merged into one entry`}
              >
                {food.variants} variants
              </span>
            )}
          </div>

          <div className="mt-1 flex items-center gap-2">
            <div
              className="h-[4px] flex-1 overflow-hidden rounded-full"
              style={TRACK_STYLE}
              role="presentation"
            >
              <div
                className="h-full rounded-full"
                style={{ ...FILL_STYLE, width: `${pct}%` }}
              />
            </div>
            <span className="shrink-0 text-[10px] tabular-nums text-desktop-text-secondary">
              {food.count}x
              {food.daysLogged > 0 && ` · ${food.daysLogged}d`}
              {food.topMeal && ` · ${food.topMeal}`}
            </span>
          </div>
        </div>

        {/* Average macros per logged serving */}
        <div className="flex shrink-0 gap-3">
          <Macro value={food.avgCalories} unit="kcal" label="Average calories per serving logged" />
          <Macro value={food.avgProtein} unit="pro" label="Average protein (g) per serving logged" />
          <Macro value={food.avgFiber} unit="fib" label="Average fiber (g) per serving logged" />
        </div>
      </div>
    </li>
  );
}

function SummaryStrip({ foods }: { foods: TopFood[] }) {
  const stats = useMemo(() => {
    const logs = foods.reduce((sum, f) => sum + f.count, 0);
    const withProtein = foods.filter((f) => f.avgProtein != null);
    const topProtein = [...withProtein].sort(
      (a, b) => (b.avgProtein ?? 0) - (a.avgProtein ?? 0)
    )[0];
    const withFiber = foods.filter((f) => f.avgFiber != null);
    const topFiber = [...withFiber].sort((a, b) => (b.avgFiber ?? 0) - (a.avgFiber ?? 0))[0];
    return { logs, topProtein, topFiber };
  }, [foods]);

  return (
    <div className="grid grid-cols-3 gap-2 border-b border-desktop-border px-3 py-2">
      <div className="flex items-center gap-1.5">
        <Flame className="h-3.5 w-3.5 shrink-0 text-desktop-text-secondary" />
        <div className="min-w-0 leading-tight">
          <div className="text-[11px] font-semibold tabular-nums text-desktop-text">
            {stats.logs.toLocaleString()}
          </div>
          <div className="truncate text-[9px] text-desktop-text-secondary">entries ranked</div>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <Beef className="h-3.5 w-3.5 shrink-0 text-desktop-text-secondary" />
        <div className="min-w-0 leading-tight">
          <div className="truncate text-[11px] font-semibold text-desktop-text">
            {stats.topProtein?.name ?? "—"}
          </div>
          <div className="truncate text-[9px] text-desktop-text-secondary">most protein</div>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <Leaf className="h-3.5 w-3.5 shrink-0 text-desktop-text-secondary" />
        <div className="min-w-0 leading-tight">
          <div className="truncate text-[11px] font-semibold text-desktop-text">
            {stats.topFiber?.name ?? "—"}
          </div>
          <div className="truncate text-[9px] text-desktop-text-secondary">most fiber</div>
        </div>
      </div>
    </div>
  );
}

export default function TopFoodsApp() {
  const [foods, setFoods] = useState<TopFood[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [syncedAt, setSyncedAt] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>("count");
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setFailed(false);
    try {
      const res = await fetch("/api/notion/data?dataset=top-foods");
      if (!res.ok) throw new Error(String(res.status));
      const json = await res.json();
      setFoods((json.items ?? []) as TopFood[]);
      setSyncedAt(json.syncedAt ?? null);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q ? foods.filter((f) => f.name.toLowerCase().includes(q)) : foods;
    return [...filtered].sort(
      (a, b) => sortValue(b, sort) - sortValue(a, sort) || a.rank - b.rank
    );
  }, [foods, sort, query]);

  const maxCount = useMemo(
    () => shown.reduce((m, f) => Math.max(m, f.count), 0),
    [shown]
  );

  return (
    <div className="flex h-full flex-col bg-desktop-surface text-desktop-text">
      <header className="shrink-0 border-b border-desktop-border">
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Trophy className="h-4 w-4" />
            Top Foods
          </div>
          <div className="flex gap-1">
            {SORTS.map((s) => (
              <button
                key={s.key}
                onClick={() => setSort(s.key)}
                className={
                  "rounded px-2 py-0.5 text-[11px] " +
                  (sort === s.key
                    ? "bg-desktop-accent text-white"
                    : "text-desktop-text-secondary hover:bg-desktop-border")
                }
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="px-3 pb-2">
          <label className="relative block">
            <span className="sr-only">Filter foods</span>
            <Search className="pointer-events-none absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-desktop-text-secondary" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter foods"
              className="w-full rounded border border-desktop-border bg-desktop-surface py-1 pl-7 pr-2
                         text-[11px] text-desktop-text placeholder:text-desktop-text-secondary
                         focus:border-desktop-accent focus:outline-none"
            />
          </label>
        </div>
      </header>

      {!loading && !failed && foods.length > 0 && <SummaryStrip foods={foods} />}

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex h-full items-center justify-center gap-2 text-sm text-desktop-text-secondary">
            <RefreshCw className="h-4 w-4 animate-spin" /> Loading top foods…
          </div>
        ) : failed || foods.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
            <p className="text-sm font-medium">
              {failed ? "Couldn’t load top foods" : "Nothing synced yet"}
            </p>
            <p className="max-w-[280px] text-xs text-desktop-text-secondary">
              {failed
                ? "The nutrition feed is unavailable right now."
                : "Add NOTION_TOKEN and run the sync to rank the meal log."}
            </p>
            <button
              onClick={load}
              className="mt-1 rounded border border-desktop-border px-3 py-1 text-xs hover:bg-desktop-border"
            >
              Retry
            </button>
          </div>
        ) : shown.length === 0 ? (
          <div className="flex h-full items-center justify-center px-6 text-center text-xs text-desktop-text-secondary">
            No food matches &ldquo;{query}&rdquo;.
          </div>
        ) : (
          <ul>
            {shown.map((food) => (
              <FoodRow key={food.key} food={food} max={maxCount} />
            ))}
          </ul>
        )}
      </div>

      <footer
        className="flex shrink-0 items-center justify-between border-t border-desktop-border px-3 py-1
                   text-[10px] text-desktop-text-secondary"
      >
        <span>Averages are per serving logged</span>
        {syncedAt && <span>Synced {new Date(syncedAt).toLocaleDateString()}</span>}
      </footer>
    </div>
  );
}
