# Open Items: Punch List Reconciliation

Read-only verification of `audit/PUNCH_LIST.md` against current code at commit `eaf4165` ("merge: audit/phase-0-5 a11y, perf, SEO, geo improvements"). Every status below was checked against the live source, not the stale audit text.

Note on scope: the task brief referenced 27 items, but `audit/PUNCH_LIST.md` contains 14 priority rows. All 14 are reconciled here.

| Item | Original priority | Status | Evidence (file:line) | Remaining fix |
|---|---|---|---|---|
| Build fails without Supabase env vars | P0 | DONE | `src/lib/supabase.ts:10-13` returns `null` when env is missing; route guards `src/app/api/contact/route.ts:8-10` and `src/app/api/guestbook/route.ts:8-10, 38-40, 94-96` short-circuit to 503 when `supabase` is null. Build no longer evaluates `createClient` with empty URL. | None. |
| Static pages low contrast (text on blue) | P1 | DONE | Content sits on white surface, not blue: `src/components/ui/StaticPageLayout.tsx:38` (header), `:61` (main), `:69` (footer) all use `bg-desktop-surface`; surface is `#FFFFFF` (`globals.css:11`), text is `#1A1A1A` (`globals.css:13`), mapped in `tailwind.config.ts:32,34`. Blue `#4A7DC7` shows only on the non-text outer margin. | None. |
| Mobile top nav overflows and clips links | P1 | OPEN | `src/components/ui/StaticPageLayout.tsx:46-56` nav is `flex items-center gap-4` with brand plus 5 links, no `flex-wrap` and no responsive or hamburger treatment, inside header `:39` `flex justify-between`. At 320 to 375px the brand plus 5 links exceed the row and there is no `overflow-x` guard in `globals.css`, so the row overflows. | Add `flex-wrap` or a responsive nav (hamburger, hide brand on mobile, or a horizontal scroll container) at `StaticPageLayout.tsx:39/46`. Effort S. |
| /projects placeholder content | P1 | DONE | `src/content/projects.md:9-35` now lists real projects (Toast MCP Server, MarginEdge MCP and Teams bots, Eight Sleep pipeline and client, McKenzie OS, Cosmos Collector). No lorem or "coming soon" placeholder remains. | None. |
| Missing canonical and route-level OG/Twitter metadata | P1 | DONE | Root `src/app/layout.tsx:41-50` openGraph, `:51-57` twitter, `:58-60` canonical, OG image via `/opengraph-image` (`:49,56`) plus `src/app/opengraph-image.tsx` and `src/app/writing/[slug]/opengraph-image.tsx`. Every route also exports metadata with canonical and openGraph: `about/page.tsx:8-12`, `work/page.tsx:7-11`, `writing/page.tsx:7-11`, `contact/page.tsx:8-12`, `projects/page.tsx:7-15`, `privacy/page.tsx:5-9`, `writing/[slug]/page.tsx:69-70`. | None. |
| Favicon path mismatch | P1 | DONE | `src/app/layout.tsx:93` references `/favicon.svg`; `public/favicon.svg` exists; no `favicon.ico` is referenced anywhere in the repo; `next.config.ts:22-25` adds cache headers for `/favicon.svg`. | None. |
| /privacy missing from sitemap and nav | P1 | DONE | `src/app/sitemap.ts:81-86` includes `/privacy`; footer nav links to it at `src/components/ui/StaticPageLayout.tsx:93`; noscript crawler nav links it at `src/app/page.tsx:62`. (Top nav still omits Privacy by design; it remains discoverable via footer and sitemap.) | None. |
| Global body overflow:hidden clips long-form content | P2 | DONE | No `body { overflow: hidden }` in `globals.css` (body rule `:59-63` sets only bg, text, font). Scroll-lock is now scoped to the desktop view: `src/components/desktop/Desktop.tsx:233` `fixed inset-0 overflow-hidden`. Static and policy pages can scroll. | None. |
| Homepage mobile UX: README by default plus dock clipping | P2 | PARTIAL | Dock clipping mitigated: `src/components/desktop/Dock.tsx:233` mobile dock uses `overflow-x-auto scrollbar-none max-w-[calc(100%-8px)]`, and `src/hooks/useDesktopStore.ts:202` reserves a 72px dock allowance on mobile. BUT README still auto-opens on mobile first load: `src/components/desktop/Desktop.tsx:101-116`. A cleaner `src/components/desktop/MobileView.tsx` exists but is dead code, never imported; `src/components/desktop/DesktopShell.tsx:234` renders `<Desktop>` unconditionally. | Wire `MobileView` into `DesktopShell` for widths under 768px, or remove/guard the README auto-open effect at `Desktop.tsx:101-116` on mobile. Effort M. |
| Duplicate content model (About, Now, README, resume) | P2 | OPEN | `src/content/about.md:25-34` still embeds a "## Now" section duplicating `src/content/now.md:12-16` nearly verbatim; `src/content/readme.md:5-11` repeats the same intro framing; `src/data/fs.ts:20,27` still expose About and Now as separate content sources. | Pick one source of truth for the Now and intro blurb and reference it (drop the Now block from `about.md` or generate it from `now.md`). Low value, partly a content choice. Effort M. |
| Missing explicit form labels (placeholder-only) | P2 | PARTIAL | Accessible names now exist via `aria-label`: `src/components/apps/ContactApp.tsx:132,146,159`; `src/components/apps/GuestbookApp.tsx:212,225` plus sr-only submit `:241`. Category has a visible `<label>` (`ContactApp.tsx:109-111`) but it is not associated by `htmlFor`/`id` (no `htmlFor` or `id` anywhere in `ContactApp.tsx`). Screen-reader naming is satisfied; visible labels for name, email, message are still placeholder-only. | If visible associated labels are the goal, add `<label htmlFor>` plus matching `id` for name, email, message, and associate the Category label. Otherwise close as DONE for a11y. Effort S to M. |
| Lint warning: missing dependency in YouTube effect | P2 | DONE | `src/components/players/YouTubeWinampPlayer.tsx:56` adds `// eslint-disable-next-line react-hooks/exhaustive-deps` before the mount effect `:57` with `[]` deps `:72`. The warning no longer surfaces. Resolved by an intentional disable (effect is meant to run once on mount) rather than a dependency refactor. | None, unless you prefer refactoring deps over the disable. |
| Gate screen bottom blue strip (layout bleed) | P3 | DONE | `src/app/gate/page.tsx:103-116` wrapper paints a full-viewport dark gradient (`minHeight:100vh`, background `#2d2d2d` to `#111`, `overflow:hidden`) that covers the blue body beneath; `src/app/gate/layout.tsx` only passes children. No blue strip can appear below a 100vh dark container. | None. |
| Multi-lockfile root warning (build noise) | P3 | OPEN | No `outputFileTracingRoot` or `turbopack.root` in `next.config.ts` (or any `*.ts`). No competing lockfile was found in mounted parent dirs, so the warning may not fire in this checkout, but the deterministic silencer is absent. | Set `outputFileTracingRoot: path.join(__dirname)` (or `turbopack.root`) in `next.config.ts`, or remove any stray parent lockfile in the real environment. Cosmetic only. Effort S. |

## Summary

Counts across the 14 punch-list rows:

- DONE: 9 (Supabase guard, static page contrast, projects content, canonical and OG metadata, favicon, privacy in sitemap and nav, global overflow removed, YouTube lint, gate blue strip)
- PARTIAL: 2 (homepage mobile README auto-open, form field labels)
- OPEN: 3 (mobile top nav overflow, duplicate content model, multi-lockfile warning)

Genuinely OPEN items ranked by value-to-effort, highest first:

1. Mobile top nav overflow (P1, Effort S). Real user-facing bug on every static route at 320 to 375px; small, contained fix in `StaticPageLayout.tsx`. Best value-to-effort.
2. Multi-lockfile root warning (P3, Effort S). One-line config, but cosmetic build noise with near-zero user value, and possibly already silent in this checkout.
3. Duplicate content model (P2, Effort M). Low value, partly a content-architecture choice; safe to defer.

The two PARTIAL items both have meaningful remaining work. The homepage mobile README auto-open is the higher-value of the pair, since a full `MobileView` was already built and only needs wiring into `DesktopShell`.

## Flagged: owner decision, do not auto-change

The public bio still names a prior employer, Civitas Capital Group, and the title "Vice President of Investor Relations," across `src/app/layout.tsx:25,32,46-48,55`, `src/content/about.md:11`, and the noscript block in `src/app/page.tsx:47`. This is not one of the 14 punch-list rows. It is a personal-timing and positioning decision, so it is marked OPEN and flagged owner decision, do not auto-change.
