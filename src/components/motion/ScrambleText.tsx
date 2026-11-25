"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useApp } from "@/components/providers/Providers";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+=/<>";

/**
 * Bonus — Text decrypt.
 * Scrambled glyphs resolve left-to-right when the label enters the viewport.
 * The real text is rendered on the server and exposed to screen readers.
 */
export default function ScrambleText({
  text,
  className,
  duration = 900,
  delay = 0,
}: {
  text: string;
  className?: string;
  duration?: number;
  delay?: number;
}) {
  const { introDone, reducedMotion } = useApp();
  const ref = useRef<HTMLSpanElement>(null);
  const [out, setOut] = useState(text);

  useEffect(() => {
    if (!introDone || reducedMotion || !ref.current) return;
    let raf = 0;
    let timer: ReturnType<typeof setTimeout>;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        timer = setTimeout(() => {
          const start = performance.now();
          const step = (now: number) => {
            const p = Math.min(1, (now - start) / duration);
            const fixed = Math.floor(p * text.length);
            let s = text.slice(0, fixed);
            for (let i = fixed; i < text.length; i++) {
              s += text[i] === " " ? " " : GLYPHS[(Math.random() * GLYPHS.length) | 0];
            }
            setOut(s);
            if (p < 1) raf = requestAnimationFrame(step);
          };
          raf = requestAnimationFrame(step);
        }, delay);
      },
      { threshold: 0.6 },
    );
    io.observe(ref.current);
    return () => {
      io.disconnect();
      clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [introDone, reducedMotion, text, duration, delay]);

  return (
    <span ref={ref} className={cn("eyebrow inline-block", className)} aria-label={text}>
      <span aria-hidden="true">{out}</span>
    </span>
  );
}
