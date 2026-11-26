"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { CakeSlice, GraduationCap, House, ShoppingBag, Stethoscope, Trophy } from "lucide-react";
import TextMask from "@/components/motion/TextMask";

const industries = [
  { icon: House, name: "Real estate", line: "Qualify enquiries from ads and book site visits automatically.", bg: "#17171a", fg: "#f4f3ee" },
  { icon: ShoppingBag, name: "Retail & D2C", line: "WhatsApp catalogues, payments and cart recovery.", bg: "#f2c21b", fg: "#09090a" },
  { icon: Stethoscope, name: "Clinics", line: "Appointment booking, reminders and follow-ups.", bg: "#e9e6dc", fg: "#0e0e10" },
  { icon: GraduationCap, name: "Education", line: "Admissions enquiries, fee reminders and class alerts.", bg: "#2b2350", fg: "#f4f3ee" },
  { icon: Trophy, name: "Events & sports", line: "Registrations, passes and event-day updates at scale.", bg: "#0e0e10", fg: "#f2c21b" },
  { icon: CakeSlice, name: "Food & bakeries", line: "Orders, menus and delivery updates on WhatsApp.", bg: "#ffffff", fg: "#0e0e10" },
];

const ease = [0.16, 1, 0.3, 1] as const;

/**
 * Effect 01 — Hover effects: a stacked deck that fans out and lifts on hover
 * (tap on touch screens). Phones get a simple two-column grid.
 */
export default function Industries() {
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState<number | null>(null);
  const mid = (industries.length - 1) / 2;
  const deckRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(200);

  useEffect(() => {
    const el = deckRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setStep(Math.min(222, (el.clientWidth - 214) / (industries.length - 1))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <section data-section="Industries" className="paper relative overflow-hidden py-28 sm:py-36">
      <div className="container-x">
        <div className="mx-auto max-w-[760px] text-center">
          <TextMask
            className="display text-[clamp(38px,5.6vw,76px)] text-paper-ink"
            lines={[
              <>
                Built for businesses that
              </>,
              "run on conversations.",
            ]}
          />
          <p className="mx-auto mt-6 max-w-[520px] text-[16px] text-paper-muted">
            The same building blocks, set up for how your customers buy.
          </p>
        </div>

        {/* Desktop / tablet deck */}
        <div
          ref={deckRef}
          className="relative mx-auto mt-16 hidden h-[420px] max-w-[1180px] md:block"
          onPointerEnter={(e) => e.pointerType === "mouse" && setOpen(true)}
          onPointerLeave={() => {
            setOpen(false);
            setHover(null);
          }}
          onClick={() => setOpen((v) => !v)}
        >
          {industries.map((it, i) => {
            const off = i - mid;
            const lifted = hover === i;
            return (
              <motion.div
                key={it.name}
                onPointerEnter={() => setHover(i)}
                onPointerLeave={() => setHover(null)}
                className="absolute left-[calc(50%-102px)] top-[calc(50%-160px)] h-[320px] w-[204px] cursor-pointer"
                style={{ zIndex: lifted ? 20 : i }}
                animate={
                  open
                    ? { x: off * step, y: Math.abs(off) * 14 - (lifted ? 34 : 0), rotate: off * 4 }
                    : { x: off * 6, y: -Math.abs(off) * 4, rotate: off * 3.2 }
                }
                transition={{ duration: 0.8, ease }}
              >
                <div
                  className="flex h-full flex-col rounded-[24px] border border-black/[0.08] p-6 shadow-[0_24px_50px_-24px_rgba(0,0,0,0.45)]"
                  style={{ background: it.bg, color: it.fg }}
                >
                  <it.icon className="h-6 w-6" strokeWidth={1.7} />
                  <div className="mt-auto">
                    <div className="font-mono text-[10.5px] uppercase tracking-widest opacity-60">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <div className="mt-1 text-[24px] font-semibold leading-tight tracking-tight">{it.name}</div>
                    <p className="mt-2 text-[13.5px] leading-snug opacity-75">{it.line}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Phone grid */}
        <div className="mt-12 grid grid-cols-2 gap-3 md:hidden">
          {industries.map((it) => (
            <div
              key={it.name}
              className="flex min-h-[190px] flex-col rounded-[20px] border border-black/[0.08] p-4"
              style={{ background: it.bg, color: it.fg }}
            >
              <it.icon className="h-5 w-5" strokeWidth={1.7} />
              <div className="mt-auto text-[17px] font-semibold leading-tight">{it.name}</div>
              <p className="mt-1 text-[12px] leading-snug opacity-75">{it.line}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
