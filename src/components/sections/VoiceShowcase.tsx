"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CalendarCheck, Clock, Languages, Mic, PhoneIncoming, PhoneOff, Grid3x3 } from "lucide-react";
import Presenter from "@/components/assistant/Presenter";
import PixelReveal from "@/components/motion/PixelReveal";
import Parallax from "@/components/motion/Parallax";
import TextMask from "@/components/motion/TextMask";
import ScrambleText from "@/components/motion/ScrambleText";
import MagneticButton from "@/components/motion/MagneticButton";
import { assistant } from "@/config/site";
import { prefillContact } from "@/components/sections/Contact";

const script = [
  { who: "ai", text: `Hi! This is ${assistant.name} from Sunrise Dental. How can I help you today?` },
  { who: "caller", text: "I'd like to book a cleaning this week." },
  { who: "ai", text: "Of course — is Thursday 11 AM or Friday 4 PM better for you?" },
  { who: "caller", text: "Friday works." },
  { who: "ai", text: "Done! I've sent your confirmation on WhatsApp. See you Friday." },
] as const;

const features = [
  { icon: PhoneIncoming, title: "Answers every call", text: "Inbound and outbound, day or night — no hold music." },
  { icon: CalendarCheck, title: "Books appointments", text: "Checks your calendar and confirms on WhatsApp." },
  { icon: Languages, title: "Speaks naturally", text: "Human-like voice, built for Indian accents and languages." },
];

function Bars() {
  return (
    <div className="flex h-9 items-center justify-center gap-[3px]" aria-hidden="true">
      {Array.from({ length: 22 }, (_, i) => (
        <span
          key={i}
          className="w-[3px] rounded-full bg-ink"
          style={{
            height: `${30 + ((i * 37) % 70)}%`,
            animation: `eq ${0.5 + (i % 5) * 0.12}s ease-in-out ${i * 0.04}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

function Phone() {
  const [line, setLine] = useState(0);
  const [secs, setSecs] = useState(17);

  useEffect(() => {
    const a = setInterval(() => setLine((l) => (l + 1) % script.length), 2600);
    const b = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => {
      clearInterval(a);
      clearInterval(b);
    };
  }, []);

  const current = script[line];
  return (
    <div className="relative mx-auto w-[300px] sm:w-[330px]">
      <div className="relative aspect-[9/19] rounded-[52px] bg-[#111] p-[11px] shadow-[0_50px_100px_-30px_rgba(0,0,0,0.55),inset_0_0_0_1.5px_#2a2a2e]">
        <div className="relative flex h-full flex-col overflow-hidden rounded-[42px] bg-[#fbfaf7] text-paper-ink">
          {/* status bar */}
          <div className="flex items-center justify-between px-7 pt-3.5 text-[12px] font-semibold">
            <span>9:41</span>
            <span className="h-[26px] w-[92px] rounded-full bg-[#111]" />
            <span className="font-mono text-[10px]">5G ▮▮▮</span>
          </div>

          <div className="mt-4 text-center">
            <div className="text-[19px] font-semibold tracking-tight">{assistant.name}</div>
            <div className="mt-0.5 flex items-center justify-center gap-1.5 text-[11.5px] text-paper-muted">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-wa" /> AI voice agent · on call
            </div>
          </div>

          <div className="relative mx-5 mt-4 flex-1 overflow-hidden rounded-[28px] bg-gradient-to-b from-[#16161a] to-[#0b0b0d]">
            <Presenter fit="cover" speaking={current.who === "ai"} />
            {/* live caption */}
            <div className="absolute inset-x-3 bottom-3">
              <AnimatePresence mode="wait">
                <motion.div
                  key={line}
                  initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
                  transition={{ duration: 0.45 }}
                  className={
                    current.who === "ai"
                      ? "rounded-2xl rounded-bl-md bg-white/95 px-3.5 py-2.5 text-[12.5px] leading-snug text-paper-ink"
                      : "ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-brand px-3.5 py-2.5 text-[12.5px] leading-snug text-ink"
                  }
                >
                  <span className="mb-0.5 block font-mono text-[9.5px] uppercase tracking-wider opacity-60">
                    {current.who === "ai" ? assistant.name : "Caller"}
                  </span>
                  {current.text}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <div className="px-6 pb-6 pt-4">
            <Bars />
            <div className="mt-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5 rounded-full bg-black/[0.05] px-3 py-1.5 font-mono text-[12px] font-semibold">
                <Clock className="h-3.5 w-3.5 text-brand-deep" />
                {String(Math.floor(secs / 60)).padStart(2, "0")}:{String(secs % 60).padStart(2, "0")}
              </span>
              <div className="flex items-center gap-2">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-black/[0.06]">
                  <Mic className="h-4 w-4" />
                </span>
                <span className="grid h-10 w-10 place-items-center rounded-full bg-black/[0.06]">
                  <Grid3x3 className="h-4 w-4" />
                </span>
                <span className="grid h-10 w-10 place-items-center rounded-full bg-[#ff3b30] text-white">
                  <PhoneOff className="h-4 w-4" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* coming soon ribbon */}
      <div className="absolute -left-6 top-[38%] z-30 -rotate-[8deg] rounded-full bg-paper-ink px-4 py-2 font-mono text-[11px] uppercase tracking-widest text-brand shadow-xl sm:-left-14">
        Calling · coming soon
      </div>
    </div>
  );
}

export default function VoiceShowcase() {
  return (
    <section id="voice" data-section="Voice AI" className="paper relative isolate overflow-hidden py-28 sm:py-36">
      <div aria-hidden="true" className="grid-lines absolute inset-0 -z-10 opacity-80" />
      <Parallax speed={0.6} className="absolute -right-32 top-10 -z-10 h-[420px] w-[420px] rounded-full glow [--glow-color:rgb(242_194_27/0.3)]" />
      <Parallax speed={-0.4} className="absolute -left-20 bottom-0 -z-10 h-[340px] w-[340px] rounded-full glow [--glow-color:rgb(123_97_255/0.15)]" />

      <div className="container-x grid items-center gap-16 lg:grid-cols-2">
        <div>
          <ScrambleText text="Voice AI agents" className="mb-5 text-brand-deep" />
          <TextMask
            className="display text-[clamp(38px,5.6vw,76px)] text-paper-ink"
            lines={[
              "An agent that",
              <>
                <span className="serif-accent">picks up</span> every call.
              </>,
            ]}
          />
          <p className="mt-6 max-w-[480px] text-[17px] leading-relaxed text-paper-muted">
            Voice AI that answers questions, qualifies callers and books appointments in a natural voice — then follows
            up on WhatsApp. We&apos;re opening it to early-access customers soon.
          </p>

          <ul className="mt-10 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {features.map((f, i) => (
              <motion.li
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.8, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-2xl border border-black/[0.08] bg-white/70 p-5 backdrop-blur"
              >
                <f.icon className="h-5 w-5 text-brand-deep" />
                <div className="mt-4 text-[15.5px] font-semibold tracking-tight">{f.title}</div>
                <p className="mt-1 text-[13.5px] leading-snug text-paper-muted">{f.text}</p>
              </motion.li>
            ))}
          </ul>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <MagneticButton variant="dark" pulse={false} onClick={() => prefillContact("Voice AI Agents (early access)")}>
              Join early access
            </MagneticButton>
            <span className="eyebrow text-paper-muted">Sample call shown · not a live recording</span>
          </div>
        </div>

        <Parallax speed={-0.35}>
          <PixelReveal color="var(--color-paper)" cols={8} rows={12} className="mx-auto w-fit rounded-[52px]">
            <Phone />
          </PixelReveal>
        </Parallax>
      </div>
    </section>
  );
}
