import { NextResponse } from "next/server";

/**
 * POST /api/gemini-token
 *
 * Returns a short-lived ephemeral token for Gemini Live API.
 * The actual GEMINI_API_KEY stays server-side — never exposed to the browser.
 *
 * The widget calls this endpoint before starting a Gemini Live session,
 * then uses the returned token to open the WebSocket directly from the browser.
 */
export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const model = body.model || "gemini-2.0-flash-live-001";

    // Exchange API key for a short-lived token via Gemini token service
    const tokenRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/ephemeralTokens?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: `models/${model}`,
          config: {
            // Token valid for 60 minutes max
            ttl: "3600s",
          },
        }),
      }
    );

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      console.error("[gemini-token] Token fetch failed:", err);
      return NextResponse.json({ error: "Failed to get Gemini token" }, { status: 502 });
    }

    const { name: token } = await tokenRes.json();
    return NextResponse.json({ token, model });
  } catch (e) {
    console.error("[gemini-token] Error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
