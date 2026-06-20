# Unified Public "Health and Diet" Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship one new app, LifeDashboardApp, a one-screen public view composing Activity (WHOOP), Nutrition (calories/macros vs targets, recent days, streak), and Training (workout splits), and surface the life sections in the dock.

**Architecture:** LifeDashboardApp is a Client Component that reuses the existing HTTP feeds (`GET /api/whoop/data` and `GET /api/notion/data?dataset=nutrition`) rather than re-implementing any data aggregation. Presentational sections live in a sibling module so each file stays small. Nutrition is flipped from "private" to "public" at the dataset registry; its transform already emits only daily macro totals (no privateData), so no field stripping changes are needed.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Tailwind (Panther desktop tokens), lucide-react.

## Global Constraints

- Respect Server vs Client boundaries: LifeDashboardApp uses state/effects, so it MUST start with `"use client"` on line 1. Do not import server-only modules into it; call the existing API routes over fetch.
- No em dashes in code or copy. Use commas, periods, or "and".
- Compound-word hyphens where standard English uses them.
- Keep every file under ~400 lines.
- Conventional, attribution-free commit.
- Verify with `npm run build` (green) before committing. No test runner exists in this repo; verification is build + visual/deploy.

---

### Task 1: Make the nutrition dataset public

**Files:**
- Modify: `src/lib/notion/datasets.ts` (nutrition entry, `visibility`)

**Interfaces:**
- Consumes: `Visibility` ("public" | "private") from `@/data/notion/types`.
- Produces: `DATASETS.nutrition.visibility === "public"`, which makes `GET /api/notion/data?dataset=nutrition` serve anonymous viewers (200 instead of 401).

- [ ] Change `visibility: "private"` to `visibility: "public"` on the nutrition entry only. Leave the transform unchanged (it already emits only daily macro totals into `data`, with no `privateData`).

**Security gate (run before commit):** confirm exactly these fields become public: date, status, dayType, calories, calorieTarget, proteinGross, proteinBioavailable, proteinTarget, fat, carbs, fiberFood, fiberTotal, hitTargets. None are body-weight, medical, or PII. If a sensitive field is ever added to the nutrition transform, move it to `privateData` instead.

---

### Task 2: Presentational sections module

**Files:**
- Create: `src/components/apps/life/LifeSections.tsx`

**Interfaces:**
- Produces (exports):
  - `interface WhoopActivity { connected: boolean; caloriesBurned: number | null; strain: number | null; recovery: number | null; restingHr: number | null; sleepPct: number | null; sleepMs: number | null }`
  - `interface LatestWorkout { strain: number | null; calories: number | null; durationMs: number | null }`
  - `function SectionHeader({ children })`
  - `function ActivitySection({ activity, loading, onOpenWhoop }: { activity: WhoopActivity | null; loading: boolean; onOpenWhoop: () => void })`
  - `function NutritionSection({ state, days, onOpenNutrition }: { state: "loading" | "empty" | "error" | "ready"; days: NutritionDay[]; onOpenNutrition: () => void })`
  - `function TrainingSection({ splits, latestWorkout, onOpenSplit }: { splits: WhoopSplit[]; latestWorkout: LatestWorkout | null; onOpenSplit: (slug: string) => void })`
- Consumes: `NutritionDay`, `DEFAULT_NUTRITION_TARGETS` from `@/data/notion/types`; `WhoopSplit` from `@/data/whoop/splits`; lucide icons.
- Pure presentational. Panther tokens: `var(--desktop-border)`, `var(--desktop-surface)`, `var(--desktop-surface-raised)`, `text-desktop-text`, `text-desktop-text-secondary`. Rounded `rounded-lg border` cards, `text-[11px]`/`text-[10px]` captions.

---

### Task 3: Container app

**Files:**
- Create: `src/components/apps/life/LifeDashboardApp.tsx`

**Interfaces:**
- Consumes: `useDesktop()` (`openItem`), `findFSItem` from `@/data/fs`; sections from `./LifeSections`; `whoopSplits` from `@/data/whoop/splits`; `NutritionDay` from `@/data/notion/types`.
- Produces: default export `LifeDashboardApp` (matches the `Record<string, React.ComponentType<{ contentHtml?; fsItem? }>>` registry signature).
- Behavior: on mount, fetch `/api/whoop/data` and `/api/notion/data?dataset=nutrition` in parallel. Normalize the WHOOP response into `WhoopActivity` + `LatestWorkout` (caloriesBurned = `latestCycle.score.kilojoule * 0.239006`; sleepMs = `stage_summary.total_in_bed_time_milli - total_awake_time_milli`). Render Panther chrome (toolbar "Health and Diet", footer "Life") + the three sections. Section links call `openItem(findFSItem(id))` for ids `whoop-dashboard`, `nutrition`, `whoop-split-<slug>`.

- [ ] `"use client"` on line 1. Keep under 400 lines.

---

### Task 4: Register the component and the FSItem

**Files:**
- Modify: `src/components/desktop/WindowContent.tsx` (import + `appComponents` map entry `LifeDashboardApp`)
- Modify: `src/data/fs.ts` (add FSItem `{ id: "life", name: "Life", type: "app", icon: "Activity", appComponent: "LifeDashboardApp", description: "...", defaultSize: { width: 560, height: 720 } }`; add `life`, `health`, `recipes`, `media` to `dockItemIds`)

**Interfaces:**
- Consumes: `LifeDashboardApp` default export from Task 3.
- Produces: a launchable "Life" app reachable from the dock; `health`, `recipes`, `media` folders pinned to the dock.

---

### Task 5: Build, commit, deploy

- [ ] `cd ~/matthewrmckenzie.com && npm run build` until green.
- [ ] Run `ecc:security-reviewer` on the nutrition change.
- [ ] Commit (attribution-free): `feat(life): unified public Health and Diet dashboard, make nutrition public, surface life sections in the dock`
- [ ] `git push origin main`, then confirm the Vercel deploy.

## Self-Review

- Spec coverage: one app composing 3 sections (T2/T3), reuse fetchers via HTTP (T3), nutrition public + stripping intact (T1), register + FSItem (T4), dock surfacing (T4), existing apps keep working (unchanged), build/commit/push/deploy (T5). Covered.
- Honest gap: no per-meal items exist in the synced model; "recent meals" renders as recent daily logs.
- Type consistency: `WhoopActivity`/`LatestWorkout`/`NutritionDay`/`WhoopSplit` names used identically across T2/T3.
