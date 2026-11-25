"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Volume2 } from "lucide-react";
import { assistant } from "@/config/site";
import { cn } from "@/lib/utils";
import Orb from "./Orb";

export const hasPresenter = Boolean(assistant.portrait || assistant.idle.webm || assistant.idle.mov);

/** Safari plays VP9 WebM but drops the alpha channel (black box), so it only gets .mov or the still. */
const noop = () => () => {};
function useIsSafari() {
  return useSyncExternalStore(
    noop,
    () => /^((?!chrome|chromium|android|crios|fxios|edg).)*safari/i.test(navigator.userAgent),
    () => false,
  );
}

function Sources({ webm, mov, safari }: { webm: string; mov: string; safari: boolean }) {
  return (
    <>
      {mov && <source src={mov} type='video/quicktime; codecs="hvc1"' />}
      {webm && !safari && <source src={webm} type="video/webm" />}
    </>
  );
}

/** Run `fn` on the next frame the video actually paints (falls back to the `playing`/`seeked` event). */
function onNextPaintedFrame(v: HTMLVideoElement, fn: () => void, fallback: "playing" | "seeked") {
  if ("requestVideoFrameCallback" in v) {
    v.requestVideoFrameCallback(() => fn());
  } else {
    (v as HTMLVideoElement).addEventListener(fallback, fn, { once: true });
  }
}

/** Greeting speaks with sound once per page load; later opens on the same page greet silently. */
let greetedWithSound = false;
/** Wait for the chat panel's open animation so the first word is seen, not missed. */
const GREET_DELAY_MS = 520;

/**
 * The assistant's face. With your own media it shows a cut-out presenter
 * (idle loop + one-off greeting); otherwise an animated orb.
 *
 * Only ONE video is ever visible: both are transparent, so stacking them would show
 * two heads wherever she moves. Switches happen on the exact painted frame, no fades:
 *   idle held on frame 0  ──(greeting frame 0 painted; identical pose)──▶ greeting
 *   greeting ended        ──(idle seeked to handoffAt, closest pose)────▶ idle
 *   voice starts speaking ──(talk loop frame 0 = portrait pose)─────────▶ talk
 *   voice stops           ──(idle from frame 0)──────────────────────────▶ idle
 */
export default function Presenter({
  className,
  speaking = false,
  greet = false,
  fit = "stand",
}: {
  className?: string;
  speaking?: boolean;
  greet?: boolean;
  fit?: "stand" | "cover";
}) {
  const safari = useIsSafari();
  const idleRef = useRef<HTMLVideoElement>(null);
  const greetRef = useRef<HTMLVideoElement>(null);
  const talkRef = useRef<HTMLVideoElement>(null);
  const shownRef = useRef<"idle" | "greet" | "talk">("idle");
  const speakingRef = useRef(speaking);
  useEffect(() => {
    speakingRef.current = speaking;
  }, [speaking]);
  // Decided once per opening; a ref survives React dev StrictMode's double effect run.
  const firstRef = useRef<boolean | null>(null);
  const [needsTap, setNeedsTap] = useState(false);
  const playRef = useRef<(withSound: boolean) => void>(() => {});
  const idleSrc = assistant.idle.mov || (!safari && assistant.idle.webm);
  const greetSrc = assistant.greetingClip.mov || (!safari && assistant.greetingClip.webm);
  const withGreeting = Boolean(greet && greetSrc && idleSrc);
  const talkSrc = assistant.talk.mov || (!safari && assistant.talk.webm);
  const withTalk = Boolean(greet && talkSrc && idleSrc); // only the chat-header presenter talks

  /** Make exactly one video visible. */
  const showOnly = useCallback((which: "idle" | "greet" | "talk") => {
    shownRef.current = which;
    const map = { idle: idleRef.current, greet: greetRef.current, talk: talkRef.current };
    (Object.keys(map) as (keyof typeof map)[]).forEach((k) => {
      const el = map[k];
      if (el) el.style.visibility = k === which ? "visible" : "hidden";
    });
    if (which !== "talk") talkRef.current?.pause();
  }, []);

  const startTalk = useCallback(() => {
    const talk = talkRef.current;
    if (!talk) return;
    talk.currentTime = 0;
    onNextPaintedFrame(talk, () => showOnly("talk"), "playing");
    talk.play().catch(() => {});
  }, [showOnly]);

  useEffect(() => {
    const idle = idleRef.current;
    const hi = greetRef.current;
    if (!withGreeting || !idle || !hi) return;

    const resumeIdle = (at: number) => {
      idle.currentTime = at;
      onNextPaintedFrame(idle, () => showOnly("idle"), "seeked");
      idle.play().catch(() => {});
    };

    // hold idle on frame 0 — the greeting starts on this exact pose
    idle.pause();
    idle.currentTime = 0;

    if (firstRef.current === null) {
      firstRef.current = !greetedWithSound;
      greetedWithSound = true;
    }
    const first = firstRef.current;

    // if a reply is already being spoken when the greeting ends, go straight to talking
    const onEnded = () => (speakingRef.current && talkRef.current ? startTalk() : resumeIdle(assistant.idle.handoffAt));
    hi.addEventListener("ended", onEnded);

    const playGreeting = (withSound: boolean) => {
      idle.pause();
      idle.currentTime = 0;
      hi.currentTime = 0;
      hi.muted = !withSound;
      onNextPaintedFrame(hi, () => showOnly("greet"), "playing");
      hi.play()
        .then(() => setNeedsTap(!withSound))
        .catch((err) => {
          console.warn("[ira] greeting with sound refused:", err?.name);
          hi.muted = true; // sound refused by the browser — greet silently, offer a tap
          setNeedsTap(true);
          hi.play().catch(() => resumeIdle(0));
        });
    };
    playRef.current = playGreeting;

    const timer = setTimeout(() => playGreeting(first), GREET_DELAY_MS);

    return () => {
      clearTimeout(timer);
      hi.removeEventListener("ended", onEnded);
    };
  }, [withGreeting, showOnly, startTalk]);

  // Voice reply playing → talking loop; finished → back to idle.
  useEffect(() => {
    const idle = idleRef.current;
    if (!withTalk || !idle || shownRef.current === "greet") return;
    if (speaking && shownRef.current !== "talk") {
      startTalk();
    } else if (!speaking && shownRef.current === "talk") {
      idle.currentTime = 0;
      onNextPaintedFrame(idle, () => showOnly("idle"), "seeked");
      idle.play().catch(() => {});
    }
  }, [speaking, withTalk, startTalk, showOnly]);

  const hearIra = useCallback(() => {
    setNeedsTap(false);
    playRef.current(true); // inside a click, so the browser allows sound
  }, []);

  if (hasPresenter) {
    const media = cn(
      "absolute inset-0 h-full w-full",
      fit === "stand" ? "object-contain object-bottom" : "object-cover object-top",
    );
    return (
      <div className={cn("relative h-full w-full overflow-hidden", className)}>
        {idleSrc ? (
          <video
            ref={idleRef}
            autoPlay={!withGreeting}
            muted
            loop
            playsInline
            preload="auto"
            poster={assistant.portrait || undefined}
            className={media}
          >
            <Sources webm={assistant.idle.webm} mov={assistant.idle.mov} safari={safari} />
          </video>
        ) : (
          // Still: a slow "breathing" scale keeps her from looking frozen.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={assistant.portrait}
            alt=""
            className={media}
            style={{ transformOrigin: "50% 100%", animation: `presenter-breathe ${speaking ? 2.2 : 4.6}s ease-in-out infinite` }}
          />
        )}
        {withGreeting && (
          <video ref={greetRef} playsInline preload="auto" className={media} style={{ visibility: "hidden" }}>
            <Sources webm={assistant.greetingClip.webm} mov={assistant.greetingClip.mov} safari={safari} />
          </video>
        )}
        {withTalk && (
          <video ref={talkRef} muted loop playsInline preload="auto" className={media} style={{ visibility: "hidden" }}>
            <Sources webm={assistant.talk.webm} mov={assistant.talk.mov} safari={safari} />
          </video>
        )}
        {withGreeting && needsTap && (
          <button
            type="button"
            onClick={hearIra}
            className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-black/75 px-3 py-1.5 text-[11.5px] font-medium text-white backdrop-blur transition-colors hover:bg-black"
          >
            <Volume2 className="h-3.5 w-3.5 text-brand" /> Tap to hear {assistant.name}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={cn("relative grid h-full w-full place-items-center", className)}>
      <div
        aria-hidden="true"
        className="absolute h-[70%] w-[70%] rounded-full bg-[conic-gradient(from_90deg,#f2c21b55,#7b61ff55,#3ec6ff44,#f2c21b55)] blur-3xl"
        style={{ animation: "orb-spin 9s linear infinite" }}
      />
      <Orb size={160} speaking={speaking} className="!h-[58%] !w-auto aspect-square" />
    </div>
  );
}
