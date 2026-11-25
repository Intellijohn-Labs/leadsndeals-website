"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import MagneticButton from "@/components/motion/MagneticButton";
import { openAssistant, useApp } from "@/components/providers/Providers";
import { cn } from "@/lib/utils";
import { assistant } from "@/config/site";
import Avatar from "@/components/assistant/Avatar";

const links = [
  { label: "Services", href: "#services" },
  { label: "How it works", href: "#workflow" },
  { label: "Voice AI", href: "#voice" },
  { label: "E-commerce", href: "#commerce" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

const ease = [0.16, 1, 0.3, 1] as const;

export default function Navbar() {
  const { introDone } = useApp();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      if (Math.abs(y - last) > 6) {
        setHidden(y > last && y > 400);
        last = y;
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
  }, [open]);

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={introDone ? { y: hidden && !open ? -110 : 0, opacity: 1 } : undefined}
        transition={{ duration: 0.7, ease }}
        className="fixed inset-x-0 top-0 z-50 pt-3 sm:pt-4"
      >
        <div className="container-x">
          <nav
            className={cn(
              "flex h-[58px] items-center justify-between rounded-full pl-5 pr-2 transition-all duration-500",
              scrolled || open ? "glass shadow-[0_10px_40px_-12px_rgba(0,0,0,0.6)]" : "border border-transparent",
            )}
          >
            <a href="#" aria-label="Leadsndeals home" className="shrink-0">
              <Image src="/brand/wordmark.png" alt="Leadsndeals" width={1082} height={199} priority className="h-[26px] w-auto sm:h-[30px]" />
            </a>

            <ul className="hidden items-center gap-7 lg:flex">
              {links.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="tactile text-[14px] text-fg/70 transition-colors hover:text-fg">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-2">
              <button
                onClick={() => openAssistant()}
                className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] py-1.5 pl-1.5 pr-3.5 text-[13px] text-fg/85 transition-colors hover:border-white/25 md:inline-flex"
              >
                <Avatar size={26} />
                Talk to {assistant.name}
              </button>
              <div className="hidden sm:block">
                <MagneticButton href="#contact" className="h-10 px-5 text-[14px]">
                  Book a demo
                </MagneticButton>
              </div>
              <button
                onClick={() => setOpen((v) => !v)}
                aria-label={open ? "Close menu" : "Open menu"}
                aria-expanded={open}
                className="grid h-10 w-10 place-items-center rounded-full border border-white/10 text-fg lg:hidden"
              >
                {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
            </div>
          </nav>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.7, ease }}
            className="fixed inset-0 z-40 flex flex-col bg-ink-2 px-6 pb-10 pt-28 lg:hidden"
          >
            <ul className="flex flex-col gap-1">
              {links.map((l, i) => (
                <li key={l.href} className="overflow-hidden">
                  <motion.a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.7, ease, delay: 0.15 + i * 0.05 }}
                    className="display block py-1 text-[clamp(40px,11vw,64px)] text-fg"
                  >
                    {l.label}
                  </motion.a>
                </li>
              ))}
            </ul>
            <div className="mt-auto flex flex-col gap-3">
              <button
                onClick={() => {
                  setOpen(false);
                  openAssistant();
                }}
                className="flex items-center justify-center gap-2 rounded-full border border-white/15 py-3.5 text-fg"
              >
                <Avatar size={24} /> Talk to {assistant.name}
              </button>
              <a
                href="#contact"
                onClick={() => setOpen(false)}
                className="rounded-full bg-brand py-3.5 text-center font-medium text-ink"
              >
                Book a demo
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
