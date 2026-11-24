# Handoff

## Updated

2026-11-23, Codex.

## Six desktop features in review

Matthew selected Bake by Sunday, Compare Brownies, Mix CD, Saved Desks, Startup Disk Archive and Daily Minesweeper. They are implemented on the local Trash branch. The What's New window opens all six. The Kitchen desk includes three persistent timers with an optional bell. The archive shows three real revisions of the site.

The local production build passed 278 tests and its public output checks. All 40 sitemap pages loaded at 390 and 1440 pixels without browser errors or horizontal overflow. The feature gallery is in `on-my/outputs/desktop-features.html`. It shows the previous entry points and the new screens in both themes. Matthew’s visual approval is pending.

## Panther Trash review

The local branch `codex/panther-trash-discoveries` starts from main commit `5d7e555`. It adds the filled Panther Trash to the desktop, Dock and phone launcher. The three files contain an original Austin pixel drawing, an original startup chime and a kitchen note drawn from the published brownie recipes.

The public check found two recipe pages with overflowing nutrition tables, window controls under the menu bar after maximizing, and an unreliable Contact calendar. The branch fixes all four. The visual gallery and audit are in the November 23 `on-my/outputs` workspace. Review them with Matthew before publishing. This branch is independent of PR 23.

## What's in flight

The mckm.at business card uses `GET /api/whoop/data?view=day-strain`. The personal site serves that view through its existing public WHOOP route. It checks the cycle and sync times on this server, then returns one number or null. The consumer hides responses from the former endpoint that have no dayStrain field.

[Personal design PR 23](https://github.com/atthewm/matthewrmckenzie.com/pull/23) is open for Matthew’s review. It covers the phone springboard, reading pages, persistent Graphite appearance, first-gesture audio and contrast. Its review contains 120 local captures across 15 surfaces at 390 and 1440 pixels in light and dark.

## What's live

[Application release PR 24](https://github.com/atthewm/matthewrmckenzie.com/pull/24) supplies the public runtime, including page metadata and Cloudflare R2 backgrounds. Its merge commit is `ddb96b52b3fb`. [Shared-standard PR 22](https://github.com/atthewm/matthewrmckenzie.com/pull/22) merged at `b8680c701dd9`, installing AGENTS.md, the Claude import and the agent handoff records on main.

Both production releases returned 40 crawlable HTML pages and 40 sitemap entries. The [after CSV](crawl-2026-11-after.csv) records 83 targets. The 70 measured internal responses were direct HTTP 200s. Robots excluded one internal target. The [before CSV](crawl-2026-11-before.csv) preserves the original baseline. Six retired page URLs and all 34 old video URLs returned the expected permanent redirects. Verification matched all 68 R2 objects against their original bytes, MIME types and cache headers. The live privacy scan covered 21 referenced JavaScript files and zero referenced PDFs and found no mobile-number matches.

After the standard merged, mobile Lighthouse measured LCP of 0.98 seconds on home, 0.96 on About, 0.95 on Work and 0.97 on Recipes. CLS was zero on all four. TBT ranged from 6.5 to 10.5 milliseconds. The 16 phone and desktop production views passed.

## Next step

Review the six features in `on-my/outputs/desktop-features.html` and the Trash gallery in `on-my/outputs/trash-review.html`. The earlier design review is at `~/screenshots/codex-1/index.html`. PR 23 has the before-and-after checks and public route evidence. Record Matthew’s decision in DECISIONS.md when he gives it.

## Waiting on Matthew

The design awaits gallery approval. Preserve the 11 testimonials, the $800M+ raise figure and the Southern Methodist University and Villanova University alumniOf entries while reviewing the Work pages.

## Don't touch

Preserve [PR 15](https://github.com/atthewm/matthewrmckenzie.com/pull/15), the testimonials, the financial figure, alumniOf, the personal mobile number, Claude's original notes and send flags. Keep private Life and Nutrition behind owner authentication. Respect LinkedIn's crawl exclusion. The publisher serves WHOOP's full privacy policy but its firewall returns 403 to an automated request.

## Credential review, November 22, 2026

Notion and WHOOP credentials now stay behind build-time server boundaries. Provider failures retain an HTTP status, and public OAuth return URLs omit provider diagnostics. Current signing rules reject the historic short example.

The postbuild check reads every compiled public script, style, map, HTML page and static component payload. It rejects the configured Supabase anonymous key and private service credentials. The historical public environment variable names are read only in server modules.
