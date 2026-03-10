# Site Audit Report

Date: 2026-02-20

## Executive Summary
The codebase is a Next.js App Router site with a strong branded desktop metaphor, but the static SEO surface has high-priority quality gaps: placeholder content remains public on `/projects`, mobile nav clipping is visible, contrast/readability is poor in captured static pages, favicon configuration is inconsistent, and production build currently fails without Supabase environment variables. Information architecture is also split between desktop-app documents and route pages, especially for About/Now identity content.

## Blockers
- `next build` currently fails because `src/lib/supabase.ts` requires `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` at build time (`Error: supabaseUrl is required`).
- Site lock middleware requires auth by default. For this audit, local crawling used `SITE_LOCK_ENABLED=false` at runtime.
- Lighthouse CLI was not available in the local environment (`command -v lighthouse` returned none), so no Lighthouse score report was generated.
- Playwright CLI runtime was not installed; rendered crawl/screenshots were completed with local headless Chrome fallback.

## Phase 0 Findings (Repo Orientation)
- Framework: Next.js 15.5.12, React 19, TypeScript.
- Router: App Router (`src/app`), confirmed by route structure and `layout.tsx`.
- Deployment target: Vercel documented in `README.md` and `.vercel/` folder present.
- Scripts:
  - `npm run dev`
  - `npm run build`
  - `npm start`
  - `npm run lint`
- Node version: not pinned via `.nvmrc` or `engines` in `package.json`.
- Env vars required (from `.env.local.example` and runtime usage):
  - Site lock: `SITE_LOCK_ENABLED`, auth user/pass vars, optional bypass token.
  - Supabase: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
  - WHOOP + KV integration vars.

## Top 10 Priorities
1. Fix build reliability by guarding Supabase client initialization when env vars are missing.
2. Remove or replace public placeholder content on `/projects`.
3. Fix static route readability and contrast across light/dark/theme states.
4. Make static top nav responsive on mobile (links currently clipped).
5. Add canonical URLs and route-level OG/Twitter metadata with image assets.
6. Correct favicon asset wiring (`/favicon.ico` vs existing `favicon.svg`).
7. Include `/privacy` in sitemap and route navigation where appropriate.
8. Resolve About/Now duplication with a single canonical narrative page model.
9. Add accessible labels for contact and guestbook form fields.
10. Address lint warning in `YouTubeWinampPlayer` and reduce build warnings.

## Phase 1: Full Route and Page Inventory
See `audit/ROUTES.md` for the authoritative route table and API inventory.

### Route-Level Metadata Snapshot

| Route | Title | Primary H1 |
|---|---|---|
| `/` | `Matthew McKenzie` | `Welcome` |
| `/about` | `About - Matthew McKenzie` | `About` |
| `/work` | `Work - Matthew McKenzie` | `Work` |
| `/projects` | `Projects - Matthew McKenzie` | `Projects` |
| `/writing` | `Writing - Matthew McKenzie` | `Writing` |
| `/contact` | `Contact - Matthew McKenzie` | `Contact` |
| `/privacy` | `Privacy Policy - Matthew McKenzie` | `Privacy Policy` |
| `/gate` | `Matthew McKenzie` | `McKENZIE_OS` |
| `/nonexistent-audit-test` | `Matthew McKenzie` | `404` |

## Phase 2: Placeholder Audit
See full exhaustive list in `audit/PLACEHOLDERS.md`.

Key confirmed public placeholders:
- `/projects`: `Project One`, `Project Two`, `Project Three`, and explicit placeholder copy.
- Essays and resume placeholders exist in source and are serialized into homepage payload.
- Analytics is explicitly stubbed as placeholder/TODO.

## Phase 3: Content + IA Consolidation (Now / About / About Me)

### Current State
- `/about` exists as full route (`src/content/about.md`).
- `/now` exists only as desktop document (`src/content/now.md`) and is not a static route.
- `/about-me` does not exist as a route.
- Intro/personal narrative also appears in homepage README and resume surfaces.

### Overlap and Conflict
- Repeated personal summary appears in `about.md`, `now.md`, and `readme.md`.
- “What I am doing now” is isolated in desktop-only content, reducing discoverability and SEO.
- Users can encounter different self-description depth depending on route vs desktop app entry.

### Recommended Consolidated Structure (Recommendation only)
Use `/about` as canonical route and merge “Now” into a dated section.

Suggested `/about` IA:
1. Hero: name, one-line bio, quick links.
2. Now: current focus with explicit update date (for example `Updated: February 16, 2026`).
3. Background: concise career arc.
4. Principles or selected projects link-out.
5. Contact and social links.

What to keep:
- Core background sections from `about.md`.
- Timestamped now-status format from `now.md`.

What to cut:
- Duplicate intro text in README that repeats About content verbatim.
- Placeholder project/essay snippets in public route surfaces.

Redirect recommendations (no implementation in this pass):
- `/now` -> `/about#now`
- `/about-me` -> `/about`

## Phase 4: UX + Mobile Audit (Page-by-Page)

| Issue | Route(s) | Screenshot reference | Severity | Suggested fix |
|---|---|---|---|---|
| Static nav links clip on mobile width | `/about`, `/work`, `/projects`, `/writing`, `/contact`, `/nonexistent-audit-test` | `audit/SCREENSHOTS/mobile/about.png` | P1 | Collapse nav to menu/drawer; reduce items in top bar on small screens; ensure no horizontal clipping. |
| Low contrast static reading experience | same static routes | `audit/SCREENSHOTS/desktop/about.png` | P1 | Revisit `--desktop-bg` and text token pairing for static pages; enforce AA contrast targets; decouple static-page palette from desktop wallpaper palette. |
| Public placeholder projects reduce trust | `/projects` | `audit/SCREENSHOTS/desktop/projects.png` | P1 | Replace with real case studies or hide route until populated; remove “coming soon” copy. |
| Mobile home starts in partially clipped window state | `/` mobile | `audit/SCREENSHOTS/mobile/home.png` | P2 | Tune default mobile first-open behavior and dock overlap; ensure initial content fits fully with safe-area insets. |
| Gate page bottom strip visual artifact | `/gate` | `audit/SCREENSHOTS/mobile/gate.png` | P3 | Audit full-height container and global body/background interaction; remove unintended bottom gap. |
| Footer consumes viewport while key content remains sparse | `/work`, `/writing` | `audit/SCREENSHOTS/desktop/work.png` | P3 | Rebalance content density and spacing; avoid large empty scroll regions on short pages. |

## Phase 5: SEO + Social Audit

### What is present
- Titles and descriptions are configured globally and route-level metadata exists on key pages.
- `robots.txt` exists and allows crawling.
- `sitemap.xml` exists.

### Gaps
- No explicit canonical tags configured per route.
- OpenGraph and Twitter metadata are global and not route-specific.
- No `og:image` or `twitter:image` asset configuration.
- `/privacy` missing from sitemap.
- Favicon mismatch: layout references `/favicon.ico`, but only `public/favicon.svg` is present.
- Structured data (JSON-LD) not found.

## Phase 6: Accessibility Audit
- Form labeling relies on placeholders in desktop contact/guestbook UI rather than explicit labels (`ContactApp`, `GuestbookApp`).
- Dock icons suppress focus outline (`focus-visible:outline-none`) without a visible replacement, reducing keyboard discoverability.
- Static page contrast appears weak in captured state.
- Heading structure is mostly clean with single H1 per static route.
- No major ARIA misuse was found in sampled files; keyboard behavior of full desktop shell was not exhaustively tested due custom interaction model.

## Phase 7: Performance + Reliability Audit
- `npm run build` fails in current env due strict Supabase initialization.
- `npm run lint` reports one warning:
  - `src/components/players/YouTubeWinampPlayer.tsx:72` missing dependency in `useEffect`.
- Next warns about multiple lockfiles and inferred workspace root.
- External font loaded directly from Google in CSS (`src/app/globals.css:240-246`), which has privacy and performance implications.
- No Lighthouse run completed due missing local Lighthouse CLI.

## Screenshot Inventory
Desktop/mobile/tablet screenshots are saved per route in:
- `audit/SCREENSHOTS/desktop/`
- `audit/SCREENSHOTS/mobile/`
- `audit/SCREENSHOTS/tablet/`

Rendered DOM captures used for title/H1/link/placeholder checks are in:
- `audit/SCREENSHOTS/dom/`

## Duplication Summary
- About-related content is split across:
  - `src/content/about.md`
  - `src/content/now.md`
  - `src/content/readme.md`
  - desktop app-only surfaces defined in `src/data/fs.ts`
- Canonical route recommendation: use `/about` as single source of truth and fold “Now” into it.

