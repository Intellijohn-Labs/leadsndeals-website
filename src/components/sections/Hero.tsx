"use client";

import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import gsap from "gsap";
import { ArrowRight, CreditCard, MessageSquareText } from "lucide-react";
import Avatar from "@/components/assistant/Avatar";
import TextMask from "@/components/motion/TextMask";
import ScrambleText from "@/components/motion/ScrambleText";
import MagneticButton from "@/components/motion/MagneticButton";
import ParticleSphere from "@/components/motion/ParticleSphere";
import { openAssistant, useApp } from "@/components/providers/Providers";
import { InstagramIcon, MessengerIcon, N8nIcon, WhatsAppIcon } from "@/components/ui/BrandIcons";
import { assistant } from "@/config/site";

const ease = [0.16, 1, 0.3, 1] as const;

const chips = [
  { icon: InstagramIcon, label: "New lead", meta: "Instagram DM", pos: "left-[2%] top-[14%]", depth: 1.4 },
  { icon: WhatsAppIcon, label: "Order paid · ₹1,250", meta: "WhatsApp store", pos: "right-[0%] top-[30%]", depth: -1.1 },
  { icon: MessageSquareText, label: "Reminder sent", meta: "Direct SMS", pos: "left-[6%] bottom-[18%]", depth: -0.8 },
  { icon: N8nIcon, label: "Workflow ran", meta: "CRM updated", pos: "right-[8%] bottom-[8%]", depth: 1.2 },
];

export default function Hero() {
  const { introDone } = useApp();
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  // Layered parallax: background drifts slower, chips react to the cursor at different depths.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const ctx = gsap.context(() => {
      gsap.to("[data-hero-bg]", {
        yPercent: 22,
        ease: "none",
        scrollTrigger: { trigger: section, start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to("[data-hero-copy]", {
        y: -80,
        opacity: 0.2,
        ease: "none",
        scrollTrigger: { trigger: section, start: "top top", end: "bottom top", scrub: true },
      });
      gsap.utils.toArray<HTMLElement>("[data-chip]").forEach((chip) => {
        gsap.to(chip, {
          y: -140 * Number(chip.dataset.depth),
          ease: "none",
          scrollTrigger: { trigger: section, start: "top top", end: "bottom top", scrub: true },
        });
      });
    }, section);

    const stage = stageRef.current;
    const setters = stage
      ? gsap.utils.toArray<HTMLElement>("[data-chip-inner]", stage).map((el) => ({
          x: gsap.quickTo(el, "x", { duration: 0.8, ease: "power3" }),
          y: gsap.quickTo(el, "y", { duration: 0.8, ease: "power3" }),
          d: Number(el.dataset.depth),
        }))
      : [];
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      setters.forEach((s) => {
        s.x(nx * 36 * s.d);
        s.y(ny * 28 * s.d);
      });
    };
    window.addEventListener("pointermove", onMove);
    return () => {
      ctx.revert();
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="top"
      data-section="Hero"
      className="grain relative isolate flex min-h-[100svh] items-center overflow-hidden pb-16 pt-28 sm:pt-32"
    >
      {/* Background layer */}
      <div data-hero-bg aria-hidden="true" className="absolute inset-0 -z-10">
        <div className="grid-lines absolute inset-0" />
        <div className="absolute left-[55%] top-[18%] h-[520px] w-[520px] rounded-full bg-brand/[0.13] blur-[140px]" />
        <div className="absolute left-[72%] top-[48%] h-[420px] w-[420px] rounded-full bg-violet/[0.16] blur-[140px]" />
        <div className="absolute -left-40 bottom-0 h-[360px] w-[360px] rounded-full bg-brand/[0.05] blur-[120px]" />
      </div>

      <div className="container-x grid items-center gap-10 lg:grid-cols-12">
        <div data-hero-copy className="relative z-10 lg:col-span-7">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={introDone ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.8, ease, delay: 0.1 }}
            className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.03] py-1.5 pl-2 pr-4"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inset-0 animate-ping rounded-full bg-brand/70" />
              <span className="relative h-2 w-2 rounded-full bg-brand" />
            </span>
            <ScrambleText text="Intelligent automations for growing businesses" className="text-fg/70" delay={200} />
          </motion.div>

          <TextMask
            as="h1"
            play={introDone}
            delay={0.15}
            className="display text-[clamp(46px,8.4vw,112px)] text-fg"
            lines={[
              "Turn every",
              "conversation",
              <>
                into a <span className="serif-accent text-brand">deal.</span>
              </>,
            ]}
          />

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={introDone ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.9, ease, delay: 0.55 }}
            className="mt-7 max-w-[560px] text-[17px] leading-relaxed text-muted sm:text-lg"
          >
            AI chatbots for WhatsApp, Instagram, Facebook and your website — plus Direct SMS, n8n workflows and online
            stores. One intelligent system that replies in seconds and follows up until the sale is done.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={introDone ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.9, ease, delay: 0.7 }}
            className="mt-9 flex flex-wrap items-center gap-3"
          >
            <MagneticButton href="#contact" className="h-[52px] px-7">
              Book a free demo <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </MagneticButton>
            <MagneticButton variant="ghost" pulse={false} onClick={() => openAssistant()} className="h-[52px] pl-2 pr-6">
              <span className="relative">
                <Avatar size={36} />
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-wa ring-2 ring-[#0d0d10]" />
              </span>
              Ask {assistant.name}, our AI
            </MagneticButton>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={introDone ? { opacity: 1 } : undefined}
            transition={{ duration: 1, delay: 0.95 }}
            className="mt-10 flex items-center gap-4 text-dim"
          >
            <span className="eyebrow">Works on</span>
            <div className="flex items-center gap-3.5 text-fg/55">
              <WhatsAppIcon className="h-[18px] w-[18px]" />
              <InstagramIcon className="h-[18px] w-[18px]" />
              <MessengerIcon className="h-[18px] w-[18px]" />
              <MessageSquareText className="h-[18px] w-[18px]" strokeWidth={1.8} />
              <CreditCard className="h-[18px] w-[18px]" strokeWidth={1.8} />
            </div>
          </motion.div>
        </div>

        {/* 3D stage */}
        <motion.div
          ref={stageRef}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={introDone ? { opacity: 1, scale: 1 } : undefined}
          transition={{ duration: 1.6, ease, delay: 0.2 }}
          className="relative aspect-square w-full max-w-[620px] justify-self-center lg:col-span-5 lg:-mr-10"
        >
          <ParticleSphere />
          {chips.map((c, i) => (
            <div key={c.label} data-chip data-depth={c.depth} className={`pointer-events-none absolute ${c.pos}`}>
              <div data-chip-inner data-depth={c.depth}>
                <motion.div
                  initial={{ opacity: 0, y: 14, scale: 0.94 }}
                  animate={introDone ? { opacity: 1, y: 0, scale: 1 } : undefined}
                  transition={{ duration: 0.9, ease, delay: 0.9 + i * 0.12 }}
                >
                  <div
                    className="glass flex items-center gap-2.5 rounded-2xl py-2 pl-2 pr-3.5 shadow-[0_18px_40px_-18px_rgba(0,0,0,0.8)]"
                    style={{ animation: `float-y ${5 + i}s ease-in-out ${i * 0.4}s infinite` }}
                  >
                    <span className="grid h-8 w-8 place-items-center rounded-xl bg-white/[0.06] text-brand">
                      <c.icon className="h-4 w-4" />
                    </span>
                    <span className="leading-tight">
                      <span className="block text-[12.5px] font-medium text-fg">{c.label}</span>
                      <span className="block font-mono text-[10px] text-muted">{c.meta}</span>
                    </span>
                  </div>
                </motion.div>
              </div>
            </div>
          ))}
          <span className="eyebrow pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 text-dim">
            Drag to spin
          </span>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={introDone ? { opacity: 1 } : undefined}
        transition={{ delay: 1.4, duration: 1 }}
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex"
        aria-hidden="true"
      >
        <span className="eyebrow text-dim">Scroll</span>
        <span className="relative h-10 w-px overflow-hidden bg-white/10">
          <span className="absolute inset-x-0 top-0 h-1/2 animate-[float-y_1.6s_ease-in-out_infinite] bg-brand" />
        </span>
      </motion.div>
    </section>
  );
}
