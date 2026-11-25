export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Ira's voice: streams Gemini TTS audio as raw 16-bit PCM (mono, 24 kHz) so the
 * browser can start speaking ~1 s after a sentence is ready.
 * Voice "Kore" on gemini-3.8-flash-lite-tts was the closest match to Ira's
 * greeting video (rated 9/10 against it) and the fastest model.
 */
const MODEL = "gemini-3.8-flash-lite-tts";
const VOICE = "Kore";
const SAMPLE_RATE = 24000; // route files may only export handlers/config
// No style prompt: this TTS model reads instructions aloud, and plain "Kore" already
// matched Ira's greeting voice best (9/10 vs 6/10 with a bracketed style tag).

const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > 120; // sentences, not messages
}

export async function POST(req: Request) {
  // Spoken replies are switched off (cost). Set IRA_TTS_ENABLED=1 to bring them back.
  if (process.env.IRA_TTS_ENABLED !== "1") return Response.json({ error: "disabled" }, { status: 410 });
  const key = process.env.GEMINI_API_KEY;
  if (!key) return Response.json({ error: "not_configured" }, { status: 503 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (limited(ip)) return Response.json({ error: "rate_limited" }, { status: 429 });

  const body = (await req.json().catch(() => null)) as { text?: unknown } | null;
  const text = typeof body?.text === "string" ? body.text.trim().slice(0, 600) : "";
  if (!text) return Response.json({ error: "bad_request" }, { status: 400 });

  const upstream = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:streamGenerateContent?alt=sse`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        contents: [{ parts: [{ text }] }],
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE } } },
        },
      }),
      signal: req.signal,
    },
  );
  if (!upstream.ok || !upstream.body) {
    console.error("[tts] upstream", upstream.status, (await upstream.text().catch(() => "")).slice(0, 300));
    return Response.json({ error: "tts_failed" }, { status: 502 });
  }

  // SSE lines → base64 PCM chunks → raw bytes to the client
  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let buf = "";
      try {
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          let nl: number;
          while ((nl = buf.indexOf("\n")) >= 0) {
            const line = buf.slice(0, nl).trim();
            buf = buf.slice(nl + 1);
            if (!line.startsWith("data:")) continue;
            try {
              const d = JSON.parse(line.slice(5));
              for (const c of d.candidates ?? []) {
                for (const p of c.content?.parts ?? []) {
                  if (p.inlineData?.data) controller.enqueue(new Uint8Array(Buffer.from(p.inlineData.data, "base64")));
                }
              }
            } catch {
              /* partial / keep-alive line */
            }
          }
        }
      } catch (err) {
        if ((err as Error)?.name !== "AbortError") console.error("[tts] stream", err);
      } finally {
        controller.close();
      }
    },
    cancel() {
      reader.cancel().catch(() => {});
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/octet-stream",
      "X-Sample-Rate": String(SAMPLE_RATE),
      "Cache-Control": "no-store",
    },
  });
}
