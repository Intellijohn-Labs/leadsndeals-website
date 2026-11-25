"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import TextMask from "@/components/motion/TextMask";
import ScrambleText from "@/components/motion/ScrambleText";

const steps = [
  {
    n: "01",
    title: "Discover",
    text: "A free call to understand your channels, your customers and where enquiries get lost today. You leave with a clear automation plan.",
    items: ["Channel & funnel review", "Use-case shortlist", "Clear quote"],
  },
  {
    n: "02",
    title: "Build",
    text: "We set up your WhatsApp Business API, train the AI on your business, connect your tools with n8n and test with real conversations.",
    items: ["Chatbots & flows", "Integrations", "Testing with your team"],
  },
  {
    n: "03",
    title: "Launch & grow",
    text: "We go live, watch the conversations, and keep improving replies, follow-ups and offers so results compound month after month.",
    items: ["Go-live support", "Monitoring", "Ongoing improvements"],
  },
];

/** Sticky stacking cards: each step pins, the previous one recedes behind it. */
export default function Process() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>("[data-step]");
      cards.forEach((card, i) => {
        if (i === cards.length - 1) return;
        gsap.to(card.firstElementChild, {
          scale: 0.92,
          filter: "brightness(0.45)",
          ease: "none",
          scrollTrigger: { trigger: cards[i + 1], start: "top bottom", end: "top 25%", scrub: true },
        });
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section id="process" data-section="Process" className="relative py-28 sm:py-36">
      <div className="container-x">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-[calc(var(--nav-h)+40px)]">
              <ScrambleText text="How we work" className="mb-5 text-brand" />
              <TextMask
                className="display text-[clamp(38px,5vw,68px)]"
                lines={[
                  "Three steps.",
                  <>
                    <span className="serif-accent text-brand">Zero</span> guesswork.
                  </>,
                ]}
              />
              <p className="mt-6 max-w-[340px] text-[15.5px] leading-relaxed text-muted">
                You stay focused on your business. We handle the setup, the integrations and the fine-tuning.
              </p>
            </div>
          </div>

          <div ref={ref} className="flex flex-col gap-6 lg:col-span-8">
            {steps.map((s, i) => (
              <div
                key={s.n}
                data-step
                className="sticky"
                style={{ top: `calc(var(--nav-h) + 24px + ${i * 22}px)` }}
              >
                <div className="origin-top rounded-[28px] border border-white/[0.09] bg-ink-3 p-8 sm:p-11">
                  <div className="flex items-start justify-between">
                    <span className="display text-[clamp(64px,9vw,120px)] leading-none text-brand">{s.n}</span>
                    <span className="eyebrow mt-3 text-dim">Step {i + 1} of 3</span>
                  </div>
                  <h3 className="mt-6 text-[clamp(28px,3.2vw,40px)] font-semibold tracking-tight">{s.title}</h3>
                  <p className="mt-3 max-w-[560px] text-[16px] leading-relaxed text-muted">{s.text}</p>
                  <ul className="mt-8 flex flex-wrap gap-2">
                    {s.items.map((it) => (
                      <li key={it} className="rounded-full border border-white/10 px-3.5 py-1.5 text-[13px] text-fg/80">
                        {it}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
