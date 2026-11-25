#!/bin/sh
# Run the commands from .github/workflows/verify.yml in job order.
set -eu

npm ci
npm run verify
npm test
# The deployment build moves local source videos aside. Restore the caller's
# video directory on success, failure, or interruption.
if [ -d public/backgrounds/video ] && [ ! -e build/source-background-videos ]; then
  trap 'VERCEL_BACKGROUND_BUILD=0 node scripts/stage-background-videos.mjs' EXIT
  trap 'exit 1' HUP INT TERM
fi
VERCEL_BACKGROUND_BUILD=1 NEXT_PUBLIC_BACKGROUNDS_BASE_URL=https://media.matthewrmckenzie.com/backgrounds npm run build
test ! -e public/backgrounds/video
node --input-type=module <<'NODE'
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const { redirects } = JSON.parse(readFileSync(".next/routes-manifest.json", "utf8"));
const video = redirects.find(({ source }) => source === "/backgrounds/video/:path*");
assert.equal(video?.statusCode, 308);
assert.equal(video.destination, "https://media.matthewrmckenzie.com/backgrounds/video/:path*");
NODE
