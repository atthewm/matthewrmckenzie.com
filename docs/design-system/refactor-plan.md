# Design-System Refactor Plan — McKenzie OS

> Sequenced cleanup over 3 sprints. References the
> [`tech-debt`](../tech-debt.md) backlog by ID, the
> [`design-system`](./README.md) reference, and the
> [`component-graph`](../component-graph.mmd).

This is a **draft GitHub issue** — copy/paste into a tracking issue when
ready, or split into 3 milestone issues (one per sprint). Boxes are
empty so the issue stays actionable.

## Goals (across all 3 sprints)

- Land a single, documented set of design tokens (color, type,
  spacing, z-index, motion).
- Hit WCAG 2.2 AA across every chrome surface (Dock, MenuBar,
  Spotlight, Exposé, ContextMenu, DesktopIcon).
- Cut the 33-import god-component (`WindowContent`) down to a registry
  with code splitting.
- Extract 4-5 shared app primitives so adding a new app is mostly
  configuration, not boilerplate.
- Leave the simulator visually identical at the end of every sprint.

## Sprint cadence

- ~1 working week per sprint.
- Each sprint ends with a green `npm run build` and manual smoke pass
  of: boot, open 3 apps, theme toggle, Spotlight, Exposé, dock, mobile
  README auto-open, both reduced-motion modes.

---

## Sprint 1 — Tokens, z-index, and the worst inline-style page

**Theme:** stop the bleeding. Introduce the token scale, retire the
worst regression files.

### Definition of done

- [ ] `tailwind.config.ts` extends `zIndex`, `fontSize`, `spacing`
  with documented scales.
- [ ] No file uses `z-[\d+]` or `zIndex: <number>` — `git grep` returns
  zero results outside `tailwind.config.ts`.
- [ ] `gate/page.tsx` renders identically (visual diff at 320 / 768 /
  1440) but uses Tailwind classes + tokens, no inline `style={...}`.
- [ ] `audit/` directory archived under `docs/archive/2026-02-audit/`
  (or deleted after stakeholder ack).
- [ ] `panther-theme.ts` either deleted or repurposed into a typed
  tokens module.
- [ ] Build green; no new console errors.

### Tasks

- [ ] **`P0-1`** Add z-index scale to `tailwind.config.ts`
  (`base / sticky / dock / menubar / modal / contextmenu / spotlight /
  expose / screensaver / boot / shutdown`). Update each file in
  `tech-debt.md §P0-1` to reference the new scale.
- [ ] **`P0-5`** Replace `let nextZ = 100` in `FloatingStickies.tsx`
  with provider state and persist `maxZ` alongside the array in
  `localStorage["mmck-stickies-v2"]`.
- [ ] **`P1-7` (part 1 — type scale)** Define `fontSize` extensions in
  `tailwind.config.ts` (`xxs: ['10px', { lineHeight: '14px' }]`,
  through to `display: ['28px', ...]`). Replace the obvious offenders
  in `AffiliationRow`, `gate/page.tsx`, `page.tsx`.
- [ ] **`P1-7` (part 2 — spacing)** Define a small custom spacing
  scale (`1.25 / 2.5 / 4.5 / 7 / 11`) only for values that recur 5+
  times. Don't fabricate ones we don't use.
- [ ] **`P0-4`** Rewrite `gate/page.tsx` against tokens. Extract any
  reused field/button into a tiny local component if it appears more
  than once.
- [ ] **`P0-6`** Move `audit/` (root) → `docs/archive/2026-02-audit/`.
  Update `CLAUDE_AUDIT_LOG.md` to point at the new path.
- [ ] **`P1-4`** Decide on `panther-theme.ts`. If keeping, refactor
  into a typed tokens module and import once from `globals.css` (via
  CSS-in-TS export). If deleting, remove and link `globals.css` from
  the design-system README.
- [ ] **`P1-6`** Apply naming convention: rename
  `AppleMusicFolder` → `AppleMusicFolderApp` (update `WindowContent`
  + `data/fs.ts` `appComponent` field).
- [ ] **`P1-10`** Break `MenuBar → DesktopShell` cycle by extracting
  `useShutdown` into a `ShutdownContext.tsx` next to `DesktopProvider`.

### Risk / mitigation

- **Risk:** Z-index changes break overlay ordering during shutdown,
  boot, or modal screens. **Mitigation:** Land scale + replace one
  layer at a time, smoke after each.
- **Risk:** `gate/page.tsx` is the auth wall — visual regression is
  user-visible. **Mitigation:** Keep the existing layout intact; only
  swap `style` for `className`. Diff screenshots before/after.

---

## Sprint 2 — Accessibility + token regressions in chrome and players

**Theme:** make every chrome surface keyboard- and screenreader-friendly.
Sweep token regressions outside the gate page.

### Definition of done

- [ ] `Dock`, `MenuBar`, `Spotlight`, `Exposé`, `ContextMenu`,
  `DesktopIcon` pass keyboard-only operation checklists (see below).
- [ ] axe-core run on `/` and `/about` reports zero serious / critical
  violations.
- [ ] `text-gray-*`, `bg-gray-*`, `bg-white`, `text-white`, `bg-black`
  return zero results across `src/components/{desktop,settings,
  players}/` (`gate/page.tsx` already cleaned up in Sprint 1; OG image
  remains a deliberate exception).
- [ ] Reduced-motion guards confirmed in `Dock`, `Exposé`, `Screensaver`,
  `FloatingStickies` (manual test with macOS "Reduce motion" on).
- [ ] Build green; manual smoke pass.

### Tasks

- [ ] **`P0-2`** Dock: wrap in `<nav role="toolbar" aria-label="Dock">`,
  add roving tabindex, add `aria-pressed` for focused windows, gate
  magnification on `useReducedMotion`.
- [ ] **`P0-3`** MenuBar: full WAI-ARIA menubar pattern.
  Includes Esc, ArrowLeft / ArrowRight between top-level items,
  ArrowUp / ArrowDown inside menus, Tab-to-exit, `aria-haspopup`,
  `aria-expanded`. Mobile branch reuses the same hooks.
- [ ] **`P1-5` (part 1)** Spotlight: `role="combobox"` /
  `aria-controls` / `aria-activedescendant`; results `role="listbox"`
  / `role="option"`; results announce icon name.
- [ ] **`P1-5` (part 2)** Exposé: replace thumbnail `<div>`s with
  `<button aria-label="Focus window: ${title}">` and add escape via
  Esc / `F9`. Restore previous focus when closing.
- [ ] **`P1-5` (part 3)** ContextMenu: `role="menu"` on container,
  `role="menuitem"` (or `menuitemcheckbox`) on rows. Arrow-up/down to
  navigate, Enter to invoke, Esc to close.
- [ ] **`P1-9`** DesktopIcon: convert to `<button>` with explicit
  Enter/Space activation. Drag handler attaches via pointer events
  only when not initiated from keyboard.
- [ ] **`P1-1`** Replace token regressions in:
    - [ ] `Window.tsx:316` (`hover:bg-black/5 active:bg-black/10`).
    - [ ] `Spotlight.tsx:108-160` (result-row hovers).
    - [ ] `Desktop.tsx:237` (skip link `focus:bg-white focus:text-black`).
    - [ ] `players/YouTubeWinampPlayer.tsx` (`text-gray-*`, `bg-gray-*`).
    - [ ] `players/SoundCloudPlayer.tsx` (`text-gray-*`).
    - [ ] `settings/SettingsApp.tsx` (`bg-white`, `text-white`).
- [ ] **`P1-8`** Add `useReducedMotion()` hook in `src/hooks/`. Wire
  into Dock magnification, Exposé thumbnail hover, Screensaver
  rAF loop, FloatingStickies drag.
- [ ] **`P0-3` follow-up** Keyboard cheat sheet panel
  (Help → "Keyboard Shortcuts") that documents F9, Cmd+Space,
  Cmd+W, Cmd+M, Tab navigation. Lives in `MenuBar` Help submenu.

### Keyboard-only acceptance criteria

| Surface | What I must be able to do |
|---|---|
| Static page | Tab to skip link → activate → focus jumps to `<main>`; Tab again to first link in main; Tab to footer. |
| Open window | Tab cycles inside; Shift+Tab cycles back; Esc closes. |
| MenuBar | Tab reaches Apple menu; Arrow Right moves to File…Help; Arrow Down opens; Arrow Up/Down within; Esc closes; Tab exits. |
| Dock | Tab reaches dock; Arrow Left/Right moves; Enter opens; Cmd+drop returns to magnification when reduced-motion off. |
| Spotlight | Cmd+Space opens, focus on input; Arrow Down highlights result; Enter opens; Esc closes. |
| Exposé | F9 opens; Tab cycles thumbnails; Enter focuses that window; Esc/F9 closes. |
| ContextMenu | Right-click opens; Arrow Up/Down navigates; Enter invokes; Esc closes. |
| DesktopIcon | Tab reaches icon row; Arrow Right moves; Enter opens. |

---

## Sprint 3 — Shared app shell + WindowContent registry + extract data

**Theme:** make adding an app a 50-line task. Free up bundle size.

### Definition of done

- [ ] `src/components/ui/app/` exists with `AppToolbar`, `AppScrollPane`,
  `AppFooter`, `AppListItem`, `AppEmptyState`. Each has props,
  reduced-motion handling, and at least 2 consumers migrated.
- [ ] `WindowContent.tsx` import count drops from 33 to ≤5; remaining
  imports load apps via `React.lazy(() => import(...))` keyed by
  string.
- [ ] Bundle analyzer shows initial JS for `/` reduced (target: 25%
  smaller for first-paint, measured via `next build --analyze`).
- [ ] Hardcoded data in 5 apps moved to `src/data/*` or fetched.
- [ ] No P0 left open. Sprint 1+2 follow-ups closed or rolled to P2.

### Tasks

- [ ] **`P1-2` (a)** Build `<AppToolbar />`, `<AppScrollPane />`,
  `<AppFooter />` in `src/components/ui/app/` with stories (or simple
  README example block). Token-only styling.
- [ ] **`P1-2` (b)** Build `<AppListItem />` and `<AppEmptyState />`.
  Reuse `EmptyContent` semantics where sensible — don't duplicate.
- [ ] **`P1-2` (c)** Migrate 6 apps to the new primitives as
  proof points: `BrowserApp`, `MarkdownViewer`, `RecipeViewer`,
  `GalleryApp`, `WhatsNewApp`, `GitHubApp`. Visual diff before/after.
- [ ] **`P1-11`** Convert `WindowContent.tsx` into a lazy registry:
    ```ts
    const APP_REGISTRY = {
      AboutApp: () => import("@/components/apps/AboutApp"),
      BrowserApp: () => import("@/components/apps/BrowserApp"),
      // …
    } satisfies Record<string, () => Promise<{ default: ComponentType<any> }>>;
    ```
    Wrap in `<Suspense fallback={<AppLoadingSkeleton />}>` and stop
    statically importing 30 apps at the top of the file.
- [ ] **`P1-3`** Move hardcoded data:
    - [ ] `LinktreeApp.tsx:53-93` → `src/data/linktree.ts`.
    - [ ] `WhatsNewApp.tsx:32-133` → `src/content/changelog/*.md` via
      `getContent("changelog")`.
    - [ ] `GitHubApp.tsx:25-109` → live fetch with
      `cache: "force-cache"` and `revalidate` (Next 15 fetch options).
    - [ ] `StartHereApp.tsx:14-30` → `src/data/startHere.ts`.
- [ ] **`P2-2`** Once the registry is in, run `next build --analyze`,
  capture JS sizes per route, paste into the issue.

### Stretch (if time)

- [ ] **`P2-7`** Extract `useResizeWindow` and `useWindowFocusTrap` from
  `Window.tsx` into hooks under `src/hooks/`.
- [ ] **`P2-9`** Split `WhoopDashboardApp.tsx` into `index.tsx` +
  `LiveDashboard.tsx` + `StaticDashboard.tsx`.

---

## Out of scope for these 3 sprints

These are tracked in [`tech-debt.md`](../tech-debt.md) but not scheduled:

- **`P2-1`** Game-grid semantics (Chess/Minesweeper/PhotoBooth/Gallery/
  Terminal) — large per-app work.
- **`P2-4`** Settings store fragmentation / migration story.
- **`P2-6`** Playwright visual-regression suite.
- **`P2-8`** MenuBar split (only after `P0-3` ships and stabilises).
- **`P2-10`** Reconcile/archive top-level `README.md` and
  `CLAUDE_AUDIT_LOG.md`.

---

## Verification checklist (run at the end of every sprint)

- [ ] `npm run build` passes locally (Next.js production build).
- [ ] Manual smoke: boot animation, open 3 windows, switch theme,
  run Spotlight, run Exposé, dock click, mobile breakpoint at 375.
- [ ] Reduced-motion test: macOS Settings → Accessibility → Display →
  "Reduce motion" ON, retest dock, exposé, screensaver.
- [ ] Keyboard-only test: unplug mouse, run through the keyboard
  acceptance table for the surfaces touched in that sprint.
- [ ] `git grep -nE 'z-\[[0-9]+\]|zIndex:\s*[0-9]+'` returns nothing
  outside `tailwind.config.ts` (after Sprint 1).
- [ ] `git grep -nE '\b(bg|text)-(gray|black|white)\b' src/components`
  returns nothing (after Sprint 2; players + settings + skip link).

---

## Tracking template

Copy into the issue's first comment when you start each sprint:

```
### Sprint N progress
- [ ] All DoD items checked
- [ ] All tasks linked to PRs
- [ ] Smoke + reduced-motion + keyboard checks done
- [ ] Bundle size reported (Sprint 3 only)
- [ ] Follow-ups filed against next sprint or P2 backlog
```
