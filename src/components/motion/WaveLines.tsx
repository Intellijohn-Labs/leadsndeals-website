"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Flowing ribbon of thin wave lines (hero background).
 * Each line is the same wave with a small phase / amplitude offset, so together they twist like
 * a ribbon that slowly changes shape. Cheap 2D canvas: pauses off-screen, fewer lines + 30 fps on
 * phones, a single still frame for reduced-motion users.
 */
export default function WaveLines({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const phone = window.matchMedia("(max-width: 767px), (pointer: coarse)").matches;
    const LINES = phone ? 22 : 42;
    const STEP = phone ? 10 : 6; // px between points along each line
    const FRAME = phone ? 33 : 16; // ms between frames (≈30 / 60 fps)

    let w = 0,
      h = 0,
      dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, phone ? 1 : 1.5);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(canvas);

    const draw = (t: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = 1;
      const cy = h * 0.5;
      const amp = h * 0.32;
      const k = (Math.PI * 2 * 1.15) / Math.max(w, 1); // ~1.15 waves across the width
      for (let i = 0; i < LINES; i++) {
        const p = i / (LINES - 1); // 0..1 across the bundle
        const phase = p * 1.9 + t * 0.00022;
        const spread = (p - 0.5) * h * 0.22; // vertical spread of the ribbon
        const twist = Math.sin(t * 0.00035 + p * 3.1) * 0.35 + 0.75; // breathing amplitude per line
        const gold = i % 7 === 3;
        const a = gold ? 0.32 : 0.05 + 0.13 * Math.sin(p * Math.PI);
        ctx.strokeStyle = gold ? `rgba(242,194,27,${a})` : `rgba(244,243,238,${a})`;
        ctx.beginPath();
        for (let x = -STEP; x <= w + STEP; x += STEP) {
          // envelope: the ribbon is fuller in the middle of its run and narrower at the ends
          const env = 0.55 + 0.45 * Math.sin((x / w) * Math.PI);
          const y =
            cy +
            spread * env +
            Math.sin(x * k + phase) * amp * twist * env +
            Math.sin(x * k * 2.3 - phase * 0.7 + t * 0.00015) * amp * 0.18;
          if (x === -STEP) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    };

    let raf = 0;
    let last = 0;
    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible || document.hidden || t - last < FRAME) return;
      last = t;
      draw(t);
    };
    if (reduced) draw(4000);
    else raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className={cn("pointer-events-none block h-full w-full", className)} />;
}
