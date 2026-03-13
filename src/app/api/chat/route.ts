import { NextRequest, NextResponse } from "next/server";

// ---------------------------------------------------------------------------
// iChat API — Rate-limited Claude-powered chatbot
//
// Rate limiting: 10 requests per IP per minute (in-memory, resets on deploy).
// Uses Anthropic Claude API with a system prompt about Matthew.
// Set ANTHROPIC_API_KEY in your Vercel env vars to enable.
// ---------------------------------------------------------------------------

const RATE_LIMIT_WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 10;
const MAX_TOKENS = 300;

// In-memory rate limiter (resets on cold start — fine for a personal site)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now >= entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  entry.count++;
  return true;
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap) {
    if (now >= entry.resetAt) rateLimitMap.delete(ip);
  }
}, 60_000);

const SYSTEM_PROMPT = `You are the McKenzie OS Assistant, an AI chatbot on Matthew McKenzie's personal website (matthewrmckenzie.com). The site is a Mac OS X Panther-style desktop environment built with Next.js, TypeScript, and Tailwind CSS.

About Matthew:
- Builder, thinker, maker
- Creates thoughtful digital experiences
- Values curiosity, craftsmanship, and attention to detail
- The site features apps like Music, Photos, Videos, Terminal, Settings, Guestbook, Photo Booth, and this chat

About the site:
- Retro Mac OS X 10.3 Panther aesthetic with Aqua UI
- Working dock, menu bar, draggable windows, keyboard shortcuts
- Screensavers (Flying Toasters from After Dark, Flurry from Mac OS X)
- Ambient video backgrounds with 17+ themes
- Built as a creative portfolio and personal space

Be friendly, concise, and helpful. Keep responses under 2-3 sentences unless more detail is needed. You can be playful and reference the retro Mac aesthetic. If asked something you don't know about Matthew, say so honestly. Never make up personal details.`;

export async function POST(request: NextRequest) {
  // Check for API key
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { reply: "Chat is currently offline. The site owner needs to configure the API key." },
      { status: 200 }
    );
  }

  // Rate limiting
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Rate limited" },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const messages = body.messages;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Invalid messages" }, { status: 400 });
    }

    // Sanitize and limit messages
    const sanitized = messages.slice(-10).map((m: { role: string; content: string }) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: String(m.content).slice(0, 500),
    }));

    // Call Anthropic API
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: MAX_TOKENS,
        system: SYSTEM_PROMPT,
        messages: sanitized,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Anthropic API error:", response.status, errText);
      return NextResponse.json(
        { reply: "I'm having trouble thinking right now. Try again in a moment!" },
        { status: 200 }
      );
    }

    const data = await response.json();
    const reply = data.content?.[0]?.text || "I'm not sure what to say to that.";

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("Chat API error:", err);
    return NextResponse.json(
      { reply: "Something went wrong on my end. Try again?" },
      { status: 200 }
    );
  }
}
