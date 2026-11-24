# Handoff

## November 24, 2026, gate session remediation

Branch `codex/personal-session-security-only-20261124` applies the gate fix to main at `1354cf5`. The design candidate at `a051c51` contains the same session implementation. The gate now signs and registers each login separately for 30 days. Authenticated readers check the live KV grant and its signed deadline. Signing out at `/gate` retires that login, clears its browser cookies, and refreshes other open desktop tabs. Pending WHOOP connections are tied to the initiating owner session and can complete once.

The local candidate passed 270 tests, TypeScript, lint and the production build. Lint reported the same six existing warnings. A loopback production-build run used Valkey 9.2 for real session creation, absolute expiry, independent logins, revocation and the OAuth continuation. The remediation packet under `~/audits/my-project/remediation/personal/` has the review and four-view screenshots. Before release, check the existing KV binding’s command permissions and immediate revocation from deployed staging regions, and verify a normal owner sign-in. Existing pre-v3 sessions will require a new login. The optional guest account is currently disabled in production.

## Updated

2026-11-23, Codex.

## Approved desktop release

Matthew selected Bake by Sunday, Compare Brownies, Mix CD, Saved Desks, Startup Disk Archive and Daily Minesweeper. Matthew approved publishing them together with the filled Trash and the site repairs. The What's New window opens all six. The Kitchen desk includes three persistent timers with an optional bell. The archive shows three real revisions of the site.

The local production build passed 278 tests and its public output checks. All 40 sitemap pages loaded at 390 and 1440 pixels without browser errors or horizontal overflow. The feature gallery is in `on-my/outputs/desktop-features.html`. It shows the previous entry points and the new screens in both themes. Matthew approved the release after receiving the gallery.

## Panther Trash

The local branch `codex/panther-trash-discoveries` starts from main commit `5d7e555`. It adds the filled Panther Trash to the desktop, Dock and phone launcher. The three files contain an original Austin pixel drawing, an original startup chime and a kitchen note drawn from the published brownie recipes.

The public check found two recipe pages with overflowing nutrition tables, window controls under the menu bar after maximizing, and an unreliable Contact calendar. The branch fixes all four. The visual gallery and audit are in the November 23 `on-my/outputs` workspace. This branch is independent of PR 23.

## What's in flight

The mckm.at business card uses `GET /api/whoop/data?view=day-strain`. The personal site serves that view through its existing public WHOOP route. It checks the cycle and sync times on this server, then returns one number or null. The consumer hides responses from the former endpoint that have no dayStrain field.

[Personal design PR 23](https://github.com/atthewm/matthewrmckenzie.com/pull/23) is open for Matthew’s review. It covers the phone springboard, reading pages, persistent Graphite appearance, first-gesture audio and contrast. Its review contains 120 local captures across 15 surfaces at 390 and 1440 pixels in light and dark.

## What's live

[Application release PR 24](https://github.com/atthewm/matthewrmckenzie.com/pull/24) supplies the public runtime, including page metadata and Cloudflare R2 backgrounds. Its merge commit is `ddb96b52b3fb`. [Shared-standard PR 22](https://github.com/atthewm/matthewrmckenzie.com/pull/22) merged at `b8680c701dd9`, installing AGENTS.md, the Claude import and the agent handoff records on main.

Both production releases returned 40 crawlable HTML pages and 40 sitemap entries. The [after CSV](crawl-2026-11-after.csv) records 83 targets. The 70 measured internal responses were direct HTTP 200s. Robots excluded one internal target. The [before CSV](crawl-2026-11-before.csv) preserves the original baseline. Six retired page URLs and all 34 old video URLs returned the expected permanent redirects. Verification matched all 68 R2 objects against their original bytes, MIME types and cache headers. The live privacy scan covered 21 referenced JavaScript files and zero referenced PDFs and found no mobile-number matches.

After the standard merged, mobile Lighthouse measured LCP of 0.98 seconds on home, 0.96 on About, 0.95 on Work and 0.97 on Recipes. CLS was zero on all four. TBT ranged from 6.5 to 10.5 milliseconds. The 16 phone and desktop production views passed.

## Next step

The approved desktop release goes through main and the existing Vercel production deployment. The independent design review for PR 23 is at `~/screenshots/codex-1/index.html`.

## Waiting on Matthew

PR 23 still awaits its separate design approval. Preserve the 11 testimonials, the $800M+ raise figure and the Southern Methodist University and Villanova University alumniOf entries while reviewing the Work pages.

## Don't touch

Preserve [PR 15](https://github.com/atthewm/matthewrmckenzie.com/pull/15), the testimonials, the financial figure, alumniOf, the personal mobile number, Claude's original notes and send flags. Keep private Life and Nutrition behind owner authentication. Respect LinkedIn's crawl exclusion. The publisher serves WHOOP's full privacy policy but its firewall returns 403 to an automated request.

## Credential review, November 22, 2026

Notion and WHOOP credentials now stay behind build-time server boundaries. Provider failures retain an HTTP status, and public OAuth return URLs omit provider diagnostics. Current signing rules reject the historic short example.

The postbuild check reads every compiled public script, style, map, HTML page and static component payload. It rejects the configured Supabase anonymous key and private service credentials. The historical public environment variable names are read only in server modules.
