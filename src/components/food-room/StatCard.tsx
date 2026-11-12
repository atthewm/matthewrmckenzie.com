import React from "react";
import type { TopFood } from "@/data/notion/types";
import FoodSprite from "./FoodSprite";
import { foodKind } from "./foodKinds";
import { proteinDensity } from "./insights";
import { PALETTE } from "./Charts";

// ============================================================================
// FOOD ROOM: XP-style stat card for one food or a combined plate
// ============================================================================

export function levelFor(count: number) {
  const level = Math.max(1, Math.floor(Math.sqrt(count)));
  const floor = level * level;
  const next = (level + 1) * (level + 1);
  return { level, pct: Math.min(1, (count - floor) / (next - floor)), toNext: Math.max(0, next - count) };
}

function rarity(rank: number) {
  if (rank <= 3) return { label: "Legendary", color: "#f2b705" };
  if (rank <= 10) return { label: "Epic", color: "#9b5de5" };
  if (rank <= 25) return { label: "Rare", color: "#3a86ff" };
  return { label: "Common", color: "#8d99ae" };
}

function Stat({ tag, label, value, unit, max, color }: { tag: string; label: string; value: number | null; unit: string; max: number; color: string }) {
  const v = value ?? 0;
  return (
    <div className="grid grid-cols-[2.6rem_1fr_4.2rem] items-center gap-2 text-[11px]">
      <span className="font-mono font-bold" style={{ color }}>{tag}</span>
      <div className="h-2.5 overflow-hidden rounded-sm" style={{ background: "rgba(255,255,255,0.12)" }}>
        <div className="h-full" style={{ width: `${Math.min(100, (v / Math.max(max, v, 1)) * 100)}%`, background: color }} />
      </div>
      <span className="text-right tabular-nums text-white/90" title={label}>
        {value == null ? "n/a" : `${Math.round(v * 10) / 10}${unit}`}
      </span>
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

  return (
    <div
      role="dialog"
      aria-label={combo ? "Combined plate stats" : `${main.name} stats`}
      className="w-[min(92vw,22rem)] rounded-xl border-2 p-4 text-white shadow-2xl"
      style={{ background: "linear-gradient(160deg,#1d1b3a,#2b1f4a 60%,#3a1f3f)", borderColor: rar.color }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="flex items-start gap-3">
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
          <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: rar.color }}>
            {combo ? "Combo plate" : `${rar.label} · Rank #${main.rank}`}
          </div>
          <h3 className="truncate text-base font-bold leading-tight">
            {combo ? foods.map((f) => f.name).join(" + ") : main.name}
          </h3>
          <div className="mt-1 flex items-center gap-2 text-[11px]">
            <span className="rounded bg-white/15 px-1.5 py-0.5 font-mono font-bold">Lv {lv.level}</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/15">
              <div className="h-full rounded-full" style={{ width: `${lv.pct * 100}%`, background: "linear-gradient(90deg,#7ae582,#25a18e)" }} />
            </div>
            <span className="tabular-nums text-white/70">{lv.toNext} to next</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded px-1.5 text-lg leading-none text-white/70 hover:text-white"
          aria-label="Close"
        >
          ×
        </button>
      </div>

      <div className="mt-4 space-y-1.5">
        <Stat tag="HP" label="Calories" value={totals.avgCalories} unit=" kcal" max={800 * scale} color={PALETTE.calories} />
        <Stat tag="STR" label="Protein" value={totals.avgProtein} unit=" g" max={60 * scale} color={PALETTE.protein} />
        <Stat tag="NRG" label="Carbs" value={totals.avgCarbs} unit=" g" max={90 * scale} color={PALETTE.carbs} />
        <Stat tag="DEF" label="Fat" value={totals.avgFat} unit=" g" max={45 * scale} color={PALETTE.fat} />
        <Stat tag="VIT" label="Fiber" value={totals.avgFiber} unit=" g" max={15 * scale} color={PALETTE.fiber} />
      </div>
      <p className="mt-2 text-[10px] text-white/60">
        HP calories · STR protein · NRG carbs · DEF fat · VIT fiber, per serving{combo ? ", added up" : ""}.
      </p>

      <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
        {combo ? (
          <>
            <dt className="text-white/60">Foods on the plate</dt>
            <dd className="text-right">{foods.length}</dd>
          </>
        ) : (
          <>
            <dt className="text-white/60">Times eaten</dt>
            <dd className="text-right tabular-nums">{main.count}</dd>
            <dt className="text-white/60">Days logged</dt>
            <dd className="text-right tabular-nums">{main.daysLogged}</dd>
            <dt className="text-white/60">Usually at</dt>
            <dd className="text-right">{main.topMeal ?? "n/a"}</dd>
          </>
        )}
        <dt className="text-white/60">Protein per 100 kcal</dt>
        <dd className="text-right tabular-nums">{density == null ? "n/a" : `${density.toFixed(1)} g`}</dd>
      </dl>

      {combo && onSplit && (
        <button
          onClick={onSplit}
          className="mt-4 w-full rounded-md bg-white/15 py-1.5 text-xs font-semibold hover:bg-white/25"
        >
          Split the plate
        </button>
      )}
    </div>
  );
}
