# Handoff

## Updated

2026-11-22, Codex.

## What's in flight

The mckm.at business card uses `GET /api/whoop/data?view=day-strain`. Local branch `codex/public-day-strain-2026-11-22` adds that view to the existing public WHOOP route. It checks the cycle and sync times on this server, then returns one number or null. The consumer hides responses from the former endpoint that have no dayStrain field. This branch is ready for review with the mckm.at redesign.

[Personal design PR 23](https://github.com/atthewm/matthewrmckenzie.com/pull/23) is open for Matthew’s review. It covers the phone springboard, reading pages, persistent Graphite appearance, first-gesture audio and contrast. Its review contains 120 local captures across 15 surfaces at 390 and 1440 pixels in light and dark.

## What's live

[Application release PR 24](https://github.com/atthewm/matthewrmckenzie.com/pull/24) supplies the public runtime, including page metadata and Cloudflare R2 backgrounds. Its merge commit is `ddb96b52b3fb`. [Shared-standard PR 22](https://github.com/atthewm/matthewrmckenzie.com/pull/22) merged at `b8680c701dd9`, installing AGENTS.md, the Claude import and the agent handoff records on main.

Both production releases returned 40 crawlable HTML pages and 40 sitemap entries. The [after CSV](crawl-2026-11-after.csv) records 83 targets. The 70 measured internal responses were direct HTTP 200s. Robots excluded one internal target. The [before CSV](crawl-2026-11-before.csv) preserves the original baseline. Six retired page URLs and all 34 old video URLs returned the expected permanent redirects. Verification matched all 68 R2 objects against their original bytes, MIME types and cache headers. The live privacy scan covered 21 referenced JavaScript files and zero referenced PDFs and found no mobile-number matches.

After the standard merged, mobile Lighthouse measured LCP of 0.98 seconds on home, 0.96 on About, 0.95 on Work and 0.97 on Recipes. CLS was zero on all four. TBT ranged from 6.5 to 10.5 milliseconds. The 16 phone and desktop production views passed.

## Next step

Open `~/screenshots/codex-1/index.html` and select the personal design review. PR 23 has the before-and-after checks and public route evidence. Record Matthew’s decision in DECISIONS.md when he gives it.

## Waiting on Matthew

The design awaits gallery approval. Preserve the 11 testimonials, the $800M+ raise figure and the Southern Methodist University and Villanova University alumniOf entries while reviewing the Work pages.

## Don't touch

Preserve [PR 15](https://github.com/atthewm/matthewrmckenzie.com/pull/15), the testimonials, the financial figure, alumniOf, the personal mobile number, Claude's original notes and send flags. Keep private Life and Nutrition behind owner authentication. Respect LinkedIn's crawl exclusion. The publisher serves WHOOP's full privacy policy but its firewall returns 403 to an automated request.
