"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Check, Loader2, Mail, Phone } from "lucide-react";
import Parallax from "@/components/motion/Parallax";
import TextMask from "@/components/motion/TextMask";
import MagneticButton from "@/components/motion/MagneticButton";
import { useApp } from "@/components/providers/Providers";
import { InstagramIcon, MessengerIcon, N8nIcon, WhatsAppIcon } from "@/components/ui/BrandIcons";
import { services, site, whatsappLink } from "@/config/site";
import SlotPicker, { type Slot } from "./SlotPicker";

/** Pre-select a service in the form and scroll to it, from anywhere on the page. */
export function prefillContact(service: string) {
  window.dispatchEvent(new CustomEvent("lnd:prefill", { detail: { service } }));
}

const serviceOptions = [...services.map((s) => s.title), "Not sure yet"];

type Status = "idle" | "sending" | "sent" | "error";

export default function Contact() {
  const { scrollTo } = useApp();
  const [service, setService] = useState(serviceOptions[0]);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [slot, setSlot] = useState<Slot | null>(null);
  const [booked, setBooked] = useState("");
  const wa = whatsappLink();

  useEffect(() => {
    const on = (e: Event) => {
      const s = (e as CustomEvent<{ service: string }>).detail.service;
      if (serviceOptions.includes(s)) setService(s);
      scrollTo("#contact");
    };
    window.addEventListener("lnd:prefill", on);
    return () => window.removeEventListener("lnd:prefill", on);
  }, [scrollTo]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    if (!slot) {
      setError("Please pick a date and time for your demo");
      setStatus("error");
      return;
    }
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, service, source: "website-form", slotDate: slot.date, slotTime: slot.time, slotLabel: slot.label }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Something went wrong");
      setBooked(slot.label);
      setStatus("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    }
  }

  const input =
    "w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-[15px] text-paper-ink outline-none transition-colors placeholder:text-paper-ink/35 focus:border-paper-ink";

  return (
    <section id="contact" data-section="Contact" className="relative isolate overflow-hidden pt-28 sm:pt-40">
      {/* Layered parallax scene */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <Parallax speed={0.9} className="absolute left-1/2 top-24 h-[620px] w-[920px] -translate-x-1/2">
          <div className="h-full w-full rounded-full glow [--glow-color:rgb(242_194_27/0.12)]" />
        </Parallax>
        <Parallax speed={-0.6} className="absolute left-[8%] top-[14%] hidden md:block">
          <span className="grid h-16 w-16 place-items-center rounded-2xl border border-white/10 bg-white/[0.03] text-wa">
            <WhatsAppIcon className="h-7 w-7" />
          </span>
        </Parallax>
        <Parallax speed={-1.4} rotate={8} className="absolute right-[10%] top-[10%] hidden md:block">
          <span className="grid h-20 w-20 place-items-center rounded-3xl border border-white/10 bg-white/[0.03] text-fg">
            <InstagramIcon className="h-8 w-8" />
          </span>
        </Parallax>
        <Parallax speed={-2} rotate={-10} className="absolute left-[18%] top-[38%] hidden lg:block">
          <span className="grid h-12 w-12 place-items-center rounded-xl border border-white/10 bg-white/[0.03] text-[#4f8cff]">
            <MessengerIcon className="h-5 w-5" />
          </span>
        </Parallax>
        <Parallax speed={-1} className="absolute right-[20%] top-[36%] hidden lg:block">
          <span className="grid h-14 w-14 place-items-center rounded-2xl border border-white/10 bg-white/[0.03] text-brand">
            <N8nIcon className="h-6 w-6" />
          </span>
        </Parallax>
      </div>

      <div className="container-x text-center">
        <TextMask
          className="display mx-auto max-w-[1100px] text-[clamp(46px,8.4vw,128px)]"
          lines={[
            "Let's turn your",
            <>
              leads into deals.
            </>,
          ]}
        />
        <p className="mx-auto mt-7 max-w-[520px] text-[17px] text-muted">
          Book a free demo. We&apos;ll map where your enquiries come from and show you exactly what we&apos;d automate first.
        </p>
      </div>

      <div className="container-x mt-16 pb-28 sm:pb-36">
        <div className="paper mx-auto grid max-w-[1080px] overflow-hidden rounded-[32px] shadow-[0_60px_120px_-40px_rgba(0,0,0,0.8)] lg:grid-cols-5">
          <div className="flex flex-col justify-between gap-10 bg-paper-2 p-8 sm:p-10 lg:col-span-2">
            <div>
              <h3 className="text-[26px] font-semibold leading-tight tracking-tight">Free automation demo</h3>
              <ul className="mt-6 space-y-3 text-[15px] text-paper-muted">
                {["30-minute call, no obligation", "A plan for your channels", "A clear quote afterwards"].map((t) => (
                  <li key={t} className="flex items-start gap-2.5">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-deep" /> {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-2.5 text-[15px]">
              {wa && (
                <a href={wa} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 font-medium">
                  <WhatsAppIcon className="h-[18px] w-[18px] text-[#128c4a]" /> <span className="tactile">Chat on WhatsApp</span>
                </a>
              )}
              {site.contact.phones.map((p) => (
                <a key={p} href={`tel:${p.replace(/\s/g, "")}`} className="flex items-center gap-2.5">
                  <Phone className="h-4 w-4" /> <span className="tactile">{p}</span>
                </a>
              ))}
              {site.contact.email && (
                <a href={`mailto:${site.contact.email}`} className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4" /> <span className="tactile">{site.contact.email}</span>
                </a>
              )}
            </div>
          </div>

          <div className="p-8 sm:p-10 lg:col-span-3">
            <AnimatePresence mode="wait">
              {status === "sent" ? (
                <motion.div
                  key="ok"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex h-full min-h-[380px] flex-col items-center justify-center text-center"
                >
                  <span className="grid h-16 w-16 place-items-center rounded-full bg-brand text-ink">
                    <Check className="h-7 w-7" />
                  </span>
                  <h3 className="mt-6 text-[26px] font-semibold tracking-tight">Thanks — we&apos;ve got it.</h3>
                  <p className="mt-2 max-w-[340px] text-paper-muted">
                    Your demo is requested for <b className="text-ink">{booked}</b>. We&apos;ll confirm on WhatsApp shortly.
                  </p>
                </motion.div>
              ) : (
                <motion.form key="form" onSubmit={submit} className="grid gap-4 sm:grid-cols-2" exit={{ opacity: 0 }}>
                  <input type="text" name="company_website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
                  <label className="sm:col-span-1">
                    <span className="eyebrow mb-2 block text-paper-muted">Name *</span>
                    <input name="name" required maxLength={80} autoComplete="name" placeholder="Your name" className={input} />
                  </label>
                  <label className="sm:col-span-1">
                    <span className="eyebrow mb-2 block text-paper-muted">WhatsApp / phone *</span>
                    <input name="phone" required type="tel" maxLength={20} autoComplete="tel" placeholder="+91" className={input} />
                  </label>
                  <label className="sm:col-span-1">
                    <span className="eyebrow mb-2 block text-paper-muted">Email</span>
                    <input name="email" type="email" maxLength={120} autoComplete="email" placeholder="you@company.com" className={input} />
                  </label>
                  <label className="sm:col-span-1">
                    <span className="eyebrow mb-2 block text-paper-muted">Business</span>
                    <input name="business" maxLength={120} autoComplete="organization" placeholder="Business name" className={input} />
                  </label>
                  <label className="sm:col-span-2">
                    <span className="eyebrow mb-2 block text-paper-muted">Interested in</span>
                    <select value={service} onChange={(e) => setService(e.target.value)} className={input}>
                      {serviceOptions.map((o) => (
                        <option key={o}>{o}</option>
                      ))}
                    </select>
                  </label>
                  <div className="min-w-0 sm:col-span-2">
                    <span className="eyebrow mb-2 block text-paper-muted">Book a slot *</span>
                    <SlotPicker value={slot} onChange={setSlot} />
                  </div>
                  <label className="sm:col-span-2">
                    <span className="eyebrow mb-2 block text-paper-muted">What would you like to automate?</span>
                    <textarea name="message" rows={3} maxLength={1500} placeholder="A sentence or two is plenty" className={`${input} resize-none`} />
                  </label>
                  <div className="flex flex-col items-start gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-[12.5px] text-paper-muted">We&apos;ll only use your details to contact you about this request.</p>
                    <MagneticButton type="submit" variant="dark" pulse={false} disabled={status === "sending"}>
                      {status === "sending" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      Request demo <ArrowRight className="h-4 w-4" />
                    </MagneticButton>
                  </div>
                  {status === "error" && (
                    <p className="text-[14px] text-red-700 sm:col-span-2" role="alert">
                      {error}. {wa ? "You can also reach us on WhatsApp." : "Please try again in a moment."}
                    </p>
                  )}
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
