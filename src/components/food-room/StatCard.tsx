"use client";

import React, { useEffect, useRef } from "react";
import type { TopFood } from "@/data/notion/types";
import FoodSprite from "./FoodSprite";
import { foodKind } from "./foodKinds";
import { proteinDensity } from "./insights";
import { PALETTE } from "./Charts";

// ============================================================================
// FOOD ROOM: stat card for one food or a combined plate, as an index card
// ============================================================================

export function levelFor(count: number) {
  const level = Math.max(1, Math.floor(Math.sqrt(count)));
  const floor = level * level;
  const next = (level + 1) * (level + 1);
  return { level, pct: Math.min(1, (count - floor) / (next - floor)), toNext: Math.max(0, next - count) };
}

function rarity(rank: number): string {
  if (rank <= 3) return "Legendary";
  if (rank <= 10) return "Epic";
  if (rank <= 25) return "Rare";
  return "Common";
}

function Stat({ tag, label, value, unit, max, color }: { tag: string; label: string; value: number | null; unit: string; max: number; color: string }) {
  const v = value ?? 0;
  return (
    <div className="food-stat">
      <span className="food-stat-tag" title={label}>
        {tag}
      </span>
      <div className="food-meter">
        <span style={{ width: `${Math.min(100, (v / Math.max(max, v, 1)) * 100)}%`, background: color }} />
      </div>
      <span className="food-stat-value">{value == null ? "n/a" : `${Math.round(v * 10) / 10}${unit}`}</span>
    </div>
  );
}

function sum(foods: TopFood[], k: keyof Pick<TopFood, "avgCalories" | "avgProtein" | "avgCarbs" | "avgFat" | "avgFiber">) {
  const vals = foods.map((f) => f[k]).filter((v): v is number => v != null);
  return vals.length ? vals.reduce((a, b) => a + b, 0) : null;
}

export default function StatCard({
  foods,
  onClose,
  onSplit,
}: {
  foods: TopFood[];
  onClose: () => void;
  onSplit?: () => void;
}) {
  const combo = foods.length > 1;
  const main = foods[0];
  const totals = {
    avgCalories: sum(foods, "avgCalories"),
    avgProtein: sum(foods, "avgProtein"),
    avgCarbs: sum(foods, "avgCarbs"),
    avgFat: sum(foods, "avgFat"),
    avgFiber: sum(foods, "avgFiber"),
  };
  const density = proteinDensity(totals);
  const lv = levelFor(combo ? Math.min(...foods.map((f) => f.count)) : main.count);
  const rar = rarity(combo ? Math.min(...foods.map((f) => f.rank)) : main.rank);
  const scale = combo ? 2 : 1;
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={combo ? "Combined plate stats" : `${main.name} stats`}
      className="food-card"
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="food-card-head">
        <div className="relative shrink-0">
          {combo ? (
            <div className="flex -space-x-5">
              {foods.slice(0, 3).map((f) => (
                <FoodSprite key={f.key} kind={foodKind(f.name)} size={44} mood="wow" />
              ))}
            </div>
          ) : (
            <FoodSprite kind={foodKind(main.name)} size={64} mood="wow" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="food-card-rank">{combo ? "Combo plate" : `${rar} · Rank ${main.rank}`}</div>
          <h3 className="food-card-title">{combo ? foods.map((f) => f.name).join(" + ") : main.name}</h3>
          <div className="food-card-level">
            <b>Lv {lv.level}</b>
            <div className="food-meter">
              <span style={{ width: `${lv.pct * 100}%` }} />
            </div>
            <span>{lv.toNext} to next</span>
          </div>
        </div>
        <button ref={closeRef} type="button" onClick={onClose} className="food-close" aria-label="Close">
          ×
        </button>
      </div>

      <div className="food-stats">
        <Stat tag="HP" label="Calories" value={totals.avgCalories} unit=" kcal" max={800 * scale} color={PALETTE.calories} />
        <Stat tag="STR" label="Protein" value={totals.avgProtein} unit=" g" max={60 * scale} color={PALETTE.protein} />
        <Stat tag="NRG" label="Carbs" value={totals.avgCarbs} unit=" g" max={90 * scale} color={PALETTE.carbs} />
        <Stat tag="DEF" label="Fat" value={totals.avgFat} unit=" g" max={45 * scale} color={PALETTE.fat} />
        <Stat tag="VIT" label="Fiber" value={totals.avgFiber} unit=" g" max={15 * scale} color={PALETTE.fiber} />
      </div>
      <p className="food-card-note">
        HP calories · STR protein · NRG carbs · DEF fat · VIT fiber, per serving{combo ? ", added up" : ""}.
      </p>

      <dl className="food-facts">
        {combo ? (
          <>
            <dt>Foods on the plate</dt>
            <dd>{foods.length}</dd>
          </>
        ) : (
          <>
            <dt>Times eaten</dt>
            <dd>{main.count}</dd>
            <dt>Days logged</dt>
            <dd>{main.daysLogged}</dd>
            <dt>Usually at</dt>
            <dd>{main.topMeal ?? "n/a"}</dd>
          </>
        )}
        <dt>Protein per 100 kcal</dt>
        <dd>{density == null ? "n/a" : `${density.toFixed(1)} g`}</dd>
      </dl>

      {combo && onSplit && (
        <button type="button" onClick={onSplit} className="site-btn site-btn-ghost">
          Split the plate
        </button>
      )}
    </div>
  );
}
