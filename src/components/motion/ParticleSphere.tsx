"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Effect 03 — 3D motion.
 * A particle sphere drawn on a 2D canvas (no three.js, ~0 KB extra):
 * drag to spin it, the cursor pushes particles away, scrolling loosens it.
 * Pauses when off-screen or when the tab is hidden.
 */
export default function ParticleSphere({ className, count = 1400 }: { className?: string; count?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isSmall = window.innerWidth < 768;
    const n = isSmall ? Math.round(count * 0.55) : count;

    // Fibonacci sphere + a few accent particles in brand yellow.
    const pts = new Float32Array(n * 3);
    const accent = new Uint8Array(n);
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < n; i++) {
      const y = 1 - (i / (n - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const t = golden * i;
      const jitter = 1 + (Math.random() - 0.5) * 0.06;
      pts[i * 3] = Math.cos(t) * r * jitter;
      pts[i * 3 + 1] = y * jitter;
      pts[i * 3 + 2] = Math.sin(t) * r * jitter;
      accent[i] = Math.random() < 0.09 ? 1 : 0;
    }

    let w = 0,
      h = 0,
      dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let rotY = 0.6,
      rotX = -0.25,
      velY = 0.0022,
      velX = 0;
    let dragging = false,
      lastX = 0,
      lastY = 0;
    const mouse = { x: -9999, y: -9999 };
    let scrollLoose = 0;

    const onDown = (e: PointerEvent) => {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
      if (!dragging) return;
      velY = (e.clientX - lastX) * 0.004;
      velX = (e.clientY - lastY) * 0.004;
      lastX = e.clientX;
      lastY = e.clientY;
    };
    const onUp = (e: PointerEvent) => {
      dragging = false;
      if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
    };
    const onLeave = () => {
      mouse.x = mouse.y = -9999;
    };
    const onScroll = () => {
      const r = canvas.getBoundingClientRect();
      scrollLoose = Math.min(1, Math.max(0, -r.top / (r.height || 1)));
    };
    canvas.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointerleave", onLeave);
    window.addEventListener("scroll", onScroll, { passive: true });

    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(canvas);

    let raf = 0;
    const draw = () => {
      raf = requestAnimationFrame(draw);
      if (!visible || document.hidden) return;

      if (!dragging) {
        velY += (0.0022 - velY) * 0.02; // ease back to idle spin
        velX *= 0.95;
      }
      rotY += reduced ? 0 : velY;
      rotX = Math.max(-1.1, Math.min(1.1, rotX + velX));

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const R = Math.min(w, h) * 0.38;
      const cx = w / 2,
        cy = h / 2;
      const cosY = Math.cos(rotY),
        sinY = Math.sin(rotY),
        cosX = Math.cos(rotX),
        sinX = Math.sin(rotX);
      const loose = 1 + scrollLoose * 0.55;
      const fov = 2.6;

      for (let i = 0; i < n; i++) {
        let x = pts[i * 3],
          y = pts[i * 3 + 1],
          z = pts[i * 3 + 2];
        // per-particle breathing when the sphere loosens on scroll
        const spread = loose + (accent[i] ? 0.08 : 0) * scrollLoose;
        x *= spread;
        y *= spread;
        z *= spread;
        // rotate Y then X
        const x1 = x * cosY - z * sinY;
        const z1 = x * sinY + z * cosY;
        const y1 = y * cosX - z1 * sinX;
        const z2 = y * sinX + z1 * cosX;

        const scale = fov / (fov + z2);
        let sx = cx + x1 * R * scale;
        let sy = cy + y1 * R * scale;

        // cursor repulsion
        const dx = sx - mouse.x,
          dy = sy - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 9000) {
          const f = (1 - d2 / 9000) * 18;
          const d = Math.sqrt(d2) || 1;
          sx += (dx / d) * f;
          sy += (dy / d) * f;
        }

        const depth = (1 - z2) / 2; // 0 back → 1 front
        const size = (accent[i] ? 2.1 : 1.35) * scale;
        const alpha = 0.12 + depth * 0.78;
        ctx.fillStyle = accent[i] ? `rgba(242,194,27,${alpha})` : `rgba(244,243,238,${alpha * 0.85})`;
        ctx.fillRect(sx - size / 2, sy - size / 2, size, size);
      }
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", onScroll);
    };
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      aria-label="Interactive particle sphere — drag to rotate"
      role="img"
      className={cn("block h-full w-full cursor-grab active:cursor-grabbing touch-pan-y", className)}
    />
  );
}
