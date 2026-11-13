"use client";

import React, { useEffect, useMemo, useState } from "react";
import { findFSItem } from "@/data/fs";
import { useDesktop } from "@/hooks/useDesktopStore";
import { profile } from "@/config/profile";
import { whoopSplits } from "@/data/whoop/splits";
import { recipes } from "@/content/recipes/index";
import { chessLog, photoEffect, foodRoomSelection } from "@/lib/duoStores";
import { effects as photoEffects } from "@/components/apps/PhotoBoothApp";
import { parseRecipe, firstDurationMinutes } from "./recipeParse";
import ResumeApp from "@/components/apps/ResumeApp";
import WorkOverviewApp from "@/components/apps/WorkOverviewApp";

// ============================================================================
// DUO VIEWS: the bottom halves (and the tops that are not just the app)
// ============================================================================

function openById(openItem: (i: NonNullable<ReturnType<typeof findFSItem>>) => void, id: string) {
  const item = findFSItem(id);
  if (item) openItem(item);
}

// ---------------------------------------------------------------- Work
export function WorkTop({ contentMap }: { contentMap: Record<string, string> }) {
  return (
    <div className="duo-pair">
      <section className="duo-doc" aria-label="Resume">
        <ResumeApp />
      </section>
      <section className="duo-doc" aria-label="Work Overview">
        <WorkOverviewApp contentHtml={contentMap["work-overview"]} />
      </section>
    </div>
  );
}

export function WorkBottom() {
  const { openItem } = useDesktop();
  return (
    <div className="duo-buttons">
      <button type="button" className="aqua-button is-large is-default" onClick={() => openById(openItem, "card")}>
        Business Card
      </button>
      <a className="aqua-button is-large" href={profile.scheduleUrl} target="_blank" rel="noopener noreferrer">
        Schedule a call
      </a>
      <a className="aqua-button is-large" href={`mailto:${profile.email}`}>
        Email
      </a>
      <a className="aqua-button is-large" href={profile.social.linkedin} target="_blank" rel="noopener noreferrer">
        LinkedIn
      </a>
    </div>
  );
}

// ---------------------------------------------------------------- Health
interface WhoopNumbers {
  strain: number | null;
  recovery: number | null;
}

function Dial({ label, value, max, unit }: { label: string; value: number | null; max: number; unit?: string }) {
  const pct = value == null ? 0 : Math.max(0, Math.min(1, value / max));
  const r = 52;
  const c = 2 * Math.PI * r * 0.75;
  return (
    <figure className="duo-dial">
      <svg viewBox="0 0 140 140" aria-hidden="true">
        <circle cx="70" cy="70" r={r} fill="none" stroke="var(--progress-track)" strokeWidth="12" strokeDasharray={`${c} 999`} transform="rotate(135 70 70)" strokeLinecap="round" />
        {value != null && (
          <circle cx="70" cy="70" r={r} fill="none" stroke="var(--accent)" strokeWidth="12" strokeDasharray={`${c * pct} 999`} transform="rotate(135 70 70)" strokeLinecap="round" />
        )}
      </svg>
      <figcaption>
        <span className="duo-dial-value">{value == null ? "No data" : `${Math.round(value * 10) / 10}${unit ?? ""}`}</span>
        <span className="duo-dial-label">{label}</span>
      </figcaption>
    </figure>
  );
}

export function HealthTop() {
  const [nums, setNums] = useState<WhoopNumbers | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "off">("loading");
  useEffect(() => {
    fetch("/api/whoop/data", { signal: AbortSignal.timeout(10000) })
      .then((r) => r.json())
      .then((d) => {
        if (!d?.connected) {
          setState("off");
          return;
        }
        setNums({ strain: d.latestCycle?.score?.strain ?? null, recovery: d.latestRecovery?.score?.recovery_score ?? null });
        setState("ready");
      })
      .catch(() => setState("off"));
  }, []);
  return (
    <div className="duo-dials">
      <Dial label="Day strain" value={nums?.strain ?? null} max={21} />
      <Dial label="Recovery" value={nums?.recovery ?? null} max={100} unit="%" />
      {state === "off" && <p className="duo-note">The WHOOP feed is not available right now, so the dials are empty.</p>}
      {state === "loading" && <p className="duo-note">Loading WHOOP data</p>}
    </div>
  );
}

export function HealthBottom() {
  return (
    <div className="duo-cards" aria-label="Workout splits">
      {[...whoopSplits].sort((a, b) => a.sortOrder - b.sortOrder).map((s) => (
        <a key={s.slug} className="duo-card" href={s.shareUrl} target="_blank" rel="noopener noreferrer">
          <span className="duo-card-eyebrow">Split</span>
          <span className="duo-card-title">{s.displayName}</span>
          <span className="duo-card-sub">{s.description}</span>
        </a>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------- Recipes
function useRecipeText(slug: string) {
  const [text, setText] = useState<string | null>(null);
  useEffect(() => {
    let off = false;
    fetch(`/recipes/${slug}.md`)
      .then((r) => (r.ok ? r.text() : ""))
      .then((t) => !off && setText(t))
      .catch(() => !off && setText(""));
    return () => {
      off = true;
    };
  }, [slug]);
  return text;
}

const stepStore = { listeners: new Set<() => void>(), step: 0 };

export function useCookingStep(): [number, (n: number) => void] {
  const [n, setN] = useState(stepStore.step);
  useEffect(() => {
    const l = () => setN(stepStore.step);
    stepStore.listeners.add(l);
    return () => {
      stepStore.listeners.delete(l);
    };
  }, []);
  return [
    n,
    (v: number) => {
      stepStore.step = v;
      stepStore.listeners.forEach((l) => l());
    },
  ];
}

export function RecipeTop({ slug }: { slug: string }) {
  const text = useRecipeText(slug);
  const recipe = useMemo(() => (text ? parseRecipe(text) : null), [text]);
  const [step, setStep] = useCookingStep();
  const [wake, setWake] = useState<"on" | "unsupported" | "off">("off");
  const title = recipes.find((r) => r.slug === slug)?.title ?? "Recipe";

  // Keep the screen on while cooking, where the Screen Wake Lock API exists.
  useEffect(() => {
    type Sentinel = { release: () => Promise<void> };
    const nav = navigator as Navigator & { wakeLock?: { request: (t: "screen") => Promise<Sentinel> } };
    let sentinel: Sentinel | null = null;
    if (!nav.wakeLock) {
      setWake("unsupported");
      return;
    }
    nav.wakeLock
      .request("screen")
      .then((s) => {
        sentinel = s;
        setWake("on");
      })
      .catch(() => setWake("off"));
    return () => {
      sentinel?.release().catch(() => {});
    };
  }, []);

  const steps = recipe?.steps ?? [];
  const cur = steps[Math.min(step, Math.max(0, steps.length - 1))];
  return (
    <div className="duo-cook">
      <p className="duo-cook-meta">
        {title}
        {steps.length > 0 && `, step ${Math.min(step, steps.length - 1) + 1} of ${steps.length}`}
        <span className="duo-cook-wake">
          {wake === "on" ? "Screen stays on" : wake === "unsupported" ? "This browser cannot keep the screen on" : ""}
        </span>
      </p>
      <p className={`duo-cook-step ${cur && cur.length > 140 ? "is-long" : ""}`}>{text === null ? "Loading the recipe" : cur ?? "This recipe has no numbered steps."}</p>
      <div className="duo-cook-nav">
        <button type="button" className="aqua-button is-large" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
          Previous step
        </button>
        <button type="button" className="aqua-button is-large is-default" onClick={() => setStep(Math.min(steps.length - 1, step + 1))} disabled={step >= steps.length - 1}>
          Next step
        </button>
      </div>
    </div>
  );
}

function StepTimer({ minutes, label }: { minutes: number; label: string }) {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    if (left == null || left <= 0) return;
    const id = window.setInterval(() => setLeft((s) => (s == null ? s : s - 1)), 1000);
    return () => window.clearInterval(id);
  }, [left]);
  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  return (
    <button type="button" className="duo-timer" onClick={() => setLeft(left == null ? minutes * 60 : null)}>
      <span className="site-num">{left == null ? `${minutes} min` : left <= 0 ? "Done" : fmt(left)}</span>
      <span>{label}</span>
    </button>
  );
}

export function RecipeBottom({ slug }: { slug: string }) {
  const text = useRecipeText(slug);
  const recipe = useMemo(() => (text ? parseRecipe(text) : null), [text]);
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const timers = (recipe?.steps ?? [])
    .map((s, i) => ({ i, m: firstDurationMinutes(s) }))
    .filter((t): t is { i: number; m: number } => t.m != null)
    .slice(0, 6);
  return (
    <div className="duo-recipe">
      <ul className="duo-checklist" aria-label="Ingredients">
        {(recipe?.ingredients ?? []).map((ing, i) => (
          <li key={i}>
            <label>
              <input type="checkbox" checked={!!checked[i]} onChange={(e) => setChecked({ ...checked, [i]: e.target.checked })} />
              <span>{ing}</span>
            </label>
          </li>
        ))}
      </ul>
      {timers.length > 0 && (
        <div className="duo-timers" aria-label="Step timers">
          {timers.map((t) => (
            <StepTimer key={t.i} minutes={t.m} label={`Step ${t.i + 1}`} />
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- Food Room
function press(key: string, type: "keydown" | "keyup") {
  document.dispatchEvent(new KeyboardEvent(type, { key, bubbles: true }));
}

export function FoodRoomBottom() {
  const foods = foodRoomSelection.use();
  const pad = (key: string, label: string, cls: string) => (
    <button
      type="button"
      className={`duo-pad-btn ${cls}`}
      aria-label={label}
      onPointerDown={() => press(key, "keydown")}
      onPointerUp={() => press(key, "keyup")}
      onPointerLeave={() => press(key, "keyup")}
    />
  );
  return (
    <div className="duo-food">
      <div className="duo-pad" role="group" aria-label="Move">
        {pad("ArrowUp", "Up", "is-up")}
        {pad("ArrowLeft", "Left", "is-left")}
        {pad("ArrowRight", "Right", "is-right")}
        {pad("ArrowDown", "Down", "is-down")}
      </div>
      <button
        type="button"
        className="duo-action"
        aria-label="Action"
        onClick={() => {
          const floor = document.querySelector("[data-food-room-floor]") as HTMLElement | null;
          floor?.focus();
          floor?.dispatchEvent(new KeyboardEvent("keydown", { key: "e", bubbles: true }));
        }}
      >
        A
      </button>
      <div className="duo-food-stats" aria-live="polite">
        {foods && foods.length > 0 ? (
          foods.map((f) => (
            <p key={f.name}>
              <strong>{f.name}</strong>
              <span className="site-num">
                {[f.avgCalories != null && `${Math.round(f.avgCalories)} kcal`, f.avgProtein != null && `${Math.round(f.avgProtein)} g protein`]
                  .filter(Boolean)
                  .join(", ")}
              </span>
            </p>
          ))
        ) : (
          <p>Walk to a food and tap it to see its stats here.</p>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Chess
function useTick(ms: number) {
  const [, set] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => set((n) => n + 1), ms);
    return () => window.clearInterval(id);
  }, [ms]);
}

export function ChessTop() {
  const log = chessLog.use();
  useTick(1000);
  const now = Date.now();
  const spent = { w: 0, b: 0 };
  let t = log.startedAt;
  let turn: "w" | "b" = "w";
  for (const m of log.moves) {
    spent[m.color] += m.at - t;
    t = m.at;
    turn = m.color === "w" ? "b" : "w";
  }
  spent[turn] += now - t;
  const fmt = (ms: number) => {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  };
  const pairs: string[][] = [];
  log.moves.forEach((m, i) => {
    if (i % 2 === 0) pairs.push([m.text]);
    else pairs[pairs.length - 1].push(m.text);
  });
  return (
    <div className="duo-chess">
      <div className="duo-clocks">
        <p data-active={turn === "w" || undefined}>
          <span>White (you)</span>
          <span className="site-num">{fmt(spent.w)}</span>
        </p>
        <p data-active={turn === "b" || undefined}>
          <span>Black</span>
          <span className="site-num">{fmt(spent.b)}</span>
        </p>
      </div>
      <ol className="duo-moves" aria-label="Moves">
        {pairs.length === 0 ? <li>Make the first move on the board below.</li> : pairs.map((p, i) => <li key={i} className="site-num">{`${i + 1}. ${p.join("  ")}`}</li>)}
      </ol>
    </div>
  );
}

// ---------------------------------------------------------------- Photo Booth
export function PhotoBoothBottom() {
  const active = photoEffect.use();
  return (
    <div className="duo-effects" role="radiogroup" aria-label="Effects">
      {photoEffects.map((fx) => (
        <button key={fx.id} type="button" role="radio" aria-checked={active === fx.id} className="duo-effect" onClick={() => photoEffect.set(fx.id)}>
          {fx.label}
        </button>
      ))}
    </div>
  );
}
