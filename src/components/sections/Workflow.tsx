"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Bot, BellRing, CheckCheck, MessageCircle, Workflow as WorkflowIcon } from "lucide-react";
import TextMask from "@/components/motion/TextMask";
import ScrambleText from "@/components/motion/ScrambleText";
import { cn } from "@/lib/utils";

const steps = [
  {
    icon: MessageCircle,
    title: "A lead arrives",
    text: "A customer messages on WhatsApp, Instagram, Messenger, your website or a lead form.",
    tag: "Any channel",
  },
  {
    icon: Bot,
    title: "AI replies & qualifies",
    text: "The assistant answers in seconds, asks the right questions and scores the lead.",
    tag: "Instant reply",
  },
  {
    icon: WorkflowIcon,
    title: "Workflows kick in",
    text: "n8n saves the lead to your CRM or Sheet, alerts your team and sends payment links.",
    tag: "n8n",
  },
  {
    icon: BellRing,
    title: "Follow-ups run themselves",
    text: "Reminders and offers go out on WhatsApp and SMS until the customer replies.",
    tag: "WhatsApp + SMS",
  },
  {
    icon: CheckCheck,
    title: "Deal closed",
    text: "Payment received, order confirmed or booking made — and your dashboard updates.",
    tag: "Revenue",
  },
];

// Curve lives in the top ~60% of the box; labels sit on one row underneath.
const PATH = "M 40 220 C 180 220, 220 40, 340 60 S 520 250, 620 190 S 800 20, 900 70 S 1060 230, 1160 80";

export default function Workflow() {
  const sectionRef = useRef<HTMLElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<{ x: number; y: number }[]>([]);
  const [active, setActive] = useState(-1);

  // Place nodes on the curve (viewBox → % so it scales with the box).
  useEffect(() => {
    const p = pathRef.current;
    if (!p) return;
    const L = p.getTotalLength();
    setNodes(
      steps.map((_, i) => {
        const pt = p.getPointAtLength((L * i) / (steps.length - 1));
        return { x: (pt.x / 1200) * 100, y: (pt.y / 420) * 100 };
      }),
    );
  }, []);

  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px)", () => {
      const p = pathRef.current!;
      const L = p.getTotalLength();
      gsap.set(p, { strokeDasharray: L, strokeDashoffset: L });
      const st = { v: 0 };
      const tween = gsap.to(st, {
        v: 1,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=160%",
          pin: true,
          scrub: 0.6,
        },
        onUpdate: () => {
          p.style.strokeDashoffset = String(L * (1 - st.v));
          const pt = p.getPointAtLength(L * st.v);
          if (dotRef.current) {
            dotRef.current.style.left = `${(pt.x / 1200) * 100}%`;
            dotRef.current.style.top = `${(pt.y / 420) * 100}%`;
          }
          setActive(Math.floor(st.v * (steps.length - 1) + 0.04));
        },
      });
      return () => tween.scrollTrigger?.kill();
    });
    mm.add("(max-width: 1023px)", () => {
      setActive(steps.length - 1);
      const line = sectionRef.current!.querySelector("[data-vline]");
      gsap.fromTo(
        line,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          transformOrigin: "top",
          scrollTrigger: { trigger: line, start: "top 70%", end: "bottom 60%", scrub: true },
        },
      );
    });
    return () => mm.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="workflow"
      data-section="How it works"
      className="grain relative isolate overflow-hidden lg:h-[100svh]"
    >
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div className="grid-lines absolute inset-0 opacity-70" />
        <div className="absolute left-1/2 top-1/2 h-[480px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet/[0.08] blur-[140px]" />
      </div>

      <div className="container-x flex h-full flex-col py-24 lg:pb-12 lg:pt-[calc(var(--nav-h)+28px)]">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <ScrambleText text="How it works" className="mb-5 text-brand" />
            <TextMask
              className="display text-[clamp(38px,5.6vw,76px)]"
              lines={[
                "From first message",
                <>
                  to <span className="serif-accent text-brand">closed deal.</span>
                </>,
              ]}
            />
          </div>
          <p className="max-w-[360px] text-[15px] leading-relaxed text-muted">
            One pipeline, running 24/7. Scroll to follow a lead through it.
          </p>
        </div>

        {/* Desktop: pinned curve */}
        <div className="relative mt-6 hidden flex-1 lg:block">
          <svg viewBox="0 0 1200 420" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible">
            <path d={PATH} fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth="2" strokeDasharray="4 8" vectorEffect="non-scaling-stroke" />
            <path
              ref={pathRef}
              d={PATH}
              fill="none"
              stroke="url(#wf-grad)"
              strokeWidth="2.5"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
            <defs>
              <linearGradient id="wf-grad" x1="0" x2="1">
                <stop offset="0" stopColor="#f2c21b" />
                <stop offset="0.6" stopColor="#ffd84d" />
                <stop offset="1" stopColor="#7b61ff" />
              </linearGradient>
            </defs>
          </svg>

          <div
            ref={dotRef}
            aria-hidden="true"
            className="absolute z-20 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand shadow-[0_0_0_6px_rgba(242,194,27,0.18),0_0_30px_6px_rgba(242,194,27,0.55)]"
            style={{ left: "3.3%", top: "52%" }}
          />

          {nodes.map((n, i) => {
            const s = steps[i];
            const on = i <= active;
            return (
              <div key={s.title}>
                <span
                  className={cn(
                    "absolute z-10 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border transition-all duration-500",
                    on ? "border-brand bg-brand text-ink scale-100" : "border-white/15 bg-ink-2 text-fg/50 scale-90",
                  )}
                  style={{ left: `${n.x}%`, top: `${n.y}%` }}
                >
                  <s.icon className="h-[18px] w-[18px]" />
                </span>
                {/* dashed drop line from node to its label */}
                <span
                  aria-hidden="true"
                  className={cn("absolute w-px border-l border-dashed transition-colors duration-500", on ? "border-brand/50" : "border-white/10")}
                  style={{ left: `${n.x}%`, top: `calc(${n.y}% + 26px)`, height: `calc(${66 - n.y}% - 34px)` }}
                />
                <div
                  className={cn(
                    "absolute top-[66%] w-[min(220px,19%)] transition-all duration-700",
                    i === 0 ? "translate-x-[-22px]" : i === steps.length - 1 ? "-translate-x-[calc(100%-22px)]" : "-translate-x-1/2",
                    on ? "opacity-100" : "opacity-25",
                  )}
                  style={{ left: `${n.x}%` }}
                >
                  <span className="font-mono text-[10.5px] uppercase tracking-widest text-brand">
                    {String(i + 1).padStart(2, "0")} · {s.tag}
                  </span>
                  <h3 className="mt-1.5 text-[19px] font-semibold tracking-tight text-fg">{s.title}</h3>
                  <p className="mt-1 text-[13.5px] leading-snug text-muted">{s.text}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile: vertical timeline */}
        <ol className="relative mt-12 flex flex-col gap-9 pl-12 lg:hidden">
          <span aria-hidden="true" className="absolute bottom-2 left-[19px] top-2 w-px bg-white/10" />
          <span data-vline aria-hidden="true" className="absolute bottom-2 left-[19px] top-2 w-px bg-brand" />
          {steps.map((s, i) => (
            <li key={s.title} className="relative">
              <span className="absolute -left-12 top-0 grid h-10 w-10 place-items-center rounded-full border border-brand bg-ink text-brand">
                <s.icon className="h-4 w-4" />
              </span>
              <span className="font-mono text-[10.5px] uppercase tracking-widest text-brand">
                {String(i + 1).padStart(2, "0")} · {s.tag}
              </span>
              <h3 className="mt-1 text-xl font-semibold tracking-tight">{s.title}</h3>
              <p className="mt-1 text-[14.5px] leading-snug text-muted">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
