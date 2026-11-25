"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { cn } from "@/lib/utils";
import { useApp } from "@/components/providers/Providers";
import { useMedia } from "@/lib/useMedia";

/**
 * Effect 04 — Entrance reveal.
 * A grid of solid tiles covers the media and dissolves in a random wave
 * when it scrolls into view. Lighter grid on phones.
 */
export default function PixelReveal({
  children,
  className,
  cols = 10,
  rows = 8,
  color = "var(--color-ink)",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  cols?: number;
  rows?: number;
  color?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const tilesRef = useRef<HTMLDivElement>(null);
  const { introDone } = useApp();
  const small = useMedia("(max-width: 767px)");
  const dims = small ? { cols: Math.ceil(cols / 2), rows: Math.ceil(rows / 2) } : { cols, rows };
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!introDone || !ref.current) return;
    const el = ref.current;
    let tween: gsap.core.Tween | null = null;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || !tilesRef.current) return;
        io.disconnect();
        tween = gsap.to(tilesRef.current.children, {
          scale: 0,
          autoAlpha: 0,
          duration: 0.5,
          delay,
          ease: "power2.inOut",
          stagger: { amount: 0.6, from: "random" },
          onComplete: () => setDone(true),
        });
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      tween?.kill();
    };
  }, [introDone, delay, small]);

  return (
    <div ref={ref} className={cn("relative", className)}>
      {children}
      {!done && (
        <div
          ref={tilesRef}
          aria-hidden="true"
          className="absolute inset-0 z-20 grid pointer-events-none overflow-hidden rounded-[inherit]"
          style={{
            gridTemplateColumns: `repeat(${dims.cols}, 1fr)`,
            gridTemplateRows: `repeat(${dims.rows}, 1fr)`,
          }}
        >
          {Array.from({ length: dims.cols * dims.rows }, (_, i) => (
            <div key={i} style={{ background: color, margin: "-0.5px" }} />
          ))}
        </div>
      )}
    </div>
  );
}
