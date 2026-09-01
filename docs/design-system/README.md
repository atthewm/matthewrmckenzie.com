# McKenzie OS — Design System

> Audit performed against the live codebase on 2026-05-08 (branch `audit/phase-0-5`).
> Source of truth: `src/app/globals.css`, `tailwind.config.ts`, `src/config/themes.ts`,
> `src/components/{ui,desktop,apps,settings,players}/`, and the `useSettingsStore`
> + `useDesktopStore` hooks.

McKenzie OS is a Mac OS X 10.3 "Panther" Aqua reproduction implemented in
Next.js 15 (App Router) + React 19 + Tailwind 3.4. It has two surface areas
that share tokens but rarely share components:

1. **Static marketing pages** (`/about`, `/work`, `/writing`, `/projects`,
   `/contact`, `/privacy`, `/`) wrapped in `StaticPageLayout`.
2. **The desktop simulator** (`DesktopShell` → `Desktop` → `WindowManager` →
   30+ app windows) rendered from the homepage and reachable from any FS item.

This README documents tokens, primitives, ryOS chrome, and per-app layout
conventions, with accessibility notes and usage examples grounded in the
current code. Companion docs:

- [`refactor-plan.md`](./refactor-plan.md) — sprint-sequenced cleanup
- [`../tech-debt.md`](../tech-debt.md) — P0/P1/P2 backlog
- [`../component-graph.mmd`](../component-graph.mmd) — Mermaid dependency graph

---

## 1. Assumptions used in this audit

These were inferred from code (not asked) and should be confirmed before any
breaking refactor lands:

1. **Panther aesthetic is the design intent.** Aqua traffic lights, gloss
   gradients, Lucida Grande default body font are deliberate, not legacy
   styling waiting to be modernised.
2. **`src/config/panther-theme.ts` is reference material**, not a runtime
   dependency. No imports were found across `src/` so it is treated as
   documentation.
3. **The site never runs in pure SSR** for the desktop. Every `desktop/`,
   `apps/`, `players/`, `settings/` component is `'use client'`. Static
   pages outside the simulator are kept Server Components.
4. **Tailwind is the styling baseline.** CSS-in-JS, raw `<style>` tags, and
   inline `style={...}` blocks are exceptions to fold back into Tailwind +
   CSS variables wherever possible.
5. **WCAG 2.2 AA is the bar.** Where the simulator deliberately reproduces
   1980s/2000s UI metaphors (e.g., 12px traffic lights), AA-equivalent
   alternatives exist (mobile 16px buttons, focus-visible rings, skip link).

---

## 2. Tokens

### 2.1 Color tokens — defined in `src/app/globals.css:9-47`

Tokens live as CSS custom properties and are exposed to Tailwind through
`tailwind.config.ts:30-43` (`bg-desktop-*`, `text-desktop-*`, `border-desktop-*`,
`bg-menubar-*`).

| Token | Light (`:root`) | Dark (`.dark`) | Tailwind class |
|---|---|---|---|
| `--desktop-bg` | `#4A7DC7` | `#1E2530` | `bg-desktop-bg` |
| `--desktop-surface` | `#FFFFFF` | `#2E2E32` | `bg-desktop-surface` |
| `--desktop-surface-raised` | `rgba(0,0,0,0.02)` | `rgba(255,255,255,0.03)` | (CSS var only) |
| `--desktop-border` | `#D2D2D7` | `#48484A` | `border-desktop-border` |
| `--desktop-text` | `#1A1A1A` | `#F0F0F0` | `text-desktop-text` |
| `--desktop-text-secondary` | `#4A4A50` | `#98989D` | `text-desktop-text-secondary` |
| `--desktop-accent` | `#2F6AE5` | `#5BA3FF` | `text-desktop-accent` / `bg-desktop-accent` |
| `--desktop-dock` | `rgba(255,255,255,0.25)` | `rgba(40,40,44,0.35)` | `bg-desktop-dock` |
| `--menubar-bg` | `rgba(241,241,241,0.92)` | `rgba(40,40,44,0.92)` | `bg-menubar-bg` |
| `--menubar-border` | `#B0B0B0` | `#444448` | `border-menubar-border` |
| `--window-title-focused` | gradient stack | gradient stack | inline only |
| `--window-title-unfocused` | gradient stack | gradient stack | inline only |
| `--window-title-text` | `rgba(0,0,0,0.85)` | `rgba(255,255,255,0.85)` | inline only |
| `--window-title-text-inactive` | `rgba(0,0,0,0.45)` | `rgba(255,255,255,0.5)` | inline only |

A `.high-contrast` modifier (`globals.css:248-256`) tightens
`--desktop-text` / `--desktop-text-secondary` independently of dark mode.

**Coverage of canonical tokens:** good. `bg-desktop-*` / `text-desktop-*`
appears 326 times across the tree.

**Drift to clean up** (regress to neutral Tailwind palette instead of tokens):

| File:line | Issue | Recommended replacement |
|---|---|---|
| `src/components/desktop/Window.tsx:316` (approx) | `hover:bg-black/5 active:bg-black/10` on traffic lights | `hover:bg-desktop-text/5` or token-aware mix |
| `src/components/desktop/Spotlight.tsx:108-160` | `hover:bg-black/5` on result rows | `hover:bg-desktop-text/5` |
| `src/components/desktop/Desktop.tsx:237` | Skip-link uses `focus:bg-white focus:text-black` | `focus:bg-desktop-surface focus:text-desktop-text` |
| `src/components/players/YouTubeWinampPlayer.tsx` | `text-gray-{300,400,500}`, `bg-gray-{600,700}`, `hover:text-white` | Map to `text-desktop-text-secondary`, `bg-desktop-surface`, etc. |
| `src/components/players/SoundCloudPlayer.tsx` | `text-gray-{400,500}` | Same |
| `src/components/settings/SettingsApp.tsx` | `bg-white` / `text-white` on toggle handles | Token-aware toggle component (see [refactor-plan §Sprint 2](./refactor-plan.md)) |
| `src/app/gate/page.tsx` (entire file) | 11 raw hex codes inside inline `style={{...}}` | Extract to Tailwind classes + tokens |
| `src/app/opengraph-image.tsx` | 6 raw hex codes in OG image generator | Acceptable trade-off for static OG; document |

### 2.2 Typography

| Token | Source |
|---|---|
| Sans stack | `Inter, SF Pro Display, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif` (`tailwind.config.ts:13-21`) |
| Mono stack | `JetBrains Mono, SF Mono, Fira Code, monospace` (`tailwind.config.ts:22-27`) |
| Body default | `"Lucida Grande", "Lucida Sans Unicode", "Helvetica Neue", Helvetica, Arial, sans-serif` (`globals.css:61-63`) |
| Inter loader | `next/font/google` exposed as `--font-inter` (`globals.css:271-275` comment) |
| User overrides | `--user-font-family`, `--user-font-size` (default 13px), `--user-line-height` (default 1.5) — applied in `SettingsProvider.tsx` |

Body deliberately renders Lucida Grande to honor the Panther aesthetic.
`Inter` is opt-in for static pages and the OG image only.

**Issue:** No type scale token (`--text-xs`, `--text-base`, etc.). Static
pages and apps reach for arbitrary sizes (`text-[10px]`, `text-xs`,
`text-sm`, inline `fontSize: "28px"` etc.). Consolidation tracked in
tech-debt P1.

### 2.3 Spacing, radius, shadow

There is no centralised spacing scale beyond Tailwind defaults. Notable
ad-hoc values that should become tokens:

- Title bar height: 22 px desktop / 32 px mobile (`Window.tsx`).
- Resize handle: 6 px (`Window.tsx` constant `RESIZE_HANDLE_SIZE`).
- Focused window shadow: `0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.10)`.
- Dock magnification scales: 1.4 / 1.18 / 1.06 (`Dock.tsx`).
- Sticky default size: 220 × 180 (`FloatingStickies.tsx`).

### 2.4 Z-index

Currently a free-for-all (16 files, 12 distinct values, no scale). Verified
inventory:

| Layer | Values seen | Files |
|---|---|---|
| Base | `0`, `1`, `10` | `MobileView.tsx`, `Window.tsx:282`, `ZenBackground.tsx:175` |
| Floating stickies | starts at `100` (mutable module global, `nextZ`) | `FloatingStickies.tsx:38` |
| Dock | `9999` | `Dock.tsx:229` |
| Whoop modal | `9999` | `WhoopDashboardApp.tsx:277` |
| Menu bar | `10000` | `MenuBar.tsx:481` |
| Menu dropdown | `10001` | `MenuBar.tsx:66` |
| Sub-menu | `10002` | `MenuBar.tsx:149` |
| Context menu | `99990` | `ContextMenu.tsx:62` |
| Exposé | `99990` | `Expose.tsx:115` |
| Spotlight | `99995` | `Spotlight.tsx:106` |
| Screensaver | `99998` | `Screensaver.tsx:264` |
| Boot/skip link | `99999` | `DesktopShell.tsx:61`, `Desktop.tsx:237,302` |
| Shutdown | `999999` | `DesktopShell.tsx:158` |

The risk is real: stickies (`100+`) currently sit **below** the dock
(`9999`) yet visually overlap. See tech-debt P0.

### 2.5 Animation tokens

Defined in `tailwind.config.ts:47-86`. All durations use string literals:

| Class | Duration | Easing |
|---|---|---|
| `animate-window-open` | 0.2s | ease-out |
| `animate-window-close` | 0.15s | ease-in (forwards) |
| `animate-window-minimize` | 0.35s | cubic-bezier(0.4, 0, 0.2, 1) |
| `animate-window-restore` | 0.3s | cubic-bezier(0, 0, 0.2, 1) |
| `animate-fade-in` | 0.2s | ease-out |
| `animate-slide-up` | 0.25s | ease-out |
| `animate-dock-bounce` | 0.3s | ease-out |
| `animate-winamp-marquee` | 8s | linear infinite (`globals.css:240-242`) |

**Reduced motion:** `globals.css:281-289` clamps every animation /
transition to `0.01ms` under `prefers-reduced-motion: reduce`. This is the
right safety net but Dock magnification, Exposé hover, screensaver canvas,
and FloatingStickies drag bypass CSS transitions and should add manual
guards.

---

## 3. Component catalog

For each component: file, props, variants/states, accessibility, hardcoded
values worth flagging, and the typical usage example. Server vs Client is
called out only when it differs from the section default.

### 3.1 UI primitives — `src/components/ui/*` (Server by default)

#### `AffiliationRow`
- File: `src/components/ui/AffiliationRow.tsx`
- Props: none (data hardcoded inside the file)
- States: `hover` swaps `text-desktop-text-secondary` → `text-desktop-text` via `transition-colors`
- A11y: native `<a target="_blank" rel="noopener noreferrer">`. Link text is the partner's full name; no aria-label needed.
- Hardcoded: `text-[10px]` font size; `mt-10`, `pt-6`, `mb-3`, `gap-6` spacing.
- Used in: `src/app/about/page.tsx:5` (only consumer at audit time)

```tsx
import AffiliationRow from "@/components/ui/AffiliationRow";

export default function AboutPage() {
  return (
    <article>
      {/* page content */}
      <AffiliationRow />
    </article>
  );
}
```

#### `CalEmbed`
- File: `src/components/ui/CalEmbed.tsx` (`'use client'`)
- Props: none
- Variants: responsive min heights `min-h-[520px] sm:min-h-[560px] lg:min-h-[640px]`.
- A11y: thin wrapper around the Cal.com embed; passes through Cal's accessibility but provides no extra aria/labels.
- Lifecycle: `useRef` guard prevents double script load; cleanup on unmount.
- Used in: `src/app/contact/page.tsx:5`.

#### `CtaBlock`
- File: `src/components/ui/CtaBlock.tsx` (`'use client'`)
- Props: none (copy and links hardcoded)
- Variants: primary (`bg-desktop-accent text-white`) + secondary (`border border-desktop-border ... hover:bg-desktop-border/30`).
- States: `hover:opacity-90` (primary), `hover:bg-desktop-border/30` (secondary), `focus-visible:ring-2 focus-visible:ring-desktop-accent focus-visible:ring-offset-2` on both.
- A11y: native `<Link>` + `<a>`; both buttons receive focus rings. Analytics fires before navigation so it never blocks.
- Used in: `StaticPageLayout` (renders on every static page), `src/app/contact/page.tsx`.

```tsx
import CtaBlock from "@/components/ui/CtaBlock";
<CtaBlock />
```

#### `EmptyContent`
- File: `src/components/ui/EmptyContent.tsx`
- Props: `{ heading?: string; helper?: string; homeHref?: string; homeLabel?: string }`
- Defaults: heading `"Content coming soon"`, helper `"This page doesn't have any markdown..."`, link → `/`.
- A11y: semantic `<section>`/`<p>`; back-link uses `focus-visible:ring-2 ... ring-offset-1`.
- Used in: `about`, `contact`, `projects`, `work`, `writing` pages and `not-found.tsx` when MDX is missing.

```tsx
import EmptyContent from "@/components/ui/EmptyContent";

{!body ? (
  <EmptyContent heading="Nothing yet" helper="Check back soon." />
) : (
  <article>{body}</article>
)}
```

#### `JsonLd` + schema factories
- File: `src/components/ui/JsonLd.tsx`
- Default export: `<JsonLd data={...} />` renders `<script type="application/ld+json">`.
- Named factories: `personSchema`, `websiteSchema`, `profilePageSchema`, `breadcrumbSchema(items)`, `blogPostingSchema(opts)`.
- A11y / styling: none (DOM script tag).
- Used in: `app/layout.tsx` (root schemas), every static page (breadcrumb), writing pages (blogPosting + breadcrumb).

#### `StaticPageLayout`
- File: `src/components/ui/StaticPageLayout.tsx`
- Props: `{ children: React.ReactNode }`
- Layout: `<header>` + `<main id="main-content">` + `<footer>`, all token-coloured.
- A11y standout features:
  - Skip link `sr-only focus:not-sr-only` jumping to `#main-content`.
  - `aria-label="Main navigation"` on header nav, `aria-label="Footer navigation"` on footer.
  - Focus-visible rings on every interactive child (`ring-desktop-accent`).
- Hardcoded: `min-h-[60vh]`, `max-w-2xl`, `py-10`. Acceptable for now; track if we add a wider variant.
- Used in: every static page (8 imports).

```tsx
import StaticPageLayout from "@/components/ui/StaticPageLayout";

export default function ProjectsPage() {
  return <StaticPageLayout>{/* MDX or fallback */}</StaticPageLayout>;
}
```

### 3.2 ryOS chrome — `src/components/desktop/*` (all `'use client'`)

#### `DesktopShell`
- Boot sequence (Apple logo + progress bar, durations 400 / 1200 / 400 ms),
  then renders `<SettingsProvider><DesktopProvider><Desktop /></DesktopProvider></SettingsProvider>`.
- Shutdown sequence fades to black at z-index `999999` (`DesktopShell.tsx:158`).
- Skips boot when `sessionStorage["mmck-booted"]` is set.
- Public API: `useShutdown()` consumed by `MenuBar` (Apple → Shut Down) and triggers `playShutdown()`.

#### `Desktop`
- Coordinator. Wires up keyboard shortcuts (`F9` Exposé, `Cmd/Ctrl+Space` Spotlight, Konami easter-egg, Option+triple-click), context menu, mobile detection, and the persistent skip link.
- Mobile auto-opens README on first paint; desktop hides the skip link off-screen until focused.
- Issues: stacks multiple `addEventListener("keydown", ...)` effects (`lines 134, 155`) without consolidating.

#### `DesktopProvider` / `useDesktop`
- Reducer-backed window store. Public API: `dispatch`, `state`, `openItem`, `closeWindow`, `focusWindow`, `minimizeWindow`, `restoreWindow`, `toggleMaximize`, theme resolver.
- Persistence: `localStorage["mmck-desktop-state"]`.

#### `WindowManager` / `Window` / `WindowContent`
- `WindowManager` enumerates `state.windows` and renders `<Window>` + `<WindowContent>`.
- `Window` (363 LoC):
  - Variants: focused/unfocused (gradient + shadow swap), maximized (no border-radius), mobile (`32px` title bar, `aqua-btn-mobile` 16 px traffic lights), light/dark.
  - States: `aria-modal`, `role="dialog"`, focus trap with Tab wrap, Escape-to-close, programmatic focus restore.
  - Resize: 8 directions, `MIN_WIDTH=320`, `MIN_HEIGHT=200`, handle `6px`.
- `WindowContent`: `appComponents` lookup (33 imports). The single largest fan-out node in the graph.

```tsx
// inside WindowManager
<Window windowState={w}>
  <WindowContent windowState={w} contentMap={contentMap} />
</Window>
```

#### `MenuBar`
- 571 LoC, mobile-aware menus (mobile collapses to Apple + Window list). Clock ticks every 30 s.
- A11y: missing `role="menubar"` / `role="menu"` / arrow-key navigation. (Tech-debt P0.)
- Hardcoded keyboard glyphs (`⌘`, `−`, `` (Apple)).

#### `Dock`
- Magnification: scales 1.4 / 1.18 / 1.06; transition `180ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`.
- Compact (mobile) variant: 28 × 34, no magnification, horizontal scroll, no tooltips.
- A11y gap: dock items are not Tab-reachable. (Tech-debt P0.)

#### `ContextMenu`
- Inline-styled (no Tailwind) with `rgba(255,255,255,0.95)` + 20 px backdrop blur.
- Accepts `ContextMenuItem[]` with action / separator / disabled / shortcut variants.
- A11y: closes on Esc / outside click but no `role="menu"`.

#### `Spotlight`
- 8-row max-results, `max-h-[320px]`, `w-[520px]`. Keyboard nav done correctly (Arrow / Enter / Esc). Should add `role="combobox"` + `role="listbox"`.

#### `Expose`
- F9 toggle. `calculateGrid()` respects 26 px menu bar + 60 px dock; scale capped at 0.85. Thumbnails should be `<button aria-label="Focus window: ${title}">` to expose intent to AT.

#### `DesktopIcon`
- Drag, double-click open, single-click select. Sizes `{ small: 40, medium: 48, large: 56 }` driven by settings.
- A11y gap: not focusable; Enter/Space don't open. Tracked P1.

#### `FloatingStickies`
- Module-global mutable `let nextZ = 100` (`FloatingStickies.tsx:38`). **Replace with provider state**; otherwise stickies break z-order with the dock.
- Default `220×180`. Color cycle: yellow → pink → blue → green → yellow.
- Persistence: `localStorage["mmck-stickies-v2"]`.

#### `Screensaver` + `FlurryScreensaver`
- Sprite-driven canvas at z-index `99998`. Image preloads hardcoded under `/screensaver/`.
- `FlurryScreensaver` is a CSS-canvas alternative gated by `useSettings().screensaverType`.

#### `ZenBackground`
- Layered video / image background driven by `getZenTheme(id)` from `src/config/themes.ts` (18 themes incl. Beach, Forest, Lake, Rain, Rainforest, Underwater, Arctic Aurora). Has a small mute toggle button at `z-[10]` (`ZenBackground.tsx:175`).

#### `MobileView`
- Phone-first surface that opens README full-screen with a stripped down menu.

#### `PantherIcons`, `RetroIcons`
- Inline SVG icon registries. `PantherIcons` exports `PantherIcon` and `getPantherIconPath` consumed by `Spotlight`, `StartHereApp`, and `FolderView`.

#### `SettingsProvider` / `useSettings`
- Persists to `localStorage["mmck-settings"]`, debounced 200 ms.
- Applies CSS variables `--user-font-family / --user-font-size / --user-line-height`.
- Tracks `userHasInteracted` to satisfy autoplay policy.

### 3.3 Aqua traffic-light primitives — `globals.css:131-225`

CSS-only, used inside `Window.tsx`. Variants:

| Class | Purpose | Visible state |
|---|---|---|
| `.aqua-btn` | base 12 px circle | hover lift + focus ring (`var(--desktop-accent)`) |
| `.aqua-close` | red gradient | `#FF6458 → #FF3B30` |
| `.aqua-minimize` | yellow gradient | `#FFC130 → #FFBD2E` |
| `.aqua-zoom` | green gradient | `#2ACB42 → #28C840` |
| `.aqua-buttons-unfocused .aqua-btn` | unfocused parent | flat `#D4D4D4` (`#555` dark) |
| `.aqua-btn-mobile` | mobile size + invisible 6 px touch padding | 16 × 16 base, AA-friendly hit target |

### 3.4 App interiors — `src/components/apps/*`

All apps are `'use client'`. Layout patterns observed (counts approximate):

| Pattern | App count | Examples |
|---|---|---|
| Toolbar + scrollable content + footer | 14+ | `AboutApp`, `BrowserApp:104-145`, `GalleryApp`, `GuestbookApp`, `MarkdownViewer:40-86`, `RecipeViewer:26-117`, `ProjectsApp`, `WhatsNewApp`, `ResumeApp`, `WhoopDashboardApp` |
| Sidebar + main split | 3+ | `AppleMusicFolder:15-82`, `FolderView:167-206` (sidebar 150 px), `WhoopSplitApp:98-117` |
| Form heavy | 3 | `ContactApp:69-224`, `StickiesApp:13-197`, `UrlShortenerApp:27-448` |
| Game / canvas | 4 | `ChessApp:289-487`, `MinesweeperApp:86-309`, `PhotoBoothApp:50-327`, `TerminalApp:78-418` |
| Launcher / link grid | 3 | `LinktreeApp:53-93`, `StartHereApp:14-129`, `InstagramApp:23-88` |

**Cross-cutting candidates for shared primitives** (none exist today):

- **`AppToolbar`** — title + back/forward + action buttons (`BrowserApp.tsx:151-199` is the most complete reference).
- **`AppScrollPane`** — flex column with `flex-1 overflow-auto scrollbar-thin`.
- **`AppFooter`** — bottom info strip used by `BrowserApp`, `MarkdownViewer`, `RecipeViewer`, `GalleryApp`, `ProjectsApp`.
- **`AppEmptyState`** — distinct from `EmptyContent`: an icon-grid empty state used by `StartHereApp`, `InstagramApp`, `ScheduleApp`.
- **`AppListItem`** — card row used by `GitHubApp`, `WhatsNewApp`, `GuestbookApp`, `AppleMusicFolder`.

**Hardcoded data ripe for extraction** (P1):

| File | Inline data | Move to |
|---|---|---|
| `LinktreeApp.tsx:53-93` | social/project/action link arrays | `src/data/linktree.ts` |
| `WhatsNewApp.tsx:32-133` | 8 release notes | `src/data/whatsNew.ts` or MDX |
| `GitHubApp.tsx:25-109` | repo array | `GET /api/github` (fetch live) |
| `StartHereApp.tsx:14-30` | `quickLinks` / `exploreLinks` | `src/data/startHere.ts` |
| `RecipeViewer.tsx` | static recipe metadata | already partly in `src/content/recipes/` — finish the move |

### 3.5 Players — `src/components/players/*`

- `SoundCloudPlayer.tsx`, `YouTubeWinampPlayer.tsx`. Both use legacy `text-gray-*` / `bg-gray-*` Tailwind classes — the largest token-drift offender outside `gate/page.tsx`.

### 3.6 Settings — `src/components/settings/SettingsApp.tsx`

- Single-window settings panel reading/writing `useSettings`. Toggle handles use raw `bg-white` / `text-white`. Token-aware toggle component is in the refactor plan.

---

## 4. Theme + state systems

| System | Source | Status |
|---|---|---|
| CSS variables (`--desktop-*`) | `globals.css` | **Active** — single source of color truth |
| Tailwind theme extension | `tailwind.config.ts` | **Active** — proxies the CSS vars |
| `src/config/themes.ts` | 18 Zen background themes | **Active** — consumed by `ZenBackground` and `SettingsApp` |
| `src/config/panther-theme.ts` | Hard-coded design token object | **Unused** — duplicates `globals.css`. Either delete or wire it through (P1). |
| `useSettingsStore` | Runtime user prefs (font, size, contrast, screensaver, zen theme) | **Active** |
| `useDesktopStore` | Window state, theme | **Active** |

---

## 5. Accessibility scorecard

Tested against WCAG 2.2 AA expectations.

| Surface | Keyboard | ARIA | Focus mgmt | Reduced motion | Notes |
|---|---|---|---|---|---|
| Static pages (`StaticPageLayout`) | ✅ skip link, native semantics | ✅ `aria-label`s | ✅ focus-visible rings | ✅ via global media query | Best surface in repo |
| `Window` | ✅ Tab wrap, Esc close | ✅ `role=dialog`, `aria-modal`, `aria-label` | ✅ focus restore | ✅ animations gated | Reference implementation |
| `MenuBar` | ⚠️ no arrow keys, no roving tabindex | ❌ no `role=menubar` / `menu` | ⚠️ partial | ✅ | P0 to fix |
| `Dock` | ❌ not Tab-reachable | ⚠️ `aria-label` on items but no nav semantics | ❌ | ❌ magnification ignores `prefers-reduced-motion` | P0 |
| `Spotlight` | ✅ Arrow / Enter / Esc | ⚠️ missing `role=combobox/listbox/option` | ✅ | ✅ | P1 |
| `Exposé` | ⚠️ F9/Esc only | ❌ thumbnails are unlabelled `div`s | ⚠️ | ❌ | P1 |
| `ContextMenu` | ⚠️ Esc only, no arrow | ❌ no `role=menu` | ⚠️ | ✅ | P1 |
| `DesktopIcon` | ❌ no Enter/Space | ⚠️ `aria-label` only | ❌ not focusable | ✅ | P1 |
| `FloatingStickies` | ❌ no keyboard create/edit/delete | ⚠️ `aria-label` on buttons | ❌ | ❌ | P2 |
| Apps with grids (`Chess`, `Minesweeper`, `Gallery`, `PhotoBooth`) | ❌ mouse only | ❌ `<div>` cells | ❌ | n/a | P2 — large effort |

Skip link is implemented twice: in `StaticPageLayout` (static pages) and
`Desktop.tsx:237` (simulator). Both target the right landmark.

---

## 6. Conventions

### 6.1 File / component naming

Inconsistent — chosen suffixes today:

- `*App.tsx` for windowed apps (18 files)
- `*Viewer.tsx` for read-only content viewers (`MarkdownViewer`, `RecipeViewer`)
- `*Folder.tsx` (`AppleMusicFolder`) but also `FolderView.tsx`
- No suffix for desktop chrome (`Window`, `Dock`, `MenuBar`, `Desktop`)

**Proposed convention** (P1):

| Suffix | Meaning | Example |
|---|---|---|
| `*App` | windowed app | `BrowserApp` |
| `*Viewer` | read-only content app | `MarkdownViewer`, `RecipeViewer` |
| `*Player` | media player | `SoundCloudPlayer`, `YouTubeWinampPlayer` |
| `*Provider` | React Context provider | `DesktopProvider`, `SettingsProvider` |
| `*` (no suffix) | desktop chrome / primitive | `Window`, `Dock`, `EmptyContent` |

This leaves `AppleMusicFolder` to rename to `AppleMusicFolderApp` and `FolderView` to keep its name (it's a chrome-level component, not an app).

### 6.2 Hooks

All five hooks correctly use `use*` prefix:
`useDesktopStore`, `useSettingsStore`, `useIdleTimer`, `useIsMobile`,
`useKeyboardShortcuts`. No drift.

### 6.3 Local storage keys

Single namespace `mmck-*`. Verified keys:
- `mmck-booted`
- `mmck-desktop-state`
- `mmck-settings`
- `mmck-desktop-icon-positions`
- `mmck-stickies-v2`

---

## 7. Usage cookbook

### Wrap a new static page

```tsx
// src/app/changelog/page.tsx
import { getContent } from "@/lib/content";
import StaticPageLayout from "@/components/ui/StaticPageLayout";
import JsonLd, { breadcrumbSchema } from "@/components/ui/JsonLd";
import EmptyContent from "@/components/ui/EmptyContent";

export default async function ChangelogPage() {
  const body = await getContent("changelog");

  return (
    <StaticPageLayout>
      <JsonLd data={breadcrumbSchema([
        { name: "Home", url: "/" },
        { name: "Changelog", url: "/changelog" },
      ])} />
      {body
        ? <article className="prose" dangerouslySetInnerHTML={{ __html: body }} />
        : <EmptyContent heading="Changelog coming soon" />}
    </StaticPageLayout>
  );
}
```

### Open a window from anywhere inside the simulator

```tsx
"use client";
import { useDesktop } from "@/hooks/useDesktopStore";
import { findFSItem } from "@/data/fs";

export function OpenChess() {
  const { openItem } = useDesktop();
  const chess = findFSItem("chess");
  return chess ? (
    <button onClick={() => openItem(chess)}>Play chess</button>
  ) : null;
}
```

### Add a token-aware button (until `Button` primitive lands)

```tsx
<button
  className="
    inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium
    bg-desktop-accent text-white hover:opacity-90
    focus-visible:outline-none focus-visible:ring-2
    focus-visible:ring-desktop-accent focus-visible:ring-offset-2
  "
>
  Continue
</button>
```

### Render a new app inside the OS

1. Create `src/components/apps/MyApp.tsx` (`'use client'`).
2. Add an `FSItem` entry in `src/data/fs.ts` with `appComponent: "MyApp"`.
3. Register in `WindowContent.tsx`'s `appComponents` map (line ~43).
4. Optional dock icon: add to `dockItemIds` (`src/data/fs.ts`).

### Honor reduced motion for any new animation

```tsx
const prefersReducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

useEffect(() => {
  if (prefersReducedMotion) return; // skip rAF loop entirely
  const id = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(id);
}, [prefersReducedMotion]);
```

---

## 8. What this audit did NOT cover

- Visual-regression diff between Aqua reference (Mac OS X 10.3) and the
  current renders. Tracked in tech-debt P2.
- Bundle-size breakdown per app (would need `next build --analyze`).
- Light-mode color-contrast measurements for `--desktop-text-secondary`
  on `--desktop-surface-raised` — likely close to AA but unverified.
- The `audit/` directory in repo root (older `AUDIT.md`, `PUNCH_LIST.md`,
  `ROUTES.md`, `PLACEHOLDERS.md`); these predate this pass and should be
  reconciled or archived.
