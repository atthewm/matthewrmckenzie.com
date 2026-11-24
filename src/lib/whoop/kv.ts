import "server-only";

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
    throw new Error(`KV request failed (${res.status})`);
  }
  const json = await res.json();
  if (!json || json.error || !("result" in json)) throw new Error("KV command failed");
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
  const path = `/set/${encodedKey}/${encodedValue}` + (ttlSeconds ? `/ex/${ttlSeconds}` : "");
  if (await kvFetch(path) !== "OK") throw new Error("KV write was not acknowledged");
}

/** Delete one or more keys. */
export async function kvDel(...keys: string[]): Promise<void> {
  const encoded = keys.map((k) => encodeURIComponent(k)).join("/");
  const count = await kvFetch(`/del/${encoded}`);
  if (typeof count !== "number" || !Number.isInteger(count) || count < 0) throw new Error("KV deletion was not acknowledged");
}

/** Atomically consume a single-use OAuth continuation. */
export async function kvTake(key: string): Promise<unknown> {
  return kvFetch(`/getdel/${encodeURIComponent(key)}`);
}

/** Read through the primary with the original absolute deadline. GETEX never creates a missing key. */
export async function kvGetUntil(key: string, expires: number): Promise<unknown> {
  return kvFetch(`/getex/${encodeURIComponent(key)}/exat/${expires}`);
}
