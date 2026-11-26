"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Check, Clock, FileText, MessageCircle, X } from "lucide-react";
import { chatbotPlans, inr, services, smsPackages, type ServiceKey } from "@/config/site";
import { serviceDetails } from "@/config/serviceDetails";
import ServiceIcon from "@/components/ui/ServiceIcon";
import { openAssistant } from "@/components/providers/Providers";
import { prefillContact } from "./Contact";

const ease = [0.16, 1, 0.3, 1] as const;

/** Popup with a fuller brief about one service: overview, what's included, how we set it up, what you need, price. */
export default function ServiceModal({ k, onClose }: { k: ServiceKey | null; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const s = k ? services.find((x) => x.key === k) : null;
  const d = k ? serviceDetails[k] : null;

  // Esc to close, focus the panel, keep the page behind from scrolling
  useEffect(() => {
    if (!k) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    setTimeout(() => panelRef.current?.focus(), 50);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [k, onClose]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  // Rendered into <body> so the pinned / transformed Services section can't clip or offset it.
  return createPortal(
    <AnimatePresence>
      {s && d && (
        <motion.div
          key="svc-modal"
          className="fixed inset-0 z-[80] flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
          data-lenis-prevent
        >
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={s.title}
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.98, transition: { duration: 0.2 } }}
            transition={{ duration: 0.45, ease }}
            className="relative flex max-h-[92svh] w-full max-w-[760px] flex-col overflow-hidden rounded-t-[28px] border border-white/10 bg-[#111113] shadow-[0_40px_120px_-20px_rgba(0,0,0,0.9)] outline-none sm:rounded-[28px]"
          >
            {/* header */}
            <div className="relative shrink-0 overflow-hidden border-b border-white/[0.07] px-6 pb-6 pt-7 sm:px-8">
              <div aria-hidden="true" className="glow absolute -right-16 -top-24 h-64 w-64 [--glow-color:rgb(242_194_27/0.16)]" />
              <button
                onClick={onClose}
                aria-label="Close"
                className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/[0.06] text-fg/80 transition-colors hover:bg-white/[0.12] hover:text-fg"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="relative flex items-center gap-4">
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-brand text-ink">
                  <ServiceIcon k={s.key} className="h-6 w-6" />
                </span>
                <div className="pr-10">
                  <h3 className="text-[26px] font-semibold leading-tight tracking-tight text-fg sm:text-[30px]">{s.title}</h3>
                  <p className="mt-1 text-[15px] text-muted">{s.short}</p>
                </div>
              </div>
              {s.status === "coming-soon" && (
                <span className="relative mt-4 inline-block rounded-full border border-brand/40 bg-brand/10 px-3 py-1 text-[12px] font-semibold text-brand">
                  Coming soon · early access open
                </span>
              )}
            </div>

            {/* body */}
            <div className="flex-1 space-y-9 overflow-y-auto px-6 py-7 sm:px-8">
              <p className="text-[16.5px] leading-relaxed text-fg/85">{d.overview}</p>

              <section>
                <h4 className="eyebrow mb-4 text-brand">What&apos;s included</h4>
                <ul className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
                  {d.includes.map((x) => (
                    <li key={x} className="flex items-start gap-2.5 text-[14.5px] text-fg/85">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-wa" /> {x}
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h4 className="eyebrow mb-4 text-brand">How we set it up</h4>
                <ol className="relative space-y-5 border-l border-white/10 pl-6">
                  {d.steps.map((st, i) => (
                    <li key={st.title} className="relative">
                      <span className="absolute -left-[37px] grid h-6 w-6 place-items-center rounded-full bg-brand text-[12px] font-bold text-ink">
                        {i + 1}
                      </span>
                      <div className="text-[15.5px] font-semibold text-fg">{st.title}</div>
                      {st.text && <p className="mt-1 text-[14.5px] leading-relaxed text-muted">{st.text}</p>}
                      {st.list && (
                        <ul className="mt-2 list-disc space-y-1 pl-5 text-[14px] text-muted">
                          {st.list.map((l) => (
                            <li key={l}>{l}</li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ol>
              </section>

              {d.needs && (
                <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
                  <h4 className="mb-3 flex items-center gap-2 text-[15px] font-semibold text-fg">
                    <FileText className="h-4 w-4 text-brand" /> What you&apos;ll need
                  </h4>
                  <ul className="grid gap-2 text-[14px] text-fg/80 sm:grid-cols-2">
                    {d.needs.map((n) => (
                      <li key={n} className="flex items-start gap-2">
                        <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-brand/80" /> {n}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {d.timeline && (
                <p className="flex items-center gap-2 text-[14px] text-muted">
                  <Clock className="h-4 w-4 text-brand" /> {d.timeline}
                </p>
              )}

              <Pricing kind={d.pricing} />
            </div>

            {/* actions */}
            <div className="flex shrink-0 flex-col gap-3 border-t border-white/[0.07] bg-[#0d0d0f] px-6 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-8">
              <button
                onClick={() => {
                  onClose();
                  openAssistant(`Tell me more about your ${s.title} service.`);
                }}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-5 py-3 text-[14.5px] font-medium text-fg transition-colors hover:border-white/30"
              >
                <MessageCircle className="h-4 w-4" /> Ask Lia about this
              </button>
              <button
                onClick={() => {
                  onClose();
                  setTimeout(() => prefillContact(s.title), 250);
                }}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 text-[14.5px] font-semibold text-ink transition-all hover:brightness-110"
              >
                {s.status === "coming-soon" ? "Join early access" : "Book a free demo"} <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

function Pricing({ kind }: { kind: "chatbot" | "sms" | "quote" | "early-access" }) {
  if (kind === "chatbot")
    return (
      <section>
        <h4 className="eyebrow mb-4 text-brand">Pricing</h4>
        <div className="grid gap-3 sm:grid-cols-3">
          {chatbotPlans.map((p) => (
            <div key={p.name} className={`rounded-2xl border p-4 ${p.popular ? "border-brand/60 bg-brand/[0.06]" : "border-white/10"}`}>
              <div className={`text-[11px] font-semibold uppercase tracking-wider ${p.popular ? "text-brand" : "text-dim"}`}>{p.tier}</div>
              <div className="mt-1 text-[22px] font-semibold text-fg">
                {inr(p.price)}
                <span className="text-[13px] font-normal text-muted"> /month</span>
              </div>
              <div className="mt-1 text-[12.5px] text-muted">{p.blurb}</div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[12.5px] text-dim">+ 18% GST. WhatsApp message charges follow Meta&apos;s rates; AI usage billed separately.</p>
      </section>
    );
  if (kind === "sms")
    return (
      <section>
        <h4 className="eyebrow mb-4 text-brand">SMS packages</h4>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {smsPackages.map((p) => (
            <div key={p.qty} className="rounded-2xl border border-white/10 p-4 tabular-nums">
              <div className="text-[18px] font-semibold text-fg">{p.qty.toLocaleString("en-IN")}</div>
              <div className="text-[12px] text-muted">₹{p.rate.toFixed(2)} per SMS</div>
              <div className="mt-2 text-[16px] font-semibold text-brand">{inr(p.total)}</div>
              <div className="text-[11px] text-dim">incl. 18% GST</div>
            </div>
          ))}
        </div>
      </section>
    );
  return (
    <p className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 text-[14.5px] text-fg/80">
      {kind === "early-access"
        ? "Voice AI is in early access. Join the list and we'll set up a pilot for your business."
        : "Every project is different, so we quote after a free demo: tell us what you need and we'll send a clear quote."}
    </p>
  );
}
