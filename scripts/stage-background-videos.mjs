import { existsSync, mkdirSync, renameSync } from "node:fs";
import { dirname, resolve } from "node:path";

// Vercel packages public/ after the framework build. Keep the Git originals
// outside that directory and restore them on the next ordinary build or dev run.
const local = resolve("public/backgrounds/video");
const staged = resolve("build/source-background-videos");
const isVercelBuild = process.env.VERCEL_BACKGROUND_BUILD === "1";
const [source, destination] = isVercelBuild ? [local, staged] : [staged, local];
if (existsSync(source)) {
  if (existsSync(destination)) {
    throw new Error("Both local and staged video directories exist. Keep both and resolve the duplicate before building.");
  }
  mkdirSync(dirname(destination), { recursive: true });
  renameSync(source, destination);
}
