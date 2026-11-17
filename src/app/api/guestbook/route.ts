import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { isAdminRequest } from "@/lib/gate";
import { NO_STORE } from "@/lib/owner";

// ============================================================================
// /api/guestbook
// ============================================================================
// Row level security on guestbook_entries lets the anon key insert an entry
// and read approved ones, nothing more. So:
//   GET              approved entries, anon key, for everyone
//   POST             a new, unapproved entry, anon key
//   GET ?view=admin  every entry, pending ones included   } service role key,
//   PATCH            approve or unapprove an entry        } after the admin check
// For anyone who is not the admin the service role key does one thing: count
// the address's entries from the last hour for the POST rate limit (the anon
// key cannot see pending rows, so its count was always zero). That count
// returns a number, never a row. Without the key configured, moderation
// answers 503 instead of quietly doing nothing.
// ============================================================================

export const dynamic = "force-dynamic";

/** The public list changes only when an entry is approved, so the CDN may hold it. */
const PUBLIC_CACHE = { "Cache-Control": "public, s-maxage=300" } as const;

const MODERATION_OFF = "Moderation is not configured";

// ---------------------------------------------------------------------------
// GET: approved guestbook entries, for everyone.
// GET ?view=admin: every entry, pending ones included, for the admin only.
//
// The two views have different URLs on purpose. The public one ignores cookies
// entirely, so a cached copy can never hold a pending entry; the admin one is
// never cached and checks the admin cookie value, not just its presence.
// ---------------------------------------------------------------------------
export async function GET(request: Request) {
  const adminView = new URL(request.url).searchParams.get("view") === "admin";
  if (adminView && !isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: NO_STORE });
  }

  const client = adminView ? getSupabaseAdmin() : supabase;
  if (!client) {
    const error = adminView ? MODERATION_OFF : "Service unavailable";
    return NextResponse.json({ error }, { status: 503, headers: NO_STORE });
  }

  let query = client
    .from("guestbook_entries")
    .select("id, name, message, created_at, approved")
    .order("created_at", { ascending: false })
    .limit(100);

  if (!adminView) {
    query = query.eq("approved", true);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: "Failed to load entries" }, { status: 500, headers: NO_STORE });
  }

  return NextResponse.json(
    { entries: data, isAdmin: adminView },
    { headers: adminView ? NO_STORE : PUBLIC_CACHE }
  );
}

// ---------------------------------------------------------------------------
// POST: Submit a new guestbook entry (unapproved by default)
// ---------------------------------------------------------------------------
export async function POST(request: Request) {
  if (!supabase) {
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { name, message, website } = body;

    // Honeypot check
    if (website) {
      return NextResponse.json({ success: true }); // silent reject
    }

    if (!name || !message || typeof name !== "string" || typeof message !== "string") {
      return NextResponse.json({ error: "Name and message are required" }, { status: 400 });
    }

    if (name.length > 100 || message.length > 500) {
      return NextResponse.json({ error: "Name or message too long" }, { status: 400 });
    }

    // Rate limit: max 5 entries per hour by IP. Counted with the service role
    // key when it is set, because the anon key cannot see pending entries.
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const counter = getSupabaseAdmin() ?? supabase;
    const { count } = await counter
      .from("guestbook_entries")
      .select("id", { count: "exact", head: true })
      .eq("ip_address", ip)
      .gte("created_at", oneHourAgo);

    if (count !== null && count >= 5) {
      return NextResponse.json({ error: "Too many submissions. Try again later." }, { status: 429 });
    }

    const { error } = await supabase.from("guestbook_entries").insert({
      name: name.trim(),
      message: message.trim(),
      ip_address: ip,
      approved: false,
    });

    if (error) {
      return NextResponse.json({ error: "Failed to submit" }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}

// ---------------------------------------------------------------------------
// PATCH: Admin approve/unapprove an entry, { id, approved }
// ---------------------------------------------------------------------------
function validModeration(body: unknown): { id: string | number; approved: boolean } | null {
  const { id, approved } = (body ?? {}) as { id?: unknown; approved?: unknown };
  const idOk =
    (typeof id === "string" && id.length > 0 && id.length <= 64) ||
    (typeof id === "number" && Number.isSafeInteger(id) && id > 0);
  return idOk && typeof approved === "boolean" ? { id: id as string | number, approved } : null;
}

export async function PATCH(request: Request) {
  // Fails closed: with no admin cookie value configured, nobody may moderate.
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: NO_STORE });
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ error: MODERATION_OFF }, { status: 503, headers: NO_STORE });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400, headers: NO_STORE });
  }
  const change = validModeration(body);
  if (!change) {
    return NextResponse.json({ error: "Bad request" }, { status: 400, headers: NO_STORE });
  }

  const { data, error } = await admin
    .from("guestbook_entries")
    .update({ approved: change.approved })
    .eq("id", change.id)
    .select("id");

  if (error) {
    console.error("Guestbook moderation failed:", error.message);
    return NextResponse.json({ error: "Failed to update" }, { status: 500, headers: NO_STORE });
  }
  if (!data || data.length === 0) {
    return NextResponse.json({ error: "Entry not found" }, { status: 404, headers: NO_STORE });
  }

  return NextResponse.json({ success: true }, { headers: NO_STORE });
}
