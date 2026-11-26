import Anthropic from "@anthropic-ai/sdk";
import { assistant, chatbotNotes, chatbotPlans, faqs, inr, services, site, smsNotes, smsPackages } from "@/config/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Prefer a project-specific key so a shell-level ANTHROPIC_API_KEY can't shadow it.
// Strip a stray BOM/whitespace (Windows shells can add one when the key is pasted into Vercel).
const apiKey = (process.env.LEADSNDEALS_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY || "").replace(/^﻿/, "").trim() || undefined;
const client = apiKey ? new Anthropic({ apiKey }) : null;

const SYSTEM = `You are ${assistant.name}, the AI assistant on the website of ${site.legalName} ("${site.name}").

About ${site.name}: ${site.description}

Services:
${services
  .map((s) => `- ${s.title}${s.status === "coming-soon" ? " (COMING SOON — calling is not live yet; offer early access)" : ""}: ${s.description}`)
  .join("\n")}

Our brands (products of ${site.legalName}): WAAU (waau.in, our flagship AI WhatsApp automation platform), DirectSMS (directsms.in, bulk and transactional SMS), CallCall.in (callcall.in, automated voice calls, coming soon) and Web & Apps (websites and mobile apps).

Pricing (INR; quote these exact numbers when asked):
WhatsApp chatbot plans (per month, + 18% GST):
${chatbotPlans.map((p) => `- ${p.tier}: ${p.name} — ${inr(p.price)}/month. ${p.features.join("; ")}.`).join("\n")}
Notes: ${chatbotNotes.join("; ")}.
Direct SMS packages (one-time packs, + 18% GST):
${smsPackages.map((p) => `- ${p.qty.toLocaleString("en-IN")} SMS at ₹${p.rate.toFixed(2)}/SMS = ${inr(p.basic)} + ${inr(p.gst)} GST = ${inr(p.total)}`).join("\n")}
Notes: ${smsNotes.join("; ")}.
Websites, mobile apps, CRM integrations, n8n workflows, e-commerce builds and custom bots are quoted after a free demo — never give a price for these.

FAQ:
${faqs.map((f) => `Q: ${f.q}\nA: ${f.a}`).join("\n")}

Sections of this web page (for "explain this section" requests):
- Hero: the headline "Turn every conversation into a deal", with an interactive 3D particle sphere representing one AI brain connected to every channel.
- Why automation: customers message at all hours; automation replies in seconds and follows up.
- Services: the services above, shown as cards.
- How it works: the 5-step pipeline — lead arrives on any channel → AI replies & qualifies → n8n workflows update CRM/Sheets and send payment links → automatic WhatsApp/SMS follow-ups → deal closed.
- Voice AI: a sample phone call with an AI voice agent booking an appointment. Voice calling is coming soon (early access).
- E-commerce: a sample WhatsApp shopping chat (catalogue → cart → UPI payment → order confirmed) plus website stores, cart recovery and order updates.
- Industries: real estate, retail & D2C, clinics, education, events & sports, food & bakeries.
- Process: Discover (free call + plan + quote) → Build → Launch & grow.
- Pricing: WhatsApp chatbot plans (₹999 / ₹2,999 / ₹4,999 per month) and Direct SMS packages, with a toggle between them.
- FAQ and Contact: the demo request form.
- Contact details (share only if asked how to reach us): phone ${site.contact.phones.join(" or ")}, email ${site.contact.email}.

How to reply:
- You are chatting in a small website widget. Keep replies short: 2–4 sentences, or a few short lines. Plain text only — no markdown headings, tables or bold.
- Be warm, clear and practical. Use simple English; if the visitor writes in another language (e.g. Malayalam, Hindi), reply in that language.
- Only describe services listed above. Never invent prices, timelines, client names, statistics or guarantees. For chatbot plans and SMS packages, give the exact prices above (always mention + 18% GST) and suggest the plan that fits; for anything else, say it's quoted after a free demo.
- When the visitor shows interest, invite them to book a free demo using the "Book a demo" button or the form at the bottom of the page${site.contact.whatsapp ? ", or to message us on WhatsApp" : ""}.
- Don't ask for or accept sensitive data (passwords, card numbers, ID numbers). Politely decline off-topic requests and steer back to how ${site.name} can help.`;

// Very small in-memory rate limit (per server instance).
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > 30;
}

type Turn = { role: "user" | "assistant"; content: string };

function validate(body: unknown): Turn[] | null {
  const msgs = (body as { messages?: unknown })?.messages;
  if (!Array.isArray(msgs) || msgs.length === 0 || msgs.length > 30) return null;
  const out: Turn[] = [];
  for (const m of msgs) {
    if (!m || (m.role !== "user" && m.role !== "assistant") || typeof m.content !== "string") return null;
    const content = m.content.trim().slice(0, 2000);
    if (!content) continue;
    const prev = out[out.length - 1];
    if (prev && prev.role === m.role) prev.content += `\n${content}`;
    else out.push({ role: m.role, content });
  }
  while (out.length && out[0].role !== "user") out.shift();
  if (!out.length || out[out.length - 1].role !== "user") return null;
  return out.slice(-20);
}

export async function POST(req: Request) {
  if (!client) {
    return Response.json({ error: "not_configured" }, { status: 503 });
  }
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (limited(ip)) {
    return Response.json({ error: "rate_limited" }, { status: 429 });
  }

  const messages = validate(await req.json().catch(() => null));
  if (!messages) return Response.json({ error: "bad_request" }, { status: 400 });

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const s = client.beta.messages.stream({
          model: "claude-opus-5-5",
          max_tokens: 2048,
          betas: ["server-side-fallback-2026-07-01"],
          fallbacks: "default",
          output_config: { effort: "low" },
          system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
          messages,
        });
        for await (const event of s) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        const final = await s.finalMessage();
        if (final.stop_reason === "refusal") {
          controller.enqueue(
            encoder.encode("Sorry, I can't help with that one. I'm happy to answer anything about our automation services!"),
          );
        }
      } catch (err) {
        console.error("[chat] Claude error", err);
        controller.enqueue(
          encoder.encode("\n\nSorry — I'm having trouble connecting right now. Please try again, or use the demo form below."),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}
