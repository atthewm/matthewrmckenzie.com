# Session log

## 2026-11-24, gate session lifetime and revocation

Replaced static gate cookies with distinct role-bound logins in the existing KV store. The new gate checks server-side expiry, supports sign-out, and retires pending WHOOP connections for the affected login. All 270 tests passed. TypeScript and lint passed with six existing warnings. The production build checked 40 indexable pages and 158 public or rendered files. A private Valkey fixture and keyboard-driven browser journeys checked sign-out and role isolation. The local branch awaits staging command checks and owner review of the four-view screenshots.

## 2026-11-24, personal site journey review

The About window now links directly to Writing. Strengthened the reading gold, gave the active shell a single main landmark and improved keyboard focus, named launcher icons and the spacing of Panther window controls. The existing profile identifies Menlo Equities as current and Civitas Capital Group as previous.

All 278 repository tests, TypeScript, lint and the production build passed. The four Chrome journeys, all four no-JavaScript and keyboard runs, and two phone WebKit journeys reached Contact. Each of 24 candidate states returned zero axe findings. November 24 visual evidence lives in the rollout workspace under `outputs/personal-site/`. Awaiting design review, separate from PR 23.

## 2026-11-23, desktop release approval

Matthew approved publishing the reviewed Trash, six desktop features and related site repairs. The release uses the existing main branch deployment. PR 23 remains a separate review.

## 2026-11-23, six desktop features

Added a two-loaf bake planner, the batch 03 and 04 brownie comparison, a five-track Mix CD, saved window layouts, a three-edition site archive and a shared daily mine puzzle. The Meeting and Kitchen desks work on desktop and phone. Kitchen timers survive a refresh and announce completion while another window is active.

The local production build passed type checking, all 278 tests, the 40-page metadata check and the compiled public output check. Chromium loaded all 40 sitemap pages at both widths with zero uncaught errors or horizontal overflow. Browser interaction checks also covered WebKit, playing the five previews, saved layouts, recipe schedules, timers, the archive and daily puzzles. The review gallery includes 390 and 1440 pixel captures in light and dark. Hold for visual review before merging.

## 2026-11-23, Panther Trash and public website check

Integrated the existing filled Panther wastebasket as a desktop shortcut, Dock item and phone launcher. Visitors can preview and save an Austin pixel drawing, a startup chime and brownie trial notes. The preview assets load when Trash opens. Verified all 40 published sitemap pages and the public app launchers. Repaired two overflowing recipe tables, maximized-window controls and the embedded Contact calendar. The local build passed verification, 268 tests and the 40-page metadata check. The design review includes 390 and 1440 pixel screenshots in both themes. Matthew’s visual review is pending.

## November 22, 2026 compiled public output

Added a server-only guard to the legacy Supabase module and enforced the absence of credentials in public build output. The anonymous-key regression fixture covers opaque and provider-formatted keys.

## November 22, 2026 credential review

The credential review adds server-only imports for Notion configuration and WHOOP storage, encryption and OAuth token handling. Storage and OAuth failures discard upstream response bodies. Regression tests use local fixtures. No provider setting or data was changed.

## 2026-11-22, Codex, public Day Strain for mckm.at

Added a score-only view to the WHOOP endpoint. It checks that the cycle is open, scored, updated on the current local day within six hours and present in a feed refreshed within 90 minutes. It leaves a five minute margin for a visible card to refresh. The personal site keeps all credentials and cycle timestamps. The score-only view also hides a cycle with a missing or invalid local UTC offset. The existing dashboard and owner views retain their contracts. Local verification covered fresh and stale synthetic cycles over HTTP and an unavailable upstream.

## 2026-11-21 22:33 UTC, Codex, production after crawl

Production serving commit `ddb96b52b3fb` completed its [after crawl](crawl-2026-11-after.csv) with 71 internal targets, 12 external targets and 40 successful internal HTML pages. The [before crawl](crawl-2026-11-before.csv) is preserved.

Previous live handoff:

Main commit `0624f46` is the November 17 production site. The dedicated media host has active TLS, 68 verified files and immutable cache headers. The Vercel production project has the media base setting for its next build. All five named projects have the approved nine-bot firewall rule. Baseline production crawl details are in [the CSV](crawl-2026-11-before.csv).

Prior next step:

Check the PR's GitHub Actions run. After an approved nonvisual merge, repeat the full production crawl, headers, robots, four mobile Lighthouse checks, privacy scan and the 34 old video redirects. Confirm the live production response and R2 destination for a saved MP4 and WebM URL. Check the resulting production commit before reporting completion.

## 2026-11-21, Codex, shared instructions after PR 24

Reconciled the repository standard from PR 22 with the release handoff, complete prior log, owner decisions and production before crawl. CLAUDE.md imports AGENTS.md and preserves its tool notes. Background docs identify the complete pre-migration Claude file by its original Git revision. The shared checker and a documentation-only diff cover this reconciliation. The release measurements and the production follow-up stay in the handoff.

## 2026-11-21, Codex, GPT-6

Installed the shared agent standard in [matthewrmckenzie.com #22](https://github.com/atthewm/matthewrmckenzie.com/pull/22). Migrated general facts to AGENTS.md, retained the Claude-only sandbox instructions and linked the prior revision and source notes. Updated the README and seeded the handoff and decision history.

Local npm ci, verify, Vitest and the production build passed. 250 tests pass. The local crawl found 40 crawlable HTML URLs with 69 responses at 200, 35 incomplete Open Graph sets, 13 long titles and 3 long descriptions. The robots and cache header checks passed. Four local mobile Lighthouse checks passed the red-metric threshold. The PR records the measurements and both route tables. The production alias points to main commit `0624f46`.

## 2026-11-21, Codex, GPT-6, personal site release

Saved the production baseline crawl in [the full CSV](crawl-2026-11-before.csv). It covers 71 internal and 16 external targets. Production had 40 public HTML pages, 35 incomplete Open Graph sets, 13 long titles and three long descriptions. The production checks found a server-rendered introduction, one home canonical and no reported private mobile number in 51 reviewed client scripts or a public PDF. All six retired paths return a direct 308. The live site uses the 510 Baylor Street office address.

The [nonvisual release](https://github.com/atthewm/matthewrmckenzie.com/pull/24) repairs the public metadata, checks it in GitHub Actions and updates four external destinations. The candidate retains all public route rendering modes. The local crawl checks 40 public HTML pages and 69 successful responses. Broken links, internal redirects, sitemap orphans, sitemap noindex entries, missing Open Graph fields and overlong metadata all count zero. The local robots parser passes all 26 cases. The build, type check, lint and 251 tests pass.

Cloudflare reported active domain ownership and SSL. All 68 R2 files passed public SHA-256, MIME and cache checks. The production Vercel project has the public media base configured for the next build. The locally built Vercel adapter output excludes all 34 videos and retains 34 posters. Each of the 34 old video URLs returned a permanent redirect to its matching object. The five Vercel projects have their approved nine-bot firewall rules. The release awaits a merge and production verification.

The independent [design PR](https://github.com/atthewm/matthewrmckenzie.com/pull/23) awaits Matthew's review. Preserve the protected [PR 15](https://github.com/atthewm/matthewrmckenzie.com/pull/15).

## 2026-11-21 23:34 UTC, Codex, final application and standard handoff

Verified the application release from PR 24 and the already merged standard from PR 22 against the canonical host. The final production crawl measured 40 public HTML pages and all 40 sitemap entries. The app and standard passed the public HTTP, robots, redirect, media, privacy and mobile checks. Updated the next action to Matthew’s review of PR 23. Prior operator instructions and release observations remain in this log.
