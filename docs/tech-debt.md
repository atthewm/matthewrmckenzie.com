# Tech Debt Backlog — McKenzie OS

> Source: design-system audit on 2026-05-08 against branch `audit/phase-0-5`.
> Companion docs: [`design-system/README.md`](./design-system/README.md),
> [`design-system/refactor-plan.md`](./design-system/refactor-plan.md),
> [`component-graph.mmd`](./component-graph.mmd).

Severity rubric:

- **P0 — ship blocker / a11y violation / silent correctness risk.** Must
  land before the next public release window.
- **P1 — drift that costs us velocity.** Land within the next two sprints
  while the design-system pass is fresh.
- **P2 — known smell, no immediate user impact.** Track but defer; revisit
  every quarter.

Each item: ID · scope · evidence · proposed fix · estimated effort
(S = ≤½ day, M = 1-2 days, L = 3-5 days).

---

## P0 — Ship blockers

### P0-1 · Centralise z-index scale
**Scope:** All `desktop/*` and `apps/whoop/WhoopDashboardApp.tsx`.
**Evidence (verified):**

```
ZenBackground.tsx:175       z-[10]
Window.tsx:282               zIndex: 10
FloatingStickies.tsx:38      let nextZ = 100   // mutable module global
Dock.tsx:229                 z-[9999]
WhoopDashboardApp.tsx:277    z-[9999]
MenuBar.tsx:481              z-[10000]
MenuBar.tsx:66               z-[10001]
MenuBar.tsx:149              z-[10002]
ContextMenu.tsx:62           z-[99990]
Expose.tsx:115               z-[99990]
Spotlight.tsx:106            z-[99995]
Screensaver.tsx:264          z-index: 99998
DesktopShell.tsx:61          z-[99999]
Desktop.tsx:237              z-[99999]
Desktop.tsx:302              z-[99999]
DesktopShell.tsx:158         z-[999999]
```

`FloatingStickies` starts at `100` so any sticky sits **below** the dock
(`9999`) despite the visual layering implying otherwise.

**Fix:** Add a documented scale to `tailwind.config.ts` and replace ad-hoc
arbitrary values:

```
zIndex: {
  base: 0,
  sticky: 100,        // floating notes (raise above dock when focused)
  dock: 2000,
  menubar: 3000,
  modal: 4000,
  contextmenu: 4100,
  spotlight: 4200,
  expose: 4300,
  screensaver: 5000,
  boot: 9000,
  shutdown: 9100,
}
```

Then convert sticky's `nextZ` into context state (already lives in a
`FloatingStickies` provider in plan).
**Effort:** M.

---

### P0-2 · Dock keyboard accessibility
**Scope:** `src/components/desktop/Dock.tsx`.
**Evidence:** Dock items render as `<button>` but the dock itself is
`role`-less and not part of the focus order. Verified by tracing tab order
in `Desktop.tsx` — focus jumps from skip link → first window → menus,
skipping dock entirely. Magnification animation also bypasses
`prefers-reduced-motion`.

**Fix:**
1. Wrap items in `<nav role="toolbar" aria-label="Dock">` with roving
   tabindex (arrow keys move, Enter activates).
2. Add explicit `aria-pressed` on items mapped to a focused window.
3. Wrap magnification scale transform in `if (!prefersReducedMotion)`.
**Effort:** M.

---

### P0-3 · MenuBar ARIA + keyboard navigation
**Scope:** `src/components/desktop/MenuBar.tsx` (571 LoC).
**Evidence:** No `role="menubar"` on the root `<div>`; dropdowns have no
`role="menu"`/`menuitem`; arrow-key navigation between menus is missing
(only mouse hover / click open them). Mobile collapses items but inherits
the same gaps.

**Fix:** Apply standard menubar pattern (WAI-ARIA Authoring Practices):
- Root: `role="menubar"`, manage `aria-activedescendant` or roving tabindex.
- Triggers: `aria-haspopup="menu"`, `aria-expanded`.
- Dropdowns: `role="menu"`; items `role="menuitem"`.
- Keyboard: ArrowLeft/Right between top items; ArrowUp/Down inside menus;
  Esc closes; Tab exits.
**Effort:** L.

---

### P0-4 · Replace inline-styled `gate/page.tsx`
**Scope:** `src/app/gate/page.tsx` (144 LoC).
**Evidence:** Eleven raw hex codes (`#0071e3`, `#2196F3`, `#1976D2`,
`#1565C0`, `#ff6b6b`, `#333`, `#666`, `#777`, `#555`, `#2d2d2d`,
`#1a1a1a`, `#111`, `#fff`) and 47 inline `style={{ ... }}` objects with
hardcoded `28px`, `13px`, `11px`, `4px`, `220px`, `240px`, etc. None of
the desktop tokens reach this surface.

**Fix:** Rewrite using Tailwind classes against
`bg-desktop-accent`, `text-desktop-text`, `text-desktop-text-secondary`,
`focus-visible:ring-desktop-accent`. Extract auth field + button into
small primitives if reused.
**Effort:** M.

---

### P0-5 · Stickies global mutable state
**Scope:** `src/components/desktop/FloatingStickies.tsx:38`.
**Evidence:**

```ts
let nextZ = 100;
```

Module-scoped `let`. Two consequences:
1. Hot-reload in dev resets z-index but production hydration on a fresh
   visit also resets, so order-of-creation is lost across sessions.
2. The number is never persisted alongside `mmck-stickies-v2` in
   `localStorage`, so reopening always starts at `100`.

**Fix:** Move into the existing reducer/context for stickies, persist
`maxZ` alongside the array, integrate with the new z-index scale (P0-1).
**Effort:** S.

---

### P0-6 · Static-pass content drift in `audit/`
**Scope:** Repo root `audit/AUDIT.md`, `PUNCH_LIST.md`, `ROUTES.md`,
`PLACEHOLDERS.md`.
**Evidence:** Files dated 2026-02-20, predate this audit, and reference
routes / components that have since changed. They will mislead future
contributors who diff against them.
**Fix:** Move under `docs/archive/2026-02-audit/` or delete after
confirming nothing in CI references them.
**Effort:** S.

---

## P1 — Drift to clean up

### P1-1 · Token regressions outside the design system
**Scope:** Players + Settings + Window + Spotlight + skip link.
**Evidence (verified):**

```
Window.tsx:316             hover:bg-black/5 active:bg-black/10
Spotlight.tsx:108-160      hover:bg-black/5
Desktop.tsx:237            focus:bg-white focus:text-black  (skip link)
players/YouTubeWinampPlayer.tsx
                           text-gray-{300,400,500},
                           bg-gray-{600,700},
                           hover:bg-gray-600, hover:text-white
players/SoundCloudPlayer.tsx
                           text-gray-{400,500}
settings/SettingsApp.tsx   bg-white, text-white (toggle handles)
```

**Fix:** Map each to the `*-desktop-*` equivalents. For toggle handles,
introduce a `<Toggle>` primitive that uses
`bg-desktop-surface peer-checked:bg-desktop-accent`.
**Effort:** M.

---

### P1-2 · Extract shared app shell primitives
**Scope:** `src/components/apps/*`.
**Evidence:** Toolbar + scrollable content + footer pattern duplicated
across 14+ apps (`AboutApp`, `BrowserApp:104-145`, `GalleryApp`,
`GuestbookApp:100-250`, `MarkdownViewer:40-86`, `RecipeViewer:26-117`,
`ProjectsApp:15-63`, `WhatsNewApp:31-240`, `ResumeApp`, `WhoopDashboardApp`,
…). Sidebar pattern in 3+ (`AppleMusicFolder`, `FolderView`, `WhoopSplitApp`).
List-item card in 4+ (`GitHubApp`, `WhatsNewApp`, `GuestbookApp`,
`AppleMusicFolder`).

**Fix:** Add `src/components/ui/app/` with:
- `<AppToolbar title actions left right />`
- `<AppScrollPane />` (`flex-1 overflow-auto scrollbar-thin`)
- `<AppFooter />`
- `<AppListItem title subtitle metadata onSelect selected />`
- `<AppEmptyState icon heading helper action />` (distinct from
  marketing-page `EmptyContent`)

Migrate 1-2 apps as proof points, then sweep.
**Effort:** L.

---

### P1-3 · Extract hardcoded data
**Scope:** Six apps with inline arrays.
**Evidence:**

| File | Inline | LOC |
|---|---|---|
| `LinktreeApp.tsx:53-93` | social/project/action links | ~40 lines |
| `WhatsNewApp.tsx:32-133` | release entries | ~100 lines of 240 total |
| `GitHubApp.tsx:25-109` | repos | ~80 lines of 109 total |
| `StartHereApp.tsx:14-30` | quickLinks + exploreLinks | ~16 lines |
| `RecipeViewer.tsx` | recipe metadata | partial — already in `src/content/recipes/` |

**Fix:**
- Move static lists into `src/data/*.ts` modules.
- For `GitHubApp`, replace with a `useEffect` fetch against
  `https://api.github.com/users/<login>/repos` (with `revalidate` cache).
- For `WhatsNewApp`, lift release notes into `src/content/changelog/*.md`
  and reuse `getContent`.
**Effort:** M.

---

### P1-4 · Decide the fate of `panther-theme.ts`
**Scope:** `src/config/panther-theme.ts`.
**Evidence:** No imports across `src/`. Duplicates `globals.css` traffic
light + window chrome colors. If deleted, no behavior changes.
**Fix:** Either
(a) delete and document Panther tokens directly in
`design-system/README.md`, or
(b) export typed token objects, drive `globals.css` from them via a
build step (e.g., `cssnano` or a small CodeGen). The audit recommends (a)
to avoid build-step churn.
**Effort:** S.

---

### P1-5 · Spotlight + Exposé + ContextMenu ARIA
**Scope:** `src/components/desktop/Spotlight.tsx`,
`Expose.tsx`, `ContextMenu.tsx`.
**Evidence:**
- Spotlight has the right keyboard model but no `role="combobox"` on the
  search input nor `role="listbox"` / `role="option"` on the result rows.
- Exposé thumbnails are `<button>`-less divs: AT users have no idea what
  selecting one will do.
- ContextMenu is a `<div role-less>` with manual close handlers.

**Fix:** Apply WAI-ARIA combobox / menu / option roles, label each result
("Open About Me", "Focus window: Browser"), keep existing keyboard
handlers.
**Effort:** M.

---

### P1-6 · Component naming convention
**Scope:** Two outliers.
**Evidence:**

| Current | Issue | Proposed |
|---|---|---|
| `AppleMusicFolder.tsx` | Uses `Folder` suffix; everything else windowed is `*App`. | `AppleMusicFolderApp.tsx` (or `AppleMusicApp.tsx`) |
| `FolderView.tsx` | `View` suffix; nothing else uses it. It's chrome-level so a no-suffix name reads better. | `Folder.tsx` or keep — see refactor plan §Sprint 1 |

Convention codified in `design-system/README.md §6.1`. Land convention
note + the rename together so future contributors don't drift.
**Effort:** S.

---

### P1-7 · Type scale + spacing scale tokens
**Scope:** `tailwind.config.ts`, all surfaces.
**Evidence:** No `--text-*` tokens; arbitrary `text-[10px]`,
`text-[12px]`, inline `fontSize: "28px"` etc. Spacing relies on Tailwind
defaults plus inline `px` (`gate/page.tsx`, `ContextMenu.tsx`,
`page.tsx`, FloatingStickies defaults).
**Fix:** Define `fontSize` and `spacing` extensions in `tailwind.config.ts`,
ban inline `px` via lint rule (or simple grep-based check in CI).
**Effort:** M.

---

### P1-8 · Reduced-motion gaps
**Scope:** Dock, Exposé, Screensaver canvas, FloatingStickies drag.
**Evidence:** `globals.css:281-289` clamps CSS animation/transition
durations to `0.01ms` under `prefers-reduced-motion: reduce`. But
`Dock.tsx` magnification is a JS-driven inline transform; Exposé hover
scale isn't gated; Screensaver runs `requestAnimationFrame` continuously;
FloatingStickies drag uses rAF.
**Fix:** Add a `useReducedMotion` hook (single source) and short-circuit
the relevant rAF loops / inline transforms.
**Effort:** S.

---

### P1-9 · DesktopIcon keyboard activation
**Scope:** `src/components/desktop/DesktopIcon.tsx`.
**Evidence:** Icons are draggable `<div>`s with double-click handlers.
They are not in the tab order; Enter / Space don't open.
**Fix:** Convert to `<button>` for keyboard, layer a separate drag handle
or use `pointerdown` capture only when not driven by keyboard.
**Effort:** S.

---

### P1-10 · Break `MenuBar → DesktopShell` import cycle
**Scope:** `MenuBar.tsx` imports `useShutdown()` from `DesktopShell`,
which renders `Desktop`, which renders `MenuBar`.
**Evidence:** Dependency graph (see `component-graph.mmd`).
**Fix:** Lift `useShutdown` into a tiny `ShutdownContext.tsx` adjacent to
`DesktopProvider`. `DesktopShell` provides the value, `MenuBar`
consumes it; cycle breaks.
**Effort:** S.

---

### P1-11 · Decompose `WindowContent.tsx` god component
**Scope:** `src/components/desktop/WindowContent.tsx` (33 imports — the
single highest-coupling node in the repo).
**Evidence:** Verified by edge-count in `component-graph.mmd` and import
listing in §3.2 of `design-system/README.md`.
**Fix:** Replace static imports with a registry that uses
`React.lazy(() => import(...))` keyed by `appComponent` string. Adds
code-splitting for free.
**Effort:** M.

---

## P2 — Defer / track

### P2-1 · Game grids without semantic markup
**Scope:** `ChessApp:289-487`, `MinesweeperApp:86-309`,
`PhotoBoothApp:50-327`, `GalleryApp`, `TerminalApp:78-418`.
**Evidence:** `<div>` cells, no role, no keyboard nav. Recreating WCAG-
compliant interactions for each is a sprint per app.
**Fix:** Wrap grids in `role="grid"` with `role="gridcell"` children;
maintain roving tabindex. `TerminalApp` should expose its output region
as `role="log" aria-live="polite"`.
**Effort:** L per app.

---

### P2-2 · Bundle splitting per app
**Scope:** All `apps/*`.
**Evidence:** `WindowContent.tsx` statically imports every app, so the
homepage ships every app's code even if the user never opens
`PhotoBooth`. With React 19 + Next 15, dynamic imports plus the registry
pattern (P1-11) reduce initial JS noticeably.
**Effort:** S after P1-11.

---

### P2-3 · Move OG image hex codes into tokens
**Scope:** `src/app/opengraph-image.tsx`.
**Evidence:** Six raw hex codes used to draw the OG card.
**Trade-off:** These run in the Edge runtime that compiles JSX → image,
so they cannot read CSS variables. Replacing them requires importing
typed tokens from a TS module.
**Fix (deferred):** Once `panther-theme.ts` is repurposed (P1-4) into a
typed tokens module, import its color exports here.
**Effort:** S after P1-4.

---

### P2-4 · Settings store fragmentation
**Scope:** `useSettingsStore`, `useDesktopStore`, multiple
`localStorage` keys (`mmck-booted`, `mmck-desktop-state`,
`mmck-settings`, `mmck-desktop-icon-positions`, `mmck-stickies-v2`).
**Evidence:** Five separate persistence layers, each with its own
serialisation. No version field, no migration story.
**Fix:** Add a `STORAGE_VERSION` constant per slice and a tiny migration
helper. Optionally consolidate into a single `mmck-state` blob.
**Effort:** M.

---

### P2-5 · `audit/SCREENSHOTS` + `SCREENSHOTS.zip` (4.7 MB)
**Scope:** Repo root.
**Evidence:** A 4.7 MB zip and 7 PNGs committed to the repo. They are
the previous audit's artifacts; not consumed by build.
**Fix:** Move to release notes / GitHub issue, or `.gitignore` and store
in cloud storage. Remove from git history if size becomes painful.
**Effort:** S.

---

### P2-6 · Visual regression coverage
**Scope:** Whole simulator + static pages.
**Evidence:** No Playwright suite present. Web-coding-style rules call
for visual regression at 320 / 768 / 1024 / 1440.
**Fix:** Spike with Playwright + `@playwright/test` snapshots on the
boot screen, default desktop, an open window, MenuBar, Dock, Exposé,
Spotlight, both themes, both reduced-motion modes.
**Effort:** L.

---

### P2-7 · `Window.tsx` size
**Scope:** `src/components/desktop/Window.tsx` (363 LoC).
**Evidence:** Approaches the 800-line ceiling but is highly cohesive
(focus trap, resize logic, animation, traffic lights). No urgent split.
**Fix:** Optional — extract `useResizeWindow`, `useWindowFocusTrap` into
hooks once we add tests.
**Effort:** M.

---

### P2-8 · `MenuBar.tsx` size + clock interval
**Scope:** `src/components/desktop/MenuBar.tsx` (571 LoC). Clock ticks
every 30 seconds; mobile vs desktop branching happens 6 places.
**Fix:** After P0-3 lands, split into `MenuBarRoot`, `MenuBarMenus`,
`MenuBarClock`.
**Effort:** M.

---

### P2-9 · `WhoopDashboardApp.tsx` (980 LoC)
**Scope:** Largest app file. Has a 345-line `LiveDashboard` and an
in-file `StaticDashboard` fallback (lines 32-980).
**Fix:** Split into `WhoopDashboardApp/index.tsx`, `LiveDashboard.tsx`,
`StaticDashboard.tsx`, and consolidate hardcoded styling once shared
primitives (P1-2) exist.
**Effort:** M.

---

### P2-10 · Documentation alignment
**Scope:** `README.md` at repo root, `CLAUDE_AUDIT_LOG.md`,
`prompts/`, `audit/AUDIT.md`.
**Evidence:** Multiple parallel docs describe the system. After this
pass, `docs/design-system/README.md` becomes the canonical reference.
**Fix:** Add cross-links, archive superseded docs, decide whether the
top-level `README.md` should embed or link the design-system doc.
**Effort:** S.

---

## Stats

| Severity | Count | Effort distribution |
|---|---|---|
| P0 | 6 | 2 × S, 3 × M, 1 × L |
| P1 | 11 | 4 × S, 5 × M, 2 × L |
| P2 | 10 | 3 × S, 5 × M, 2 × L |
| **Total** | **27** | mostly small/medium; two L items per tier |

Sprint sequencing: see [`design-system/refactor-plan.md`](./design-system/refactor-plan.md).
