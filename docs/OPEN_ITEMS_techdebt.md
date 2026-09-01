# Open Items: Tech Debt Reconciliation

> Read-only reconciliation of [`tech-debt.md`](./tech-debt.md) against current code on
> commit `eaf4165` ("merge: audit/phase-0-5 a11y, perf, SEO, geo improvements").
> Verified 2026-06-06. Every status below was checked against the live source, not the doc.
> Status key: DONE (fixed), PARTIAL (partly done), OPEN (still present).

## Headline

The phase-0-5 commit landed real but incremental accessibility wins (DesktopIcon and Expose
thumbnails became focusable buttons, a skip link exists, boot animation respects reduced motion).
It did not fully close a single enumerated tech-debt item. Ground truth: 0 DONE, 3 PARTIAL, 24 OPEN.

## Reconciliation table

| ID | Orig severity | Status | Evidence (current file:line) | Remaining fix and effort |
|---|---|---|---|---|
| P0-1 | P0 | OPEN | `tailwind.config.ts:11-87` has only fontFamily, colors, backdropBlur, animation, keyframes; no `zIndex` key. Ad-hoc values remain: `Dock.tsx:229` z-[9999], `MenuBar.tsx:481` z-[10000], `MenuBar.tsx:66` z-[10001], `MenuBar.tsx:149` z-[10002], `ContextMenu.tsx:62` z-[99990], `Expose.tsx:115` z-[99990], `Spotlight.tsx:106` z-[99995], `Screensaver.tsx:264` zIndex:99998, `DesktopShell.tsx:61` z-[99999], `Desktop.tsx:237,302` z-[99999], `DesktopShell.tsx:158` z-[999999], `ZenBackground.tsx:175` z-[10], `Window.tsx:282` zIndex:10 | Add the documented `zIndex` scale to `tailwind.config.ts`, replace arbitrary values. Effort M. |
| P0-2 | P0 | OPEN | `Dock.tsx:227-229` root is a plain `div`, no `role="toolbar"`, no `aria-label`. Items are `<button>` with `aria-label` only (`Dock.tsx:85,95`), no `aria-pressed`, no roving tabindex. Magnification transform at `Dock.tsx:88-90` is ungated by reduced motion. Confirmed no `role=` anywhere in file. | Add toolbar role + roving tabindex, `aria-pressed` on focused-window items, gate magnification behind reduced motion. Effort M. |
| P0-3 | P0 | OPEN | `MenuBar.tsx:479-489` root `div` has no `role="menubar"`. Triggers `MenuBar.tsx:494-503` lack `aria-haspopup`/`aria-expanded` and use only `onMouseDown`/`onMouseEnter`. `MenuDropdown` (`MenuBar.tsx:65`) has no `role="menu"`; items (`:89-111`) no `role="menuitem"`. No Arrow/Esc handler anywhere. Confirmed no `role=` in file. | Apply full WAI-ARIA menubar pattern with arrow-key and Esc navigation. Effort L. |
| P0-4 | P0 | OPEN | `gate/page.tsx:38-101` injects a CSS block via `dangerouslySetInnerHTML` with hex (#0071e3, #2196F3, #1976D2, #1565C0, etc.); inline `style` objects at `:104-141` carry #2d2d2d/#1a1a1a/#111/#fff/#777/#666/#333/#ff6b6b and fontSize 28px/13px/11px. 144 LoC, no desktop tokens reach it. | Rewrite with Tailwind desktop tokens; extract auth field/button primitives. Effort M. |
| P0-5 | P0 | OPEN | `FloatingStickies.tsx:38` `let nextZ = 100;` still module-global, used at `:64,266,280,316`. Component uses `useState` (`:240`), not a reducer/context. Only the sticky array is persisted (`:250`); `maxZ` is not, so `nextZ` resets to 100 on reload and re-focus can sit below older notes. | Move counter into context/reducer, persist `maxZ`, integrate with P0-1 scale. Effort S. |
| P0-6 | P0 | OPEN | `audit/` still at repo root and git-tracked: `audit/AUDIT.md`, `PLACEHOLDERS.md`, `PUNCH_LIST.md`, `ROUTES.md` (dated 2026-02-20). No `docs/archive/` directory exists. Stale artifacts include `audit/SCREENSHOTS/desktop/nonexistent-audit-test.png`. | Move under `docs/archive/2026-02-audit/` or delete after CI check. Effort S. |
| P1-1 | P1 | OPEN | `Window.tsx:338` hover:bg-black/5 active:bg-black/10; `Spotlight.tsx:151` hover:bg-black/5; `Desktop.tsx:237` skip link focus:bg-white focus:text-black; `YouTubeWinampPlayer.tsx:260,289` text-gray-400/bg-gray-700/text-gray-300/hover:bg-gray-600; `SoundCloudPlayer.tsx:28,29,59` text-gray-500/400; `SettingsApp.tsx:323` toggle handle bg-white. No `Toggle` primitive. | Map each to `*-desktop-*` tokens; add `Toggle` primitive. Effort M. |
| P1-2 | P1 | OPEN | No `src/components/ui/app/` directory exists. Toolbar/scroll/footer/list-item duplication persists across apps (still catalogued in `design-system/README.md:363-375`). | Add the five app-shell primitives, migrate apps. Effort L. |
| P1-3 | P1 | OPEN | Inline arrays remain: `LinktreeApp.tsx:32,38`, `WhatsNewApp.tsx:31`, `GitHubApp.tsx:25` (no `useEffect`/`fetch`; recent commit only edited the inline list), `StartHereApp.tsx:14,21`. `src/data/` holds only `fs.ts` plus `whoop/`. | Move lists to `src/data/*.ts`; convert GitHubApp to fetch; lift release notes to content. Effort M. |
| P1-4 | P1 | OPEN | `src/config/panther-theme.ts` still present with zero imports across `src/` (grep clean). Decision (delete or repurpose) not made. | Delete and document tokens in design-system README, or export typed tokens. Effort S. |
| P1-5 | P1 | PARTIAL | Expose thumbnails are now `<button>` (`Expose.tsx:136`, was role-less divs) but carry no `aria-label` (name derives from title text `:178`). Spotlight input `Spotlight.tsx:136` has no `role="combobox"`; results `:161` no `role="listbox"`; options `:167` no `role="option"`/`aria-selected`. `ContextMenu.tsx:60` still role-less `div`; items `:88` no `role="menuitem"`. | Add combobox/listbox/option roles to Spotlight, menu/menuitem to ContextMenu, explicit labels on Expose thumbnails. Effort M. |
| P1-6 | P1 | PARTIAL | Convention is codified: `design-system/README.md:434` (section 6.1) and `:453` resolve to rename `AppleMusicFolder` to `AppleMusicFolderApp` and keep `FolderView`. The rename did not happen: files are still `apps/AppleMusicFolder.tsx` and `apps/FolderView.tsx`. | Rename `AppleMusicFolder.tsx` to `AppleMusicFolderApp.tsx` and update imports. Effort S. |
| P1-7 | P1 | OPEN | `tailwind.config.ts` defines no `fontSize` or `spacing` extension (`:11-87`). Arbitrary sizes persist, e.g. `MenuBar.tsx:41` text-[11px], `gate/page.tsx:121` fontSize 28px, `Dock.tsx:28` text-[11px]. | Add `fontSize` and `spacing` tokens; add a lint or CI grep banning inline px. Effort M. |
| P1-8 | P1 | OPEN | `globals.css:281-289` clamps CSS animation/transition only. `Screensaver.tsx:208,238` and `FlurryScreensaver.tsx:459,484` run rAF ungated; `Dock.tsx:88-90` magnification ungated. No `useReducedMotion` hook (`src/hooks/` lacks it). `settings.reduceMotion` exists (`useSettingsStore.ts:25`) but is consumed only by `ZenBackground.tsx:104`. | Add a single `useReducedMotion` hook; short-circuit the rAF loops and Dock transform. Effort S. |
| P1-9 | P1 | PARTIAL | `DesktopIcon.tsx:81` is now a `<button>` with `aria-label` (`:101`), so it is focusable and in tab order. But `:96` onClick only sets selected; open is wired to `onDoubleClick` (`:95`); there is no `onKeyDown`, so Enter/Space selects but does not open. | Open on Enter/Space (add key handler or move open to onClick with drag guard). Effort S. |
| P1-10 | P1 | OPEN | `ShutdownContext` is still defined inside `DesktopShell.tsx:14`, not a separate file. Cycle intact: `DesktopShell.tsx:6,234` renders `Desktop`, `Desktop.tsx:6,246` renders `MenuBar`, `MenuBar.tsx:9` imports `useShutdown` from `./DesktopShell`. | Lift `useShutdown` into its own `ShutdownContext.tsx` adjacent to the provider. Effort S. |
| P1-11 | P1 | OPEN | `WindowContent.tsx:6-35` statically imports ~30 apps; `:42-71` builds the `appComponents` map; no `React.lazy`. Highest-coupling node unchanged. | Replace static imports with a `React.lazy` registry keyed by `appComponent`. Effort M. |
| P2-1 | P2 | OPEN | No `role="grid"`/`gridcell`/`log`/`aria-live` in `ChessApp.tsx`, `MinesweeperApp.tsx`, `TerminalApp.tsx`, `PhotoBoothApp.tsx`. Cells remain plain divs. | Add grid/gridcell roles with roving tabindex; Terminal output as `role="log"`. Effort L per app. |
| P2-2 | P2 | OPEN | Blocked by P1-11: `WindowContent.tsx:6-35` static imports ship every app on first load. | Dynamic-import apps once the registry lands. Effort S after P1-11. |
| P2-3 | P2 | OPEN | `opengraph-image.tsx:19,21,34,40,50,62` still uses raw hex (#2d2d2d, #1a1a1a, #111, #fff, #0071e3, #999, #777, #444). Blocked by P1-4. | Import typed color tokens once `panther-theme.ts` is repurposed. Effort S after P1-4. |
| P2-4 | P2 | OPEN | Nine persistence keys with no version field, no migration: `mmck-mobile-welcomed` (`Desktop.tsx:26`), `mmck-desktop-icon-positions` (`Desktop.tsx:52`), `mmck-booted` (`DesktopShell.tsx:189`), `mmck-stickies-v2` (`FloatingStickies.tsx:34`), `mmck-bg-sound` (`ZenBackground.tsx:21`), `mmck-stickies` (`StickiesApp.tsx:29`), `mmck-desktop-state` (`useDesktopStore.ts:321`), `mmck-settings` (`useSettingsStore.ts:92`), `mmck-secrets-revealed` (`useSecrets.ts:5`). No `STORAGE_VERSION` anywhere. | Add `STORAGE_VERSION` per slice plus a migration helper. Effort M. |
| P2-5 | P2 | OPEN | `audit/SCREENSHOTS.zip` is 4,750,494 bytes and git-tracked, alongside `audit/SCREENSHOTS/{desktop,dom,mobile,tablet}/*.png`. | Move to release notes or gitignore and store off-repo. Effort S. |
| P2-6 | P2 | OPEN | No `playwright.config.*`, no `e2e/` or `tests/`, no playwright dependency in `package.json`. | Spike Playwright snapshots across the documented breakpoints. Effort L. |
| P2-7 | P2 | OPEN | `Window.tsx` is 363 LoC; no `useResizeWindow`/`useWindowFocusTrap` hooks extracted. Explicitly optional/low priority; unchanged. | Optional: extract resize and focus-trap hooks once tests exist. Effort M. |
| P2-8 | P2 | OPEN | `MenuBar.tsx` is 571 LoC; `Clock` interval still 30s (`MenuBar.tsx:37`); mobile/desktop branching scattered. Blocked behind P0-3. | Split into MenuBarRoot/Menus/Clock after P0-3. Effort M. |
| P2-9 | P2 | OPEN | `WhoopDashboardApp.tsx` is 980 LoC; not split into index/LiveDashboard/StaticDashboard. | Split the file; consolidate styling once P1-2 lands. Effort M. |
| P2-10 | P2 | OPEN | Canonical `docs/design-system/README.md` and `refactor-plan.md` exist and `tech-debt.md:4-6` cross-links them, but alignment work is undone: root `README.md` has no link to `docs/design-system`, and superseded docs remain scattered at root (`CLAUDE_AUDIT_LOG.md`, `PASS-1-POLISH.md`, `PASS-2-BEAUTY.md`, `PASS-3-SEO.md`, `PASS-4-AHREFS.md`) plus the un-archived `audit/` set. | Cross-link from root README, archive superseded docs, decide README embed vs link. Effort S. |

## Counts

- DONE: 0
- PARTIAL: 3 (P1-5, P1-6, P1-9)
- OPEN: 24

## OPEN items ranked by value-to-effort

Accessibility and correctness first, then maintainability. Effort: S is 0.5 day or less, M is 1 to 2 days, L is 3 to 5 days.

1. P0-5 Stickies z-index correctness (S). Correctness bug, smallest effort. Move `nextZ` into context and persist `maxZ`.
2. P1-8 Reduced-motion gaps (S). Accessibility. One shared `useReducedMotion` hook gates Dock, Expose, Screensaver, and Stickies.
3. P1-10 Break the MenuBar to DesktopShell cycle (S). Correctness/maintainability. Lift `useShutdown` into its own file.
4. P0-2 Dock keyboard accessibility (M). Toolbar role, roving tabindex, `aria-pressed`, motion gate.
5. P0-1 Centralise z-index scale (M). Correctness (the stickies-below-dock class of bug) plus maintainability.
6. P0-3 MenuBar ARIA and keyboard navigation (L). Highest user-facing accessibility value, largest single effort.
7. P2-1 Game-grid and Terminal semantics (L per app). Accessibility, but very large; defer behind the chrome-level a11y fixes above.
8. P0-6 Archive stale `audit/` docs (S) and P2-5 remove the 4.7 MB zip (S). Repo hygiene, near-zero risk.
9. P1-4 Decide `panther-theme.ts` fate (S), which unblocks P2-3 OG hex tokens (S after).
10. P0-4 Gate page to Tailwind tokens (M), P1-7 type and spacing tokens (M), P1-1 token regressions (M). Design-system consistency.
11. P1-9 finish DesktopIcon (S, currently PARTIAL): add Enter/Space open. P1-5 finish Spotlight/ContextMenu ARIA (M, currently PARTIAL). P1-6 do the AppleMusicFolder rename (S, currently PARTIAL).
12. P1-11 WindowContent registry and lazy load (M), which unblocks P2-2 bundle splitting (S after).
13. P1-3 Extract hardcoded data (M), P1-2 shared app-shell primitives (L).
14. P2-4 Storage versioning and migration (M), P2-7/P2-8/P2-9 file-size splits (M each), P2-10 docs alignment (S), P2-6 Playwright visual regression (L).
