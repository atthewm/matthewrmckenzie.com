# Session log

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

## Part 4 design review

The [Part 4 visual review](https://github.com/atthewm/matthewrmckenzie.com/pull/23) adds a static phone springboard, persistent Graphite across pages, a tap-only boot sound, consistent app icons, and slate and gold reading pages. The build and 252 tests passed. The local crawl found 40 pages and 69 HTTP 200 responses. Axe found zero violations across the five checked routes in both color schemes. The PR records the remaining inherited metadata failures and four mobile Lighthouse comparisons. The gallery includes 120 local images. No production changes or sends occurred.

The final application handoff records the released metadata fixes and production checks completed since the original design entry.
