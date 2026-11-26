"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { Check, CheckCheck } from "lucide-react";

/**
 * Hero phone: the cut-out phone frame (transparent screen) over a live, animated WhatsApp-style
 * chat that plays like a video and loops through example businesses. Real text, tiny download,
 * pauses off-screen, static for reduced-motion users.
 */

type Step =
  | { t: "in"; text: string }
  | { t: "out"; text: string }
  | { t: "typing" }
  | { t: "card"; lines: [string, string][] }
  | { t: "chips"; items: string[] }
  | { t: "pay"; label: string }
  | { t: "system"; text: string };

type Chat = { name: string; initials: string; color: string; steps: Step[] };

const CHATS: Chat[] = [
  {
    name: "Sweet Bakes",
    initials: "SB",
    color: "#f2c21b",
    steps: [
      { t: "in", text: "Hi! Do you have chocolate cakes today?" },
      { t: "typing" },
      { t: "out", text: "Yes 🎂 Here are today's picks:" },
      { t: "card", lines: [["Chocolate truffle · 1 kg", "₹850"], ["Black forest · 1 kg", "₹750"]] },
      { t: "in", text: "Truffle for Saturday, please" },
      { t: "typing" },
      { t: "out", text: "Lovely! Total ₹850. Tap to pay and confirm:" },
      { t: "pay", label: "Pay ₹850 via UPI" },
      { t: "system", text: "Payment received · Order #2041 confirmed" },
    ],
  },
  {
    name: "SmileCare Dental",
    initials: "SD",
    color: "#38bdf8",
    steps: [
      { t: "in", text: "Can I book a teeth cleaning this week?" },
      { t: "typing" },
      { t: "out", text: "Of course! Pick a slot that suits you:" },
      { t: "chips", items: ["Thu 11:00", "Thu 4:30", "Fri 10:00"] },
      { t: "in", text: "Thu 4:30" },
      { t: "typing" },
      { t: "out", text: "Booked ✅ Thursday, 4:30 PM. I'll send you a reminder the day before." },
      { t: "system", text: "Appointment added · Reminder scheduled" },
    ],
  },
  {
    name: "Skyline Homes",
    initials: "SH",
    color: "#a78bfa",
    steps: [
      { t: "in", text: "Any 2BHK in Kakkanad under 60 lakhs?" },
      { t: "typing" },
      { t: "out", text: "Yes, 3 ready-to-move options. Here's the closest match:" },
      { t: "card", lines: [["2BHK · 1,150 sq ft", "₹58 L"], ["Near Infopark · Ready to move", ""]] },
      { t: "in", text: "Can I visit on Sunday?" },
      { t: "typing" },
      { t: "out", text: "Site visit fixed for Sunday, 11 AM 📍 Our agent will call you to confirm." },
      { t: "system", text: "Lead saved to CRM · Agent notified" },
    ],
  },
];

const PAUSE = { in: 1100, out: 1300, typing: 1100, card: 1500, chips: 1400, pay: 1400, system: 2800 } as const;

export default function HeroPhone({ play, className }: { play: boolean; className?: string }) {
  const [chat, setChat] = useState(0);
  const [shown, setShown] = useState(0); // how many steps of the current chat are visible
  const [visible, setVisible] = useState(true);
  const [reduced, setReduced] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  const steps = CHATS[chat].steps;

  // Drive the "video": reveal one step at a time; at the end, pause and move to the next chat.
  useEffect(() => {
    if (reduced) {
      setShown(CHATS[0].steps.length);
      return;
    }
    if (!play || !visible) return;
    if (shown < steps.length) {
      const prev = steps[shown - 1];
      const wait = shown === 0 ? 700 : PAUSE[prev.t];
      const id = setTimeout(() => setShown((n) => n + 1), wait);
      return () => clearTimeout(id);
    }
    const id = setTimeout(() => {
      setShown(0);
      setChat((c) => (c + 1) % CHATS.length);
    }, 3200);
    return () => clearTimeout(id);
  }, [shown, steps, play, visible, reduced]);

  // "typing…" only while it is the latest step
  const visibleSteps = steps.slice(0, shown).filter((s, i, arr) => s.t !== "typing" || i === arr.length - 1);
  const isTyping = steps[shown - 1]?.t === "typing";
  const c = CHATS[chat];

  return (
    <div ref={ref} className={className}>
      <div className="relative aspect-[568/1091] h-full [container-type:inline-size]">
        {/* Screen content sits behind the frame's see-through screen */}
        <div
          className="absolute overflow-hidden bg-[#0b141a]"
          style={{ left: "5.3%", top: "2.2%", width: "89.4%", height: "95.6%", borderRadius: "10.5% / 5.2%" }}
        >
          <div className="flex h-full flex-col text-[#e9edef]">
            {/* status bar + chat header */}
            <div className="bg-[#1f2c34] px-[4cqw] pb-[2.6cqw] pt-[9.5cqw]">
              <div className="flex items-center gap-[2.6cqw]">
                <span
                  className="grid aspect-square w-[9cqw] shrink-0 place-items-center rounded-full text-[3.2cqw] font-bold text-[#0b141a]"
                  style={{ background: c.color }}
                >
                  {c.initials}
                </span>
                <div className="min-w-0 leading-tight">
                  <div className="truncate text-[4.5cqw] font-semibold">{c.name}</div>
                  <div className="text-[3cqw] text-[#8696a0]">{isTyping ? "typing…" : "online"}</div>
                </div>
              </div>
            </div>

            {/* messages: newest at the bottom, older ones scroll up naturally */}
            <div className="flex flex-1 flex-col justify-end gap-[1.8cqw] overflow-hidden px-[3.2cqw] pb-[3cqw] pt-[2cqw]">
              <AnimatePresence mode="popLayout" initial={false}>
                {visibleSteps.map((s, i) => (
                  <motion.div
                    key={`${chat}-${steps.indexOf(s)}-${i}`}
                    layout
                    initial={{ opacity: 0, y: 10, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.15 } }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className={rowClass(s)}
                  >
                    <Bubble s={s} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* input bar */}
            <div className="flex items-center gap-[2cqw] bg-[#0b141a] px-[3cqw] pb-[6cqw] pt-[1cqw]">
              <div className="flex-1 rounded-full bg-[#1f2c34] px-[4cqw] py-[2.4cqw] text-[3.2cqw] text-[#8696a0]">Message</div>
              <span className="grid aspect-square w-[9cqw] place-items-center rounded-full bg-[#00a884]">
                <span className="block h-[3cqw] w-[3cqw] rounded-full bg-[#0b141a]/70" />
              </span>
            </div>
          </div>
        </div>

        {/* The phone frame (transparent screen) on top */}
        <Image
          src="/hero/phone-frame.webp"
          alt="Phone showing an example WhatsApp conversation handled by a Leadsndeals bot"
          width={568}
          height={1091}
          priority
          sizes="(min-width: 1024px) 380px, 240px"
          className="pointer-events-none absolute inset-0 h-full w-full select-none"
        />
      </div>
    </div>
  );
}

function rowClass(s: Step) {
  if (s.t === "in") return "flex justify-end";
  if (s.t === "system") return "flex justify-center pt-[1cqw]";
  return "flex justify-start";
}

function Bubble({ s }: { s: Step }) {
  const base = "max-w-[82%] rounded-[2.6cqw] px-[3cqw] py-[1.8cqw] text-[3.9cqw] leading-snug shadow-sm";
  switch (s.t) {
    case "in":
      // the customer (right, green like your own messages on WhatsApp)
      return (
        <p className={`${base} rounded-br-[0.8cqw] bg-[#005c4b]`}>
          {s.text}
          <CheckCheck className="ml-[1cqw] inline h-[3.2cqw] w-[3.2cqw] text-[#53bdeb]" />
        </p>
      );
    case "out":
      return <p className={`${base} rounded-bl-[0.8cqw] bg-[#1f2c34]`}>{s.text}</p>;
    case "typing":
      return (
        <span className={`${base} flex gap-[1cqw] rounded-bl-[0.8cqw] bg-[#1f2c34] py-[2.6cqw]`}>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="block h-[1.6cqw] w-[1.6cqw] animate-bounce rounded-full bg-[#8696a0]"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </span>
      );
    case "card":
      return (
        <div className={`${base} w-[78%] space-y-[1.4cqw] rounded-bl-[0.8cqw] bg-[#1f2c34]`}>
          {s.lines.map(([a, b]) => (
            <div key={a} className="flex items-center justify-between gap-[2cqw] border-b border-white/[0.06] pb-[1.2cqw] last:border-0 last:pb-0">
              <span>{a}</span>
              {b && <span className="font-semibold text-[#f2c21b]">{b}</span>}
            </div>
          ))}
        </div>
      );
    case "chips":
      return (
        <div className="flex max-w-[90%] flex-wrap gap-[1.6cqw]">
          {s.items.map((x) => (
            <span key={x} className="rounded-full border border-[#00a884]/60 px-[2.8cqw] py-[1.2cqw] text-[3.6cqw] text-[#00a884]">
              {x}
            </span>
          ))}
        </div>
      );
    case "pay":
      return (
        <span className="rounded-[2.6cqw] bg-[#f2c21b] px-[4cqw] py-[2cqw] text-[3.9cqw] font-semibold text-[#0b141a] shadow">
          {s.label}
        </span>
      );
    case "system":
      return (
        <span className="inline-flex items-center gap-[1.2cqw] rounded-full bg-[#182229] px-[3cqw] py-[1.2cqw] text-[3.2cqw] text-[#8696a0]">
          <Check className="h-[3cqw] w-[3cqw] text-[#00a884]" /> {s.text}
        </span>
      );
  }
}
