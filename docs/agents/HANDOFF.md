# Handoff

## Updated

2026-11-21 20:17 UTC, Codex, GPT-6.

## What's in flight

The [nonvisual personal release](https://github.com/atthewm/matthewrmckenzie.com/pull/24) fixes metadata and serves background videos from R2. The [shared standard](https://github.com/atthewm/matthewrmckenzie.com/pull/22) and [personal design](https://github.com/atthewm/matthewrmckenzie.com/pull/23) are separate reviews. Preserve the history in these three docs when integrating the branches.

The shared instructions from PR 22 import the safe repository facts and the Claude-specific tool notes. The combined handoff keeps the release checks and Matthew's decisions from PR 24.

## What's live

Main commit `0624f46` is the November 17 production site. The dedicated media host has active TLS, 68 verified files and immutable cache headers. The Vercel production project has the media base setting for its next build. All five named projects have the approved nine-bot firewall rule. Baseline production crawl details are in [the CSV](crawl-2026-11-before.csv).

## Next step

Check the PR's GitHub Actions run. After an approved nonvisual merge, repeat the full production crawl, headers, robots, four mobile Lighthouse checks, privacy scan and the 34 old video redirects. Confirm the live production response and R2 destination for a saved MP4 and WebM URL. Check the resulting production commit before reporting completion.

Save the completed production after crawl as docs/agents/crawl-2026-11-after.csv. Keep the original before CSV for comparison.

## Waiting on Matthew

Review the personal design gallery, the three testimonials on Work, the $800M+ raise figure and the Southern Methodist University and Villanova University alumniOf entries.

## Don't touch

Preserve [PR 15](https://github.com/atthewm/matthewrmckenzie.com/pull/15), the testimonials, the financial figure, alumniOf, the personal mobile number, Claude's original notes and send flags. Keep private Life and Nutrition behind owner authentication. Respect LinkedIn's crawl exclusion. The publisher serves WHOOP's full privacy policy but its firewall returns 403 to an automated request.
