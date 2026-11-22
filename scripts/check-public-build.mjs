import { readFile, readdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const credentialNames = [
  "ANTHROPIC_API_KEY",
  "CRON_SECRET",
  "KV_REST_API_READ_ONLY_TOKEN",
  "KV_REST_API_TOKEN",
  "KV_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NOTION_SYNC_SECRET",
  "NOTION_TOKEN",
  "OWNER_COOKIE_SECRET",
  "REDIS_URL",
  "SITE_LOCK_ADMIN_PASSWORD",
  "SITE_LOCK_COOKIE_VALUE",
  "SITE_LOCK_GUEST_PASSWORD",
  "SUPABASE_SERVICE_ROLE_KEY",
  "WHOOP_CLIENT_SECRET",
  "WHOOP_ENCRYPTION_KEY"
];
const providerPatterns = [
  /-----BEGIN (?:[A-Z0-9]+ )*PRIVATE KEY-----[\s\\nr]+[A-Za-z0-9+/=]{25}/,
  /\b(?:sb_(?:secret|publishable)_[A-Za-z0-9_-]{15,}|sbp_[a-f0-9]{30,})\b/,
  /\b(?:sk-(?:proj-|svcacct-|ant-)?[A-Za-z0-9_-]{20,}|gh[pousr]_[A-Za-z0-9]{32,}|github_pat_[A-Za-z0-9_]{50,})\b/,
  /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/,
  /\b(?:cfat_|cfut_|cfk_|vcp_|GOCSPX-)[A-Za-z0-9_-]{18,}\b/,
  /\b(?:sk_(?:live|test)_|rk_live_|whsec_|re_|SG\.)[A-Za-z0-9_.-]{22,}\b/,
  /\bAIza[0-9A-Za-z_-]{35}\b/,
  /\b(?:postgres(?:ql)?|rediss?|mongodb(?:\+srv)?)\:\/\/[^:\s/@]+:[^@\s/"'<>$]+@/i,
];

export function containsCredential(text, configuredValues = []) {
  if (configuredValues.some((value) => value && text.includes(value))) return true;
  if (providerPatterns.some((pattern) => pattern.test(text))) return true;
  for (const match of text.matchAll(/\beyJ[\w-]+\.(eyJ[\w-]+)\.[\w-]{12,}\b/g)) {
    try {
      const claims = JSON.parse(Buffer.from(match[1], "base64url").toString("utf8"));
      if (["anon", "service_role", "supabase_admin", "postgres"].includes(claims?.role)) return true;
    } catch {
      // A dotted sample or a framework identifier may not be a JWT.
    }
  }
  return false;
}

async function outputFiles(dir, extensions) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const file = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await outputFiles(file, extensions));
    else if (entry.isFile() && extensions.test(entry.name)) files.push(file);
  }
  return files;
}

export async function checkBuild(output, configuredValues) {
  const client = await outputFiles(join(output, "static"), /\.(?:js|css|json|map)$/);
  const pages = await outputFiles(join(output, "server"), /\.(?:html|rsc)$/);
  if (client.length === 0 || pages.length === 0) throw new Error("Expected a complete Next.js production build.");
  let affected = 0;
  for (const file of [...client, ...pages]) {
    if (containsCredential(await readFile(file, "utf8"), configuredValues)) affected++;
  }
  if (affected) throw new Error(`A credential appeared in ${affected} public build file(s). Output values are hidden.`);
  return { staticFiles: client.length, renderedFiles: pages.length };
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  try {
    const values = credentialNames.map((name) => process.env[name]).filter(Boolean);
    const result = await checkBuild(".next", values);
    console.log(`Checked ${result.staticFiles} public static files and ${result.renderedFiles} rendered files.`);
  } catch (error) {
    // Only our own messages describe a finding. Filesystem errors need no output content.
    console.error(error instanceof Error ? error.message : "Failed to check public build outputs.");
    process.exitCode = 1;
  }
}
