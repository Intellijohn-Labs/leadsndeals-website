"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useApp } from "@/components/providers/Providers";
import { useMedia } from "@/lib/useMedia";

/**
 * Effect 02 — Smooth loader.
 * Branded intro: logo wipes in with the counter, then the screen dissolves
 * in a randomised pixel grid to reveal the page. Repeat visits get a short version.
 */
const STATUS = ["Connecting channels", "Training the assistant", "Syncing workflows", "Ready"];

export default function Preloader() {
  const { finishIntro, reducedMotion } = useApp();
  const rootRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const logoMaskRef = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(0);
  const [gone, setGone] = useState(false);
  const mobile = useMedia("(max-width: 767px)");
  const grid = mobile ? { cols: 6, rows: 10 } : { cols: 12, rows: 7 };

  useEffect(() => {
    // Phones get a quicker intro: shorter count, a lower cap on waiting, and a plain fade-out.
    const phone = window.matchMedia("(max-width: 767px)").matches;
    let repeat = false;
    try {
      repeat = sessionStorage.getItem("lnd-intro") === "1";
      sessionStorage.setItem("lnd-intro", "1");
    } catch {}

    const counter = { v: 0 };
    const minDuration = reducedMotion ? 0.2 : repeat ? 0.5 : phone ? 1 : 1.7;
    const fontsReady = document.fonts?.ready ?? Promise.resolve();
    const pageReady =
      document.readyState === "complete"
        ? Promise.resolve()
        : new Promise<void>((r) => window.addEventListener("load", () => r(), { once: true }));
    // "Settled": the browser has painted ~12 smooth frames in a row, i.e. all the section
    // animations have finished setting up. Ending the loader before this left phones janky.
    const settled = () =>
      new Promise<void>((res) => {
        let calm = 0;
        let last = performance.now();
        const tick = (t: number) => {
          calm = t - last < 50 ? calm + 1 : 0;
          last = t;
          if (calm >= 8) res();
          else requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    // Wait for the whole page (fonts, images, scripts) and a calm main thread — capped so a
    // slow network never traps anyone (8 s phones, 6 s desktop).
    const ready = Promise.race([
      Promise.all([fontsReady, pageReady]).then(settled),
      new Promise((r) => setTimeout(r, phone ? 8000 : 6000)),
    ]);
    let crawl: gsap.core.Tween | null = null;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ paused: true });
      tl.to(counter, {
        v: 86,
        duration: minDuration,
        ease: "power2.inOut",
        onUpdate: () => setCount(Math.round(counter.v)),
      });
      tl.fromTo(
        logoMaskRef.current,
        { clipPath: "inset(0 100% 0 0)" },
        { clipPath: "inset(0 0% 0 0)", duration: minDuration, ease: "power3.inOut" },
        0,
      );
      // If the page is still loading when the first count ends, keep creeping towards 99.
      tl.eventCallback("onComplete", () => {
        crawl = gsap.to(counter, { v: 99, duration: 6, ease: "power1.out", onUpdate: () => setCount(Math.round(counter.v)) });
      });
      tl.play();

      ready.then(async () => {
        await tl.then();
        crawl?.kill();
        const finish = gsap.timeline();
        finish.to(counter, {
          v: 100,
          duration: reducedMotion ? 0.1 : 0.35,
          ease: "power1.out",
          onUpdate: () => setCount(Math.round(counter.v)),
        });
        finish.to("[data-pl-center]", { autoAlpha: 0, y: -12, duration: 0.35, ease: "power2.in" }, "+=0.05");
        finish.add(() => {
          finishIntro();
          // Let taps and swipes through right away, even while the loader is fading out.
          if (rootRef.current) rootRef.current.style.pointerEvents = "none";
        });
        if (reducedMotion || phone) {
          finish.to(rootRef.current, { autoAlpha: 0, duration: 0.3 });
        } else {
          finish.to(
            gridRef.current!.children,
            {
              scale: 0,
              autoAlpha: 0,
              duration: 0.5,
              ease: "power3.in",
              stagger: { amount: 0.55, from: "random" },
            },
            "<",
          );
        }
        finish.add(() => setGone(true));
      });
    }, rootRef);

    return () => ctx.revert();
  }, [finishIntro, reducedMotion]);

  if (gone) return null;

  const status = STATUS[Math.min(STATUS.length - 1, Math.floor(count / 30))];

  return (
    <div
      ref={rootRef}
      data-preloader
      aria-hidden="true"
      className="fixed inset-0 z-[100] pointer-events-auto"
    >
      <div
        ref={gridRef}
        className="absolute inset-0 grid"
        style={{
          gridTemplateColumns: `repeat(${grid.cols}, 1fr)`,
          gridTemplateRows: `repeat(${grid.rows}, 1fr)`,
        }}
      >
        {Array.from({ length: grid.cols * grid.rows }, (_, i) => (
          <div key={i} className="bg-ink" style={{ margin: "-0.5px" }} />
        ))}
      </div>

      <div data-pl-center className="absolute inset-0 flex flex-col items-center justify-center px-6">
        <div className="relative w-[min(78vw,420px)]">
          {/* faint base + wiping bright logo */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo.png" alt="" className="w-full opacity-[0.12]" />
          <div ref={logoMaskRef} className="absolute inset-0" style={{ clipPath: "inset(0 100% 0 0)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo.png" alt="" className="w-full" />
          </div>
        </div>

        <div className="absolute bottom-8 left-0 right-0 container-x flex items-end justify-between">
          <span className="eyebrow text-muted">{status}…</span>
          <span className="font-mono text-[clamp(48px,9vw,112px)] leading-none font-medium tracking-tighter text-fg tabular-nums">
            {String(count).padStart(3, "0")}
            <span className="text-brand text-[0.35em] align-top ml-1">%</span>
          </span>
        </div>
        <div className="absolute bottom-0 left-0 h-[2px] bg-brand" style={{ width: `${count}%` }} />
      </div>
    </div>
  );
}
