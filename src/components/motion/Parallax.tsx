"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { cn } from "@/lib/utils";

/**
 * Effect 06 — Parallax.
 * Moves its children by `speed` × 100 px across the section's time on screen.
 * Negative = drifts up (foreground), positive = lags behind (background).
 */
export default function Parallax({
  children,
  speed = -0.5,
  className,
  rotate = 0,
}: {
  children?: React.ReactNode;
  speed?: number;
  className?: string;
  rotate?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const trigger = el.closest("section") ?? el;
    const dist = speed * 100;
    const tween = gsap.fromTo(
      el,
      { y: -dist, rotate: -rotate },
      {
        y: dist,
        rotate,
        ease: "none",
        scrollTrigger: { trigger, start: "top bottom", end: "bottom top", scrub: true },
      },
    );
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [speed, rotate]);

  return (
    <div ref={ref} className={cn("will-change-transform", className)}>
      {children}
    </div>
  );
}
