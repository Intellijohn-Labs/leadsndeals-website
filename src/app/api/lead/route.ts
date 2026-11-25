export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Receives demo requests and forwards them to LEAD_WEBHOOK_URL
 * (e.g. an n8n webhook that saves to your CRM / Sheet and pings WhatsApp).
 */
const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return Response.json({ error: "Invalid request" }, { status: 400 });

  // Honeypot: bots fill hidden fields. Pretend success.
  if (str(body.company_website, 200)) return Response.json({ ok: true });

  const lead = {
    name: str(body.name, 80),
    phone: str(body.phone, 20),
    email: str(body.email, 120),
    business: str(body.business, 120),
    service: str(body.service, 80),
    message: str(body.message, 1500),
    source: str(body.source, 40) || "website",
    slotDate: /^\d{4}-\d{2}-\d{2}$/.test(str(body.slotDate, 10)) ? str(body.slotDate, 10) : "",
    slotTime: /^\d{2}:\d{2}$/.test(str(body.slotTime, 5)) ? str(body.slotTime, 5) : "",
    slotLabel: str(body.slotLabel, 60),
    page: req.headers.get("referer") ?? "",
    receivedAt: new Date().toISOString(),
  };

  if (!lead.name) return Response.json({ error: "Please enter your name" }, { status: 400 });
  if (!/^\+?[\d\s-]{7,20}$/.test(lead.phone)) {
    return Response.json({ error: "Please enter a valid phone number" }, { status: 400 });
  }
  if (!lead.slotDate || !lead.slotTime) {
    return Response.json({ error: "Please pick a date and time for your demo" }, { status: 400 });
  }
  if (lead.email &&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) {
    return Response.json({ error: "Please enter a valid email" }, { status: 400 });
  }

  const hook = process.env.LEAD_WEBHOOK_URL?.replace(/^﻿/, "").trim();
  if (!hook) {
    console.error("[lead] LEAD_WEBHOOK_URL is not set — lead NOT delivered:", lead);
    return Response.json({ ok: true, delivered: false });
  }

  try {
    const res = await fetch(hook, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.LEAD_WEBHOOK_SECRET ? { "X-Webhook-Secret": process.env.LEAD_WEBHOOK_SECRET } : {}),
      },
      body: JSON.stringify(lead),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`Webhook responded ${res.status}`);
  } catch (err) {
    console.error("[lead] delivery failed", err, lead);
    return Response.json({ error: "We couldn't send your request" }, { status: 502 });
  }

  return Response.json({ ok: true, delivered: true });
}
