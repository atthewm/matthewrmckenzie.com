import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// ---------------------------------------------------------------------------
// POST: Submit a contact form
// ---------------------------------------------------------------------------
export async function POST(request: Request) {
  if (!supabase) {
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { category, name, email, message } = body;

    if (!category || !name || !email || !message) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    if (typeof name !== "string" || typeof email !== "string" || typeof message !== "string") {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    if (name.length > 100 || email.length > 200 || message.length > 2000) {
      return NextResponse.json({ error: "Input too long" }, { status: 400 });
    }

    const validCategories = ["Investor", "Collaboration", "Press", "Speaking", "Other"];
    if (!validCategories.includes(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    const { error } = await supabase.from("contact_submissions").insert({
      category,
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
    });

    if (error) {
      return NextResponse.json({ error: "Failed to submit" }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
