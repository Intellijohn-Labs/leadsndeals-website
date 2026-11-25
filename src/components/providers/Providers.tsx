"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionConfig } from "motion/react";
import { useMedia } from "@/lib/useMedia";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface AppState {
  /** true once the preloader starts handing the page over */
  introDone: boolean;
  finishIntro: () => void;
  reducedMotion: boolean;
  scrollTo: (target: string | HTMLElement | number) => void;
}

const AppContext = createContext<AppState>({
  introDone: true,
  finishIntro: () => {},
  reducedMotion: false,
  scrollTo: () => {},
});

export const useApp = () => useContext(AppContext);

/** Open the AI assistant from anywhere: openAssistant("optional prompt") */
export function openAssistant(prompt?: string) {
  window.dispatchEvent(new CustomEvent("lnd:assistant", { detail: { prompt } }));
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [introDone, setIntroDone] = useState(false);
  const reducedMotion = useMedia("(prefers-reduced-motion: reduce)");
  const lenisRef = useRef<Lenis | null>(null);

  // Smooth inertia scroll, driven by GSAP's ticker so ScrollTrigger never jitters.
  useEffect(() => {
    if (reducedMotion) return;
    // Touch screens keep native scrolling: Lenis registers non-passive touch listeners, which make
    // iOS wait for JavaScript on every swipe — the page felt frozen while the animations set up.
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true, wheelMultiplier: 1 });
    lenisRef.current = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    if (document.documentElement.dataset.intro === "pending") lenis.stop();
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [reducedMotion]);

  const finishIntro = useCallback(() => {
    document.documentElement.dataset.intro = "done";
    lenisRef.current?.start();
    setIntroDone(true);
    requestAnimationFrame(() => ScrollTrigger.refresh());
  }, []);

  const scrollTo = useCallback((target: string | HTMLElement | number) => {
    const offset = -(parseInt(getComputedStyle(document.documentElement).getPropertyValue("--nav-h")) || 76);
    if (lenisRef.current) {
      lenisRef.current.scrollTo(target, { offset, duration: 1.4 });
      return;
    }
    if (typeof target === "number") window.scrollTo({ top: target });
    else {
      const el = typeof target === "string" ? document.querySelector(target) : target;
      el?.scrollIntoView({ block: "start" });
    }
  }, []);

  // Smooth in-page anchor links site-wide.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest?.("a[href^='#']") as HTMLAnchorElement | null;
      if (!a) return;
      const hash = a.getAttribute("href")!;
      if (hash === "#") {
        e.preventDefault();
        scrollTo(0);
        return;
      }
      const el = document.querySelector(hash);
      if (!el) return;
      e.preventDefault();
      scrollTo(el as HTMLElement);
      history.replaceState(null, "", hash);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [scrollTo]);

  return (
    <AppContext.Provider value={{ introDone, finishIntro, reducedMotion, scrollTo }}>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </AppContext.Provider>
  );
}
