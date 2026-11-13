# QA assets for "McKenzie OS, remastered" (PR 15)

Screenshots, videos and check reports for the draft PR. This branch is never merged.

- `screenshots/<size>-<theme>/<state>.png`: every route and state at desktop 1440 x 900, iPhone 390 x 844, iPhone Duo outer 382 x 618, Duo inner 669 x 902 and the Duo laptop pose 951 x 620 (two segments, CDP emulation), light and dark. Taken from the Vercel preview with `scripts/qa/capture.mjs`.
- `videos/desktop-tour.mp4` (about 62 s) and `videos/duo-laptop.mp4` (about 37 s), with the original WebM files.
- `production/`: before shots of the live site.
- `reports/`: screenshot checks, axe and Lighthouse results.
