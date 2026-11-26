"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { cn } from "@/lib/utils";

/**
 * Text reveal on scroll: words light up one by one as the paragraph scrolls through the viewport.
 * Wrap a word in *asterisks* to show it in the brand colour.
 * Reduced-motion users get the paragraph fully lit straight away.
 */
export default function ScrollWordReveal({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-word]",
        { opacity: 0.16 },
        {
          opacity: 1,
          ease: "none",
          stagger: 0.12,
          scrollTrigger: { trigger: ref.current, start: "top 80%", end: "bottom 45%", scrub: 0.6 },
        },
      );
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <p ref={ref} className={className} aria-label={text.replace(/\*/g, "")}>
      {text.split(" ").map((w, i) => (
        <span key={i} aria-hidden="true">
          <span data-word className={cn(w.startsWith("*") && "text-brand")}>
            {w.replace(/\*/g, "")}
          </span>{" "}
        </span>
      ))}
    </p>
  );
}
