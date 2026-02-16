// ============================================================================
// VERCEL KV (Upstash Redis REST API)
// ============================================================================
// Direct REST calls to Upstash Redis. No SDK dependency needed.
// Uses KV_REST_API_URL and KV_REST_API_TOKEN env vars that Vercel
// auto-populates when you link a KV store to the project.
// ============================================================================

import { getEnvVar } from "./config";

function kvUrl(): string {
  return getEnvVar("KV_REST_API_URL");
}

function kvToken(): string {
  return getEnvVar("KV_REST_API_TOKEN");
}

async function kvFetch(path: string): Promise<unknown> {
  const res = await fetch(`${kvUrl()}${path}`, {
    headers: { Authorization: `Bearer ${kvToken()}` },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`KV request failed (${res.status}): ${text}`);
  }
  const json = await res.json();
  return json.result;
}

/** Get a string value by key. Returns null if not found. */
export async function kvGet(key: string): Promise<string | null> {
  const result = await kvFetch(`/get/${encodeURIComponent(key)}`);
  return result as string | null;
}

/** Set a string value with optional TTL in seconds. */
export async function kvSet(key: string, value: string, ttlSeconds?: number): Promise<void> {
  const encodedKey = encodeURIComponent(key);
  const encodedValue = encodeURIComponent(value);
  if (ttlSeconds) {
    await kvFetch(`/set/${encodedKey}/${encodedValue}/ex/${ttlSeconds}`);
  } else {
    await kvFetch(`/set/${encodedKey}/${encodedValue}`);
  }
}

/** Delete one or more keys. */
export async function kvDel(...keys: string[]): Promise<void> {
  const encoded = keys.map((k) => encodeURIComponent(k)).join("/");
  await kvFetch(`/del/${encoded}`);
}
