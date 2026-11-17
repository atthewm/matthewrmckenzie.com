#!/usr/bin/env node
// ============================================================================
// backgrounds-to-r2.mjs: move the desktop background media to Cloudflare R2
// ============================================================================
// public/backgrounds holds the ambient videos and posters (about 164 MB, most
// of it MP4 files encoded far above what an 8 second loop needs). This script
// builds a smaller upload set, puts it in an R2 bucket and checks the public
// URLs. src/config/themes.ts reads NEXT_PUBLIC_BACKGROUNDS_BASE_URL and falls
// back to public/backgrounds while that variable is unset.
//
//   node scripts/backgrounds-to-r2.mjs plan      list the files and object keys (no network, no writes)
//   node scripts/backgrounds-to-r2.mjs convert   build the upload set in .r2-backgrounds/ (needs ffmpeg)
//   node scripts/backgrounds-to-r2.mjs check     HEAD every object key in the bucket (read only)
//   node scripts/backgrounds-to-r2.mjs upload    PUT every file that is not in the bucket yet
//   node scripts/backgrounds-to-r2.mjs verify    GET every public URL: 200 and the right content type
//
// Options: --out <dir> (default .r2-backgrounds), --source <dir> (default public/backgrounds)
//
// Each theme ships one WebM (VP9, kept as is) and one MP4 fallback (H.264,
// re-encoded when the source runs above 3.2 Mbps), plus its two posters.
//
// The upload never overwrites: an object that already exists is skipped, and
// the PUT itself carries If-None-Match: * as a second guard. Nothing is ever
// deleted and no bucket setting is touched.
//
// Environment (process env, or .env.local next to package.json):
//   R2_S3_ENDPOINT                    https://<account id>.r2.cloudflarestorage.com
//   R2_ACCESS_KEY_ID                  R2 API token with Object Read and Write on the bucket
//   R2_SECRET_ACCESS_KEY
//   R2_BUCKET                         a bucket with public access for this site's media
//   R2_BACKGROUNDS_PREFIX             optional, default "backgrounds"
//   NEXT_PUBLIC_BACKGROUNDS_BASE_URL  public URL of that prefix, used by verify and by the site
// ============================================================================

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { sha256Hex, signRequest } from "./lib/sigv4.mjs";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CACHE_CONTROL = "public, max-age=31536000, immutable";
/** Source MP4 files above this size (8 seconds at about 3.2 Mbps) are re-encoded. */
const REENCODE_ABOVE_BYTES = 3_200_000;

const CONTENT_TYPES = { ".webm": "video/webm", ".mp4": "video/mp4", ".jpg": "image/jpeg" };

function die(message) {
  console.error(message);
  process.exit(2);
}

function mb(bytes) {
  return `${(bytes / 1_000_000).toFixed(1)} MB`;
}

function loadEnv() {
  try {
    process.loadEnvFile(path.join(REPO_ROOT, ".env.local"));
  } catch {
    // No .env.local: the process environment is all there is.
  }
}

/** The four files every theme needs, found from the WebM files on disk. */
function listFiles(sourceDir) {
  const videoDir = path.join(sourceDir, "video");
  if (!fs.existsSync(videoDir)) die(`No video folder in ${sourceDir}. Pass --source <dir>.`);
  const slugs = fs
    .readdirSync(videoDir)
    .filter((f) => f.endsWith(".webm"))
    .map((f) => f.replace(/\.webm$/, ""))
    .sort();
  if (slugs.length === 0) die(`No .webm files in ${videoDir}.`);

  const files = slugs.flatMap((slug) => [
    `video/${slug}.webm`,
    `video/${slug}.mp4`,
    `img/${slug}-poster.jpg`,
    `img/${slug}-mobile.jpg`,
  ]);
  const missing = files.filter((rel) => !fs.existsSync(path.join(sourceDir, rel)));
  if (missing.length) die(`Missing source files:\n  ${missing.join("\n  ")}`);
  return files;
}

function contentType(rel) {
  return CONTENT_TYPES[path.extname(rel)] ?? die(`No content type for ${rel}`);
}

// ---------------------------------------------------------------------------
// convert
// ---------------------------------------------------------------------------

function reencodeMp4(input, output) {
  execFileSync(
    "ffmpeg",
    [
      "-y", "-v", "error",
      "-i", input,
      "-map", "0:v:0", "-map", "0:a:0?",
      "-c:v", "libx264", "-preset", "slow", "-crf", "27",
      "-maxrate", "2500k", "-bufsize", "5000k",
      "-pix_fmt", "yuv420p", "-profile:v", "high",
      "-movflags", "+faststart",
      "-c:a", "aac", "-b:a", "96k",
      output,
    ],
    { stdio: ["ignore", "inherit", "inherit"] }
  );
}

function convert(files, sourceDir, outDir) {
  let before = 0;
  let after = 0;
  for (const rel of files) {
    const input = path.join(sourceDir, rel);
    const output = path.join(outDir, rel);
    fs.mkdirSync(path.dirname(output), { recursive: true });
    const size = fs.statSync(input).size;
    before += size;
    if (rel.endsWith(".mp4") && size > REENCODE_ABOVE_BYTES) {
      reencodeMp4(input, output);
      console.log(`re-encoded  ${rel}  ${mb(size)} -> ${mb(fs.statSync(output).size)}`);
    } else {
      fs.copyFileSync(input, output);
      console.log(`copied      ${rel}  ${mb(size)}`);
    }
    after += fs.statSync(output).size;
  }
  console.log(`\n${files.length} files in ${outDir}: ${mb(before)} -> ${mb(after)}`);
}

// ---------------------------------------------------------------------------
// R2 (S3 API)
// ---------------------------------------------------------------------------

function r2Config() {
  const need = ["R2_S3_ENDPOINT", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET"];
  const missing = need.filter((name) => !process.env[name]);
  if (missing.length) die(`Missing environment variables: ${missing.join(", ")}`);
  return {
    endpoint: process.env.R2_S3_ENDPOINT.replace(/\/+$/, ""),
    bucket: process.env.R2_BUCKET,
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    prefix: (process.env.R2_BACKGROUNDS_PREFIX ?? "backgrounds").replace(/^\/+|\/+$/g, ""),
  };
}

function objectUrl(cfg, rel) {
  return `${cfg.endpoint}/${cfg.bucket}/${cfg.prefix}/${rel}`;
}

async function r2Request(cfg, method, rel, { body, headers = {} } = {}) {
  const url = objectUrl(cfg, rel);
  const signed = signRequest({
    method,
    url,
    headers,
    payloadHash: sha256Hex(body ?? ""),
    accessKeyId: cfg.accessKeyId,
    secretAccessKey: cfg.secretAccessKey,
  });
  return fetch(url, { method, headers: signed.headers, body });
}

async function check(files, cfg) {
  let present = 0;
  let failed = 0;
  for (const rel of files) {
    const res = await r2Request(cfg, "HEAD", rel);
    if (res.status === 200) present++;
    else if (res.status !== 404) failed++;
    const label = res.status === 200 ? "exists " : res.status === 404 ? "missing" : `HTTP ${res.status}`;
    console.log(`${label}  ${cfg.prefix}/${rel}`);
  }
  console.log(`\n${present} of ${files.length} objects exist under ${cfg.prefix}/.`);
  if (failed) {
    console.log(`RESULT: FAIL. ${failed} requests were refused (403 means the keys or the bucket name are wrong).`);
    process.exit(1);
  }
  console.log("RESULT: ok. The credentials can read the bucket.");
}

async function upload(files, cfg, outDir) {
  const absent = files.filter((rel) => !fs.existsSync(path.join(outDir, rel)));
  if (absent.length) die(`Run "convert" first. Not in ${outDir}:\n  ${absent.join("\n  ")}`);

  let uploaded = 0;
  let skipped = 0;
  const problems = [];
  for (const rel of files) {
    const head = await r2Request(cfg, "HEAD", rel);
    if (head.status === 200) {
      skipped++;
      console.log(`kept      ${cfg.prefix}/${rel} (already in the bucket, not overwritten)`);
      continue;
    }
    if (head.status !== 404) {
      problems.push(`${rel}: HEAD answered ${head.status}`);
      continue;
    }
    const body = fs.readFileSync(path.join(outDir, rel));
    const put = await r2Request(cfg, "PUT", rel, {
      body,
      headers: { "content-type": contentType(rel), "cache-control": CACHE_CONTROL, "if-none-match": "*" },
    });
    if (put.status === 412) {
      skipped++;
      console.log(`kept      ${cfg.prefix}/${rel} (appeared meanwhile, not overwritten)`);
    } else if (put.ok) {
      uploaded++;
      console.log(`uploaded  ${cfg.prefix}/${rel}  ${mb(body.length)}`);
    } else {
      problems.push(`${rel}: PUT answered ${put.status} ${(await put.text()).slice(0, 200)}`);
    }
  }
  console.log(`\nUploaded ${uploaded}, kept ${skipped}, failed ${problems.length}.`);
  if (problems.length) {
    console.log(`RESULT: FAIL\n  ${problems.join("\n  ")}`);
    process.exit(1);
  }
  console.log("RESULT: ok");
}

// ---------------------------------------------------------------------------
// verify
// ---------------------------------------------------------------------------

async function verify(files) {
  const base = (process.env.NEXT_PUBLIC_BACKGROUNDS_BASE_URL ?? "").trim().replace(/\/+$/, "");
  if (!/^https:\/\//.test(base)) die("Set NEXT_PUBLIC_BACKGROUNDS_BASE_URL to the public https URL of the backgrounds folder.");

  const problems = [];
  for (const rel of files) {
    const url = `${base}/${rel}`;
    const expected = contentType(rel);
    try {
      // HEAD, so the check needs exactly 200 (a ranged GET would answer 206)
      // without downloading every video.
      const res = await fetch(url, { method: "HEAD" });
      const type = (res.headers.get("content-type") ?? "").split(";")[0].trim();
      const ok = res.status === 200 && type === expected;
      console.log(`${ok ? "ok  " : "FAIL"}  ${res.status}  ${type || "(no content type)"}  ${url}`);
      if (!ok) problems.push(`${url}: status ${res.status}, content type "${type}", expected ${expected}`);
    } catch (err) {
      problems.push(`${url}: ${err.message}`);
      console.log(`FAIL  no response  ${url}`);
    }
  }
  if (problems.length) {
    console.log(`\nRESULT: FAIL. ${problems.length} of ${files.length} URLs.\n  ${problems.join("\n  ")}`);
    process.exit(1);
  }
  console.log(`\nRESULT: ok. All ${files.length} URLs answer with the right content type.`);
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------

const { values, positionals } = parseArgs({
  options: { out: { type: "string" }, source: { type: "string" } },
  allowPositionals: true,
});
const command = positionals[0];
const sourceDir = path.resolve(REPO_ROOT, values.source ?? "public/backgrounds");
const outDir = path.resolve(REPO_ROOT, values.out ?? ".r2-backgrounds");

loadEnv();
const files = listFiles(sourceDir);

switch (command) {
  case "plan": {
    const prefix = (process.env.R2_BACKGROUNDS_PREFIX ?? "backgrounds").replace(/^\/+|\/+$/g, "");
    const total = files.reduce((sum, rel) => sum + fs.statSync(path.join(sourceDir, rel)).size, 0);
    for (const rel of files) console.log(`${prefix}/${rel}  ${contentType(rel)}`);
    console.log(`\n${files.length} files, ${mb(total)} in ${sourceDir} before conversion.`);
    break;
  }
  case "convert":
    convert(files, sourceDir, outDir);
    break;
  case "check":
    await check(files, r2Config());
    break;
  case "upload":
    await upload(files, r2Config(), outDir);
    break;
  case "verify":
    await verify(files);
    break;
  default:
    die("Usage: node scripts/backgrounds-to-r2.mjs <plan|convert|check|upload|verify> [--out <dir>] [--source <dir>]");
}
