# Session log

## 2026-11-21, Codex, GPT-6

Installed the shared agent standard in [matthewrmckenzie.com #22](https://github.com/atthewm/matthewrmckenzie.com/pull/22). Migrated general facts to AGENTS.md, retained the Claude-only sandbox instructions and linked the prior revision and source notes. Updated the README and seeded the handoff and decision history.

Local npm ci, verify, Vitest and the production build passed. 250 tests pass. The local crawl found 40 crawlable HTML URLs with 69 responses at 200, 35 incomplete Open Graph sets, 13 long titles and 3 long descriptions. The robots and cache header checks passed. Four local mobile Lighthouse checks passed the red-metric threshold. The PR records the measurements and both route tables. The production alias points to main commit `0624f46`.

## 2026-11-21, Codex, GPT-6, personal site release

Saved the production baseline crawl in [the full CSV](crawl-2026-11-before.csv). It covers 71 internal and 16 external targets. Production had 40 public HTML pages, 35 incomplete Open Graph sets, 13 long titles and three long descriptions. The production checks found a server-rendered introduction, one home canonical and no reported private mobile number in 51 reviewed client scripts or a public PDF. All six retired paths return a direct 308. The live site uses the 510 Baylor Street office address.

The [nonvisual release](https://github.com/atthewm/matthewrmckenzie.com/pull/24) repairs the public metadata, checks it in GitHub Actions and updates four external destinations. The candidate retains all public route rendering modes. The local crawl checks 40 public HTML pages and 69 successful responses. Broken links, internal redirects, sitemap orphans, sitemap noindex entries, missing Open Graph fields and overlong metadata all count zero. The local robots parser passes all 26 cases. The build, type check, lint and 251 tests pass.

Cloudflare reported active domain ownership and SSL. All 68 R2 files passed public SHA-256, MIME and cache checks. The production Vercel project has the public media base configured for the next build. The locally built Vercel adapter output excludes all 34 videos and retains 34 posters. Each of the 34 old video URLs returned a permanent redirect to its matching object. The five Vercel projects have their approved nine-bot firewall rules. The release awaits a merge and production verification.

The independent [design PR](https://github.com/atthewm/matthewrmckenzie.com/pull/23) awaits Matthew's review. Preserve the protected [PR 15](https://github.com/atthewm/matthewrmckenzie.com/pull/15).
