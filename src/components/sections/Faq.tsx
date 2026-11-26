"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Plus } from "lucide-react";
import { faqs } from "@/config/site";
import TextMask from "@/components/motion/TextMask";
import { openAssistant } from "@/components/providers/Providers";
import { cn } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" data-section="FAQ" className="relative border-t border-white/[0.06] bg-ink-2 py-28 sm:py-36">
      <div className="container-x grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <TextMask className="display text-[clamp(38px,5vw,68px)]" lines={["Good to know."]} />
          <p className="mt-6 max-w-[320px] text-[15.5px] leading-relaxed text-muted">
            Can&apos;t find your answer?{" "}
            <button onClick={() => openAssistant()} className="tactile text-fg">
              Ask our AI
            </button>{" "}
            — it knows our services inside out.
          </p>
        </div>
        <div className="lg:col-span-8">
          {faqs.map((f, i) => {
            const on = open === i;
            return (
              <div key={f.q} className="border-b border-white/[0.08]">
                <button
                  onClick={() => setOpen(on ? null : i)}
                  aria-expanded={on}
                  className="group flex w-full items-center justify-between gap-6 py-6 text-left"
                >
                  <span className={cn("text-[clamp(18px,2vw,22px)] font-medium tracking-tight transition-colors", on ? "text-fg" : "text-fg/75 group-hover:text-fg")}>
                    {f.q}
                  </span>
                  <span
                    className={cn(
                      "grid h-9 w-9 shrink-0 place-items-center rounded-full border transition-all duration-500",
                      on ? "rotate-45 border-brand bg-brand text-ink" : "border-white/15 text-fg group-hover:border-white/40",
                    )}
                  >
                    <Plus className="h-4 w-4" />
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {on && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.5, ease }}
                      className="overflow-hidden"
                    >
                      <p className="max-w-[640px] pb-7 text-[15.5px] leading-relaxed text-muted">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
