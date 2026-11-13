"use client";

import React, { useEffect, useRef } from "react";
import type { NutritionDay, TopFood } from "@/data/notion/types";
import { DEFAULT_NUTRITION_TARGETS } from "@/data/notion/types";
import { Donut, HBars, PALETTE, TrendLine } from "./Charts";
import { favorites, guiltyPleasures, improvements, macroMix, mealSplit, mostEfficient } from "./insights";

// ============================================================================
// FOOD ROOM: the board on the wall, opened as a dashboard
// ============================================================================
// Public part: built only from the top-foods rollup. Daily trends come from
// the private nutrition log and only render when the API says the viewer is
// the signed-in owner; everyone else gets a one-line note.
// ============================================================================

function Panel({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <section className="food-panel">
      <h3 className="food-panel-title">{title}</h3>
      {sub && <p className="food-panel-sub">{sub}</p>}
      {children}
    </section>
  );
}

function shortDate(iso: string) {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function BoardDashboard({
  foods,
  days,
  sample,
  syncedAt,
  onClose,
}: {
  foods: TopFood[];
  days: NutritionDay[] | null;
  sample: boolean;
  syncedAt: string | null;
  onClose: () => void;
}) {
  const fav = favorites(foods);
  const eff = mostEfficient(foods);
  const guilty = guiltyPleasures(foods);
  const mix = macroMix(foods);
  const meals = mealSplit(foods);
  const tips = improvements(foods, days);
  const recent = days ? [...days].sort((a, b) => a.date.localeCompare(b.date)).slice(-30) : null;
  const t = DEFAULT_NUTRITION_TARGETS;
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Food dashboard"
      className="food-board"
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <header className="food-board-head">
        <div>
          <h2 className="food-board-title">Food board</h2>
          <p className="food-board-sub">
            {sample
              ? "Sample data. My real numbers appear once the Notion sync runs."
              : `From my Notion meal log${syncedAt ? `, synced ${new Date(syncedAt).toLocaleString()}` : ""}.`}
          </p>
        </div>
        <button ref={closeRef} type="button" onClick={onClose} className="food-close" aria-label="Close dashboard">
          ×
        </button>
      </header>

      <div className="food-board-grid">
        <Panel title="Favorites" sub="Most eaten, by times logged.">
          <HBars rows={fav.map((f) => ({ label: f.name, value: f.count, note: f.topMeal ?? undefined }))} unit="×" />
        </Panel>

        <Panel title="Most efficient" sub="Grams of protein per 100 calories.">
          <HBars rows={eff.map((f) => ({ label: f.name, value: f.density }))} digits={1} unit=" g" color={PALETTE.protein} />
        </Panel>

        <Panel title="Guilty pleasures" sub="Sweets, and heavy foods that bring little protein.">
          {guilty.length ? (
            <HBars
              rows={guilty.map((f) => ({ label: f.name, value: f.count, note: f.avgCalories != null ? `${Math.round(f.avgCalories)} kcal` : undefined }))}
              unit="×"
              color={PALETTE.calories}
            />
          ) : (
            <p className="food-panel-empty">None in the top foods.</p>
          )}
        </Panel>

        <Panel title="Where calories come from" sub="Weighted by how often each food is eaten.">
          {mix ? (
            <Donut
              parts={[
                { label: "Protein", value: mix.protein, color: PALETTE.protein },
                { label: "Carbs", value: mix.carbs, color: PALETTE.carbs },
                { label: "Fat", value: mix.fat, color: PALETTE.fat },
              ]}
            />
          ) : (
            <p className="food-panel-empty">Not enough data yet.</p>
          )}
        </Panel>

        <Panel title="When I eat it" sub="Servings by the meal each food usually lands in.">
          <HBars rows={meals.map((m) => ({ label: m.meal, value: m.count }))} unit="×" color={PALETTE.carbs} />
        </Panel>

        <Panel title="Where to improve">
          <ul className="food-tips">
            {tips.map((tip) => (
              <li key={tip.title}>
                <strong>{tip.title}</strong>
                <span>{tip.detail}</span>
              </li>
            ))}
          </ul>
        </Panel>

        {recent && recent.length ? (
          <>
            <Panel title="Calories, last 30 days" sub="Only visible to me.">
              <TrendLine
                points={recent.map((d) => ({ label: shortDate(d.date), value: d.calories }))}
                target={recent[recent.length - 1]?.calorieTarget ?? t.calories}
                color={PALETTE.calories}
                unit=" kcal"
              />
            </Panel>
            <Panel title="Protein, last 30 days" sub="Only visible to me.">
              <TrendLine
                points={recent.map((d) => ({ label: shortDate(d.date), value: d.proteinGross }))}
                target={recent[recent.length - 1]?.proteinTarget ?? t.proteinGross}
                color={PALETTE.protein}
                unit=" g"
              />
            </Panel>
          </>
        ) : (
          <Panel title="Daily trends">
            <p className="food-panel-empty">
              Daily calories and protein over time are private and only show here when I&apos;m signed in.
            </p>
          </Panel>
        )}
      </div>
    </div>
  );
}
