"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ArrowUpRight } from "lucide-react";
import { services, type Service } from "@/config/site";
import ServiceIcon from "@/components/ui/ServiceIcon";
import TextMask from "@/components/motion/TextMask";
import { openAssistant } from "@/components/providers/Providers";
import { cn } from "@/lib/utils";

const tone: Record<string, string> = {
  whatsapp: "bg-brand text-ink border-brand",
  ecommerce: "bg-paper text-paper-ink border-paper",
};

function Card({ s, i }: { s: Service; i: number }) {
  const t = tone[s.key];
  const light = Boolean(t);
  return (
    <article
      className={cn(
        // svc-card = size container: details hide automatically when the card gets short (see globals.css)
        "svc-card group/card relative flex h-full flex-col overflow-hidden rounded-[22px] border p-6 transition-[transform,box-shadow] duration-500 ease-[var(--ease-expo)] hover:-translate-y-3 hover:shadow-[0_30px_60px_-20px_rgba(0,0,0,0.75)]",
        t ?? "border-white/[0.09] bg-ink-3 text-fg",
      )}
    >
      <div className="flex shrink-0 items-start justify-between gap-2">
        <span
          className={cn(
            "grid h-11 w-11 shrink-0 place-items-center rounded-2xl",
            light ? "bg-ink/10" : "bg-white/[0.06] text-brand",
          )}
        >
          <ServiceIcon k={s.key} className="h-5 w-5" />
        </span>
        {s.status === "coming-soon" ? (
          <span className="rounded-full border border-brand/40 bg-brand/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-brand">
            Coming soon
          </span>
        ) : (
          <span className={cn("font-mono text-[11px]", light ? "text-ink/50" : "text-dim")}>
            {String(i + 1).padStart(2, "0")}
          </span>
        )}
      </div>

      <h3 className="mt-auto pt-6 text-[22px] font-semibold leading-tight tracking-tight">{s.title}</h3>
      <p className={cn("svc-short mt-2 text-[14px] leading-snug", light ? "text-ink/70" : "text-muted")}>{s.short}</p>

      <div className="svc-extra">
      <ul className="mt-5 flex h-[26px] flex-wrap gap-1.5 overflow-hidden">
        {s.points.map((p) => (
          <li
            key={p}
            className={cn(
              "rounded-full px-2.5 py-1 font-mono text-[10.5px]",
              light ? "bg-ink/[0.08] text-ink/75" : "bg-white/[0.05] text-fg/65",
            )}
          >
            {p}
          </li>
        ))}
      </ul>

      <button
        onClick={() => openAssistant(`Tell me about your ${s.title} service.`)}
        className={cn(
          "mt-5 inline-flex items-center gap-1.5 self-start text-[13px] font-medium",
          light ? "text-ink" : "text-fg/80 hover:text-fg",
        )}
      >
        <span className="tactile">Ask about this</span>
        <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover/card:-translate-y-0.5 group-hover/card:translate-x-0.5" />
      </button>
      </div>
    </article>
  );
}

/**
 * Effect 01 (hover) + bonus card fan.
 * Desktop: the eight services start as a stacked deck, fan out as you scroll,
 * then settle into a readable 4 × 2 grid. Hovering any card lifts it.
 * Below 1024 px: a swipeable row instead of a pinned scene.
 */
export default function Services() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
      const stage = stageRef.current!;
      const cards = gsap.utils.toArray<HTMLElement>("[data-fan-card]", stage);
      const n = cards.length;
      const mid = (n - 1) / 2;
      const gap = 18;
      const cols = n > 8 ? 5 : 4; // 10 services → 5 × 2 grid
      const rows = Math.ceil(n / cols);

      const size = () => {
        const W = Math.min(300, (stage.clientWidth - gap * (cols - 1)) / cols);
        const H = Math.min(W * 1.2, (stage.clientHeight - gap * (rows - 1)) / rows);
        return { W, H };
      };
      const applySize = () => {
        const { W, H } = size();
        cards.forEach((c) => {
          c.style.width = `${W}px`;
          c.style.height = `${H}px`;
        });
      };
      applySize();

      gsap.set(cards, {
        xPercent: -50,
        yPercent: -50,
        x: (i) => (i - mid) * 3,
        y: (i) => (i - mid) * -4,
        rotate: (i) => (i - mid) * 2.2,
        zIndex: (i) => i,
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: pinRef.current,
          start: "top top",
          end: "+=170%",
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
          onRefreshInit: applySize,
        },
      });

      tl.to(cards, {
        x: (i) => (i - mid) * size().W * 0.46,
        y: (i) => Math.pow(Math.abs(i - mid), 2) * 9 - 55,
        rotate: (i) => (i - mid) * 6.5,
        duration: 1,
        ease: "power2.inOut",
      })
        .to({}, { duration: 0.25 })
        .to(cards, {
          x: (i) => ((i % cols) - (cols - 1) / 2) * (size().W + gap),
          y: (i) => (Math.floor(i / cols) - (rows - 1) / 2) * (size().H + gap),
          rotate: 0,
          duration: 1.2,
          ease: "power3.inOut",
          stagger: 0.03,
        });

      // lifted card comes to the front while hovered
      const enter = (e: Event) => gsap.set(e.currentTarget as HTMLElement, { zIndex: 50 });
      const leave = (e: Event) => {
        const el = e.currentTarget as HTMLElement;
        gsap.set(el, { zIndex: cards.indexOf(el) });
      };
      cards.forEach((c) => {
        c.addEventListener("pointerenter", enter);
        c.addEventListener("pointerleave", leave);
      });
      return () =>
        cards.forEach((c) => {
          c.removeEventListener("pointerenter", enter);
          c.removeEventListener("pointerleave", leave);
        });
    });
    // Reduced motion: no pin, no fan — just lay the cards out as the final grid.
    mm.add("(min-width: 1024px) and (prefers-reduced-motion: reduce)", () => {
      const stage = stageRef.current!;
      const cards = gsap.utils.toArray<HTMLElement>("[data-fan-card]", stage);
      const gap = 18;
      const cols = cards.length > 8 ? 5 : 4;
      const rows = Math.ceil(cards.length / cols);
      const W = Math.min(300, (stage.clientWidth - gap * (cols - 1)) / cols);
      const H = Math.min(W * 1.16, (stage.clientHeight - gap * (rows - 1)) / rows);
      cards.forEach((c, i) => {
        c.style.width = `${W}px`;
        c.style.height = `${H}px`;
        gsap.set(c, {
          xPercent: -50,
          yPercent: -50,
          x: ((i % cols) - (cols - 1) / 2) * (W + gap),
          y: (Math.floor(i / cols) - (rows - 1) / 2) * (H + gap),
        });
      });
    });
    return () => mm.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="services"
      data-section="Services"
      className="relative overflow-hidden bg-ink-2"
    >
      <div className="container-x pb-10 pt-24 sm:pt-32 lg:pb-0">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <TextMask
              className="display text-[clamp(38px,5.6vw,76px)]"
              lines={[
                <>
                  Ten ways to never
                </>,
                "miss a customer.",
              ]}
            />
          </div>
          <p className="max-w-[360px] text-[15px] leading-relaxed text-muted">
            Pick one channel or connect them all. Every service plugs into the same AI brain and the same workflows.
          </p>
        </div>

        {/* Desktop deck — only this full-height stage pins, so the cards get the whole screen */}
        <div ref={pinRef} className="hidden h-[100svh] pb-8 pt-[calc(var(--nav-h)+20px)] lg:block">
          <div ref={stageRef} className="relative h-full">
            {services.map((s, i) => (
              <div key={s.key} data-fan-card className="absolute left-1/2 top-1/2 will-change-transform">
                <Card s={s} i={i} />
              </div>
            ))}
          </div>
        </div>

        {/* Mobile / tablet swipe row */}
        <div
          className="no-scrollbar -mx-4 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-6 pt-4 lg:hidden"
          data-lenis-prevent
        >
          {services.map((s, i) => (
            <div key={s.key} className="h-[340px] w-[78vw] max-w-[320px] shrink-0 snap-center">
              <Card s={s} i={i} />
            </div>
          ))}
        </div>
        <p className="text-[13px] text-muted lg:hidden">Swipe to see all {services.length} services →</p>
      </div>
    </section>
  );
}
