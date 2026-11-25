"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  CalendarCheck,
  CodeXml,
  CreditCard,
  Database,
  Globe,
  MessageSquareText,
  PhoneCall,
  ShoppingBag,
  Sheet,
  Store,
  type LucideIcon,
} from "lucide-react";
import { InstagramIcon, MessengerIcon, N8nIcon, WhatsAppIcon } from "@/components/ui/BrandIcons";

type Item = { label: string; icon: LucideIcon | ((p: { className?: string }) => React.ReactNode); color: string };

const rowA: Item[] = [
  { label: "WhatsApp", icon: WhatsAppIcon, color: "#25d366" },
  { label: "Instagram", icon: InstagramIcon, color: "#e1306c" },
  { label: "Messenger", icon: MessengerIcon, color: "#4f8cff" },
  { label: "Website chat", icon: Globe, color: "#f2c21b" },
  { label: "Voice AI", icon: PhoneCall, color: "#a78bfa" },
  { label: "Direct SMS", icon: MessageSquareText, color: "#38bdf8" },
];
const rowB: Item[] = [
  { label: "n8n workflows", icon: N8nIcon, color: "#ff6d5a" },
  { label: "WhatsApp stores", icon: Store, color: "#25d366" },
  { label: "Online stores", icon: ShoppingBag, color: "#f2c21b" },
  { label: "CRM sync", icon: Database, color: "#a78bfa" },
  { label: "Google Sheets", icon: Sheet, color: "#34a853" },
  { label: "UPI payments", icon: CreditCard, color: "#38bdf8" },
  { label: "Bookings", icon: CalendarCheck, color: "#f97316" },
  { label: "Web apps", icon: CodeXml, color: "#f4f3ee" },
];

function Row({ items }: { items: Item[] }) {
  return (
    <div className="fade-x flex overflow-hidden">
      <div data-track className="flex shrink-0 items-center gap-3 pr-3 will-change-transform">
        {[...items, ...items, ...items, ...items].map((it, i) => (
          <span
            key={i}
            className="flex shrink-0 items-center gap-3 rounded-full border border-white/[0.08] bg-white/[0.025] py-2 pl-2 pr-5 transition-colors duration-300 hover:border-white/20 hover:bg-white/[0.05]"
          >
            <span
              className="grid h-9 w-9 place-items-center rounded-full"
              style={{ background: `${it.color}1f`, color: it.color }}
            >
              <it.icon className="h-[18px] w-[18px]" />
            </span>
            <span className="whitespace-nowrap text-[15px] font-medium tracking-tight text-fg/85">{it.label}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * Channel strip: two rows of pills drifting in opposite directions.
 * Speeds up with scroll velocity and follows scroll direction.
 */
export default function ChannelMarquee() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tracks = gsap.utils.toArray<HTMLElement>("[data-track]", root);
    // each track holds 4 copies, so moving 25 % loops seamlessly
    const tweens = tracks.map((t, i) =>
      gsap.fromTo(
        t,
        { xPercent: i % 2 ? -25 : 0 },
        { xPercent: i % 2 ? 0 : -25, duration: 30, ease: "none", repeat: -1 },
      ),
    );
    if (reduced) tweens.forEach((t) => t.pause());

    let dir = 1;
    const st = ScrollTrigger.create({
      trigger: root,
      start: "top bottom",
      end: "bottom top",
      onUpdate: (self) => {
        if (reduced) return;
        dir = self.direction;
        const boost = Math.min(Math.abs(self.getVelocity()) / 300, 5);
        tweens.forEach((tw) => gsap.to(tw, { timeScale: dir * (1 + boost), duration: 0.25, overwrite: true }));
      },
    });
    const settle = setInterval(() => {
      if (reduced) return;
      tweens.forEach((tw) => gsap.to(tw, { timeScale: dir, duration: 1.2, overwrite: true }));
    }, 450);

    return () => {
      clearInterval(settle);
      st.kill();
      tweens.forEach((t) => t.kill());
    };
  }, []);

  return (
    <div ref={ref} aria-label="Channels and tools we automate" className="relative py-14 sm:py-20">
      <div className="container-x mb-8 flex items-center justify-center gap-4">
        <span className="h-px w-10 bg-white/10" />
        <span className="eyebrow text-dim">One AI brain · every channel you sell on</span>
        <span className="h-px w-10 bg-white/10" />
      </div>
      <div className="flex flex-col gap-3">
        <Row items={rowA} />
        <Row items={rowB} />
      </div>
    </div>
  );
}
