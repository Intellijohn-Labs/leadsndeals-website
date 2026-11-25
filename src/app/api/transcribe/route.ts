export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Voice input for Malayalam (and phones without built-in speech recognition):
 * the browser records a short clip and Gemini turns it into text. Auto-detects
 * Malayalam / English / Manglish. Roughly a paisa per clip.
 */
const MODEL = "gemini-3.1-flash-lite";
const MAX_BYTES = 1_500_000; // ~60 s of compressed speech
const ALLOWED = ["audio/webm", "audio/mp4", "audio/ogg", "audio/mpeg", "audio/aac", "audio/wav", "audio/x-m4a"];

const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > 20; // 20 clips per visitor per 10 minutes
}

export async function POST(req: Request) {
  const key = process.env.GEMINI_API_KEY?.replace(/^﻿/, "").trim();
  if (!key) return Response.json({ error: "not_configured" }, { status: 503 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (limited(ip)) return Response.json({ error: "rate_limited" }, { status: 429 });

  const type = (req.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
  if (!ALLOWED.includes(type)) return Response.json({ error: "bad_type" }, { status: 415 });
  const buf = Buffer.from(await req.arrayBuffer());
  if (!buf.length || buf.length > MAX_BYTES) return Response.json({ error: "bad_size" }, { status: 413 });

  const lang = new URL(req.url).searchParams.get("lang") === "ml" ? "Malayalam" : "English";
  const prompt =
    `Transcribe this voice message exactly as spoken. The speaker is most likely using ${lang}, ` +
    "but may mix Malayalam and English (Manglish). Write Malayalam words in Malayalam script and English words in English. " +
    "Return ONLY the transcript text, with no quotes, labels or explanations. If nothing intelligible is said, return an empty string.";

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: type === "audio/x-m4a" ? "audio/mp4" : type, data: buf.toString("base64") } }] }],
        generationConfig: { temperature: 0, maxOutputTokens: 600 },
      }),
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) {
      console.error("[transcribe] gemini", res.status, (await res.text()).slice(0, 300));
      return Response.json({ error: "upstream" }, { status: 502 });
    }
    const json = await res.json();
    const text: string = (json?.candidates?.[0]?.content?.parts ?? [])
      .map((p: { text?: string }) => p.text ?? "")
      .join("")
      .trim()
      .replace(/^["'“”]+|["'“”]+$/g, "");
    return Response.json({ text });
  } catch (err) {
    console.error("[transcribe] failed", err);
    return Response.json({ error: "failed" }, { status: 502 });
  }
}
