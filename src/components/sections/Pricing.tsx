"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, Check } from "lucide-react";
import { chatbotNotes, chatbotPlans, inr, smsNotes, smsPackages } from "@/config/site";
import TextMask from "@/components/motion/TextMask";
import { prefillContact } from "./Contact";
import { cn } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;
type Tab = "chatbot" | "sms";

export default function Pricing() {
  const [tab, setTab] = useState<Tab>("chatbot");

  return (
    <section id="pricing" data-section="Pricing" className="relative border-t border-white/[0.06] bg-ink py-28 sm:py-36">
      <div className="container-x">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <TextMask
              className="display text-[clamp(38px,5vw,68px)]"
              lines={[
                <>
                  Simple plans, clear
                </>,
                "prices.",
              ]}
            />
          </div>
          <div role="tablist" aria-label="Pricing" className="flex w-full rounded-full border border-white/10 bg-white/[0.03] p-1 sm:w-auto">
            {(
              [
                ["chatbot", "WhatsApp chatbot"],
                ["sms", "Direct SMS"],
              ] as const
            ).map(([k, label]) => (
              <button
                key={k}
                role="tab"
                aria-selected={tab === k}
                onClick={() => setTab(k)}
                className={cn(
                  "flex-1 rounded-full px-5 py-2.5 text-[14px] font-medium transition-colors sm:flex-none",
                  tab === k ? "bg-brand text-ink" : "text-fg/70 hover:text-fg",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {tab === "chatbot" ? (
          <motion.div key="chatbot" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}>
            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {chatbotPlans.map((p) => (
                <div
                  key={p.name}
                  className={cn(
                    "relative flex flex-col rounded-[24px] border p-7",
                    p.popular ? "border-brand/70 bg-brand/[0.06]" : "border-white/10 bg-white/[0.025]",
                  )}
                >
                  <span className={cn("font-mono text-[11px] uppercase tracking-[0.18em]", p.popular ? "text-brand" : "text-dim")}>{p.tier}</span>
                  <h3 className="mt-3 text-[19px] font-semibold leading-snug tracking-tight text-fg">{p.name}</h3>
                  <p className="mt-1.5 text-[14px] text-muted">{p.blurb}</p>
                  <div className="mt-6 flex items-baseline gap-1.5">
                    <span className="text-[42px] font-semibold tracking-tight text-fg">{inr(p.price)}</span>
                    <span className="text-[14px] text-muted">/ month</span>
                  </div>
                  <span className="text-[12.5px] text-dim">+ 18% GST</span>
                  <ul className="mt-6 flex-1 space-y-3 text-[14.5px] text-fg/85">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5">
                        <Check className={cn("mt-0.5 h-4 w-4 shrink-0", p.popular ? "text-brand" : "text-wa")} /> {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => prefillContact("WhatsApp Automation")}
                    className={cn(
                      "mt-8 flex items-center justify-center gap-2 rounded-full py-3 text-[14.5px] font-semibold transition-all hover:brightness-110",
                      p.popular ? "bg-brand text-ink" : "border border-white/15 text-fg hover:border-white/30",
                    )}
                  >
                    Book a free demo <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <Notes items={chatbotNotes} />
          </motion.div>
        ) : (
          <motion.div key="sms" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}>
            {/* Desktop table */}
            <div className="mt-12 hidden overflow-hidden rounded-[24px] border border-white/10 md:block">
              <table className="w-full text-left text-[15px]">
                <thead className="bg-white/[0.04] font-mono text-[11.5px] uppercase tracking-[0.14em] text-dim">
                  <tr>
                    <th className="px-6 py-4 font-medium">Package</th>
                    <th className="px-6 py-4 text-right font-medium">SMS</th>
                    <th className="px-6 py-4 text-right font-medium">Rate / SMS</th>
                    <th className="px-6 py-4 text-right font-medium">Amount</th>
                    <th className="px-6 py-4 text-right font-medium">GST (18%)</th>
                    <th className="px-6 py-4 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {smsPackages.map((p, i) => (
                    <tr key={p.qty} className="border-t border-white/[0.07] tabular-nums">
                      <td className="px-6 py-5 text-fg/80">Package {i + 1}</td>
                      <td className="px-6 py-5 text-right font-medium text-fg">{p.qty.toLocaleString("en-IN")}</td>
                      <td className="px-6 py-5 text-right text-fg/80">₹{p.rate.toFixed(2)}</td>
                      <td className="px-6 py-5 text-right text-fg/80">{inr(p.basic)}</td>
                      <td className="px-6 py-5 text-right text-fg/60">{inr(p.gst)}</td>
                      <td className="px-6 py-5 text-right font-semibold text-brand">{inr(p.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Phone cards */}
            <div className="mt-10 grid grid-cols-2 gap-3 md:hidden">
              {smsPackages.map((p) => (
                <div key={p.qty} className="rounded-2xl border border-white/10 bg-white/[0.025] p-4 tabular-nums">
                  <div className="text-[22px] font-semibold tracking-tight text-fg">{p.qty.toLocaleString("en-IN")}</div>
                  <div className="text-[12.5px] text-muted">SMS · ₹{p.rate.toFixed(2)} each</div>
                  <div className="mt-3 text-[18px] font-semibold text-brand">{inr(p.total)}</div>
                  <div className="text-[11.5px] text-dim">
                    {inr(p.basic)} + {inr(p.gst)} GST
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
              <Notes items={smsNotes} inline />
              <button
                onClick={() => prefillContact("Direct SMS")}
                className="flex shrink-0 items-center gap-2 rounded-full bg-brand px-6 py-3 text-[14.5px] font-semibold text-ink transition-all hover:brightness-110"
              >
                Get SMS for your business <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}

        <p className="mt-10 text-[14px] text-muted">
          Websites, mobile apps, CRM integrations and custom workflows are quoted after a free demo — every business is different.
        </p>
      </div>
    </section>
  );
}

function Notes({ items, inline }: { items: string[]; inline?: boolean }) {
  return (
    <ul className={cn("grid gap-2 text-[13.5px] text-muted", inline ? "" : "mt-8 sm:grid-cols-2 lg:grid-cols-3")}>
      {items.map((n) => (
        <li key={n} className="flex items-start gap-2">
          <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-brand/70" /> {n}
        </li>
      ))}
    </ul>
  );
}
