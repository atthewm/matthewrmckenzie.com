import "server-only";

// ============================================================================
// SUPABASE SERVICE ROLE CLIENT (server only)
// ============================================================================
// For server routes that must act past row level security: guestbook
// moderation (the anon key may only insert entries and read approved ones)
// and the Notion cache. Every caller checks who is asking before it uses
// this client. The "server-only" import makes the build fail if a client
// component ever imports this file, and the key has no NEXT_PUBLIC_ prefix,
// so it never reaches a browser.
// ============================================================================

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null | undefined;

/** Service role client, or null when SUPABASE_SERVICE_ROLE_KEY or the URL is unset. */
export function getSupabaseAdmin(): SupabaseClient | null {
  if (cached !== undefined) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  cached = url && key ? createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }) : null;
  return cached;
}
