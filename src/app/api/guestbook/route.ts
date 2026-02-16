import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// ---------------------------------------------------------------------------
// GET: Return approved guestbook entries (or all if admin)
// ---------------------------------------------------------------------------
export async function GET(request: Request) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const isAdmin = cookieHeader.includes("mckenzie_auth=");

  let query = supabase
    .from("guestbook_entries")
    .select("id, name, message, created_at, approved")
    .order("created_at", { ascending: false })
    .limit(100);

  if (!isAdmin) {
    query = query.eq("approved", true);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: "Failed to load entries" }, { status: 500 });
  }

  return NextResponse.json({ entries: data, isAdmin });
}

// ---------------------------------------------------------------------------
// POST: Submit a new guestbook entry (unapproved by default)
// ---------------------------------------------------------------------------
export async function POST(request: Request) {
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

    // Rate limit: max 5 entries per hour by IP
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await supabase
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
// PATCH: Admin approve/reject an entry
// ---------------------------------------------------------------------------
export async function PATCH(request: Request) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const authValue = process.env.SITE_LOCK_COOKIE_VALUE ?? "mck_gate_2026";
  if (!cookieHeader.includes(`mckenzie_auth=${authValue}`)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, approved } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const { error } = await supabase
      .from("guestbook_entries")
      .update({ approved: !!approved })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: "Failed to update" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
