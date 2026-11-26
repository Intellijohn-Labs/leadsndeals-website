"use client";

import { motion } from "motion/react";
import { ArrowRight, Check, CreditCard, MessageSquareText } from "lucide-react";
import TextMask from "@/components/motion/TextMask";
import MagneticButton from "@/components/motion/MagneticButton";
import { useApp } from "@/components/providers/Providers";
import { InstagramIcon, MessengerIcon, WhatsAppIcon } from "@/components/ui/BrandIcons";
import { whatsappLink } from "@/config/site";

const ease = [0.16, 1, 0.3, 1] as const;

/** A plain, realistic example of what a Leadsndeals WhatsApp assistant does (clearly labelled as an example). */
const chat: { from: "customer" | "bot" | "system"; text: string }[] = [
  { from: "customer", text: "Hi, do you deliver cakes to Kakkanad?" },
  { from: "bot", text: "Yes, we do. Delivery is free on orders above ₹500. Would you like to see today's cakes?" },
  { from: "customer", text: "1 kg chocolate cake for Saturday, please" },
  { from: "bot", text: "Done. Here's your UPI payment link. Your order is confirmed as soon as it's paid." },
  { from: "system", text: "Lead saved to CRM · Team notified" },
];

export default function Hero() {
  const { introDone } = useApp();
  const wa = whatsappLink();

  return (
    <section id="top" data-section="Hero" className="relative flex min-h-[100svh] items-center pb-16 pt-28 sm:pt-32">
      <div className="container-x grid items-center gap-12 lg:grid-cols-12">
        <div className="relative z-10 lg:col-span-7">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={introDone ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.8, ease, delay: 0.1 }}
            className="mb-6 text-[14px] font-medium text-fg/70"
          >
            WhatsApp, Instagram, SMS and web automation for growing businesses
          </motion.p>

          <TextMask
            as="h1"
            play={introDone}
            delay={0.15}
            className="display text-[clamp(44px,7.6vw,100px)] text-fg"
            lines={[
              "Turn every",
              "conversation",
              <>
                into a <span className="text-brand">deal.</span>
              </>,
            ]}
          />

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={introDone ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.9, ease, delay: 0.5 }}
            className="mt-7 max-w-[560px] text-[17px] leading-relaxed text-muted sm:text-lg"
          >
            We build WhatsApp chatbots, Instagram and Facebook auto-replies, website chat, bulk SMS, online stores and CRM
            integrations. One team sets it up and supports it, so every enquiry gets a quick reply and a follow-up.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={introDone ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.9, ease, delay: 0.65 }}
            className="mt-9 flex flex-wrap items-center gap-3"
          >
            <MagneticButton href="#contact" className="h-[52px] px-7">
              Book a free demo <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </MagneticButton>
            {wa && (
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-[52px] items-center gap-2.5 rounded-full border border-white/15 px-6 text-[15px] font-medium text-fg transition-colors hover:border-white/30"
              >
                <WhatsAppIcon className="h-[18px] w-[18px] text-wa" /> Chat on WhatsApp
              </a>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={introDone ? { opacity: 1 } : undefined}
            transition={{ duration: 1, delay: 0.85 }}
            className="mt-10 flex items-center gap-4 text-[13px] text-muted"
          >
            <span>Works on</span>
            <div className="flex items-center gap-3.5 text-fg/60" aria-label="WhatsApp, Instagram, Messenger, SMS and payments">
              <WhatsAppIcon className="h-[18px] w-[18px]" />
              <InstagramIcon className="h-[18px] w-[18px]" />
              <MessengerIcon className="h-[18px] w-[18px]" />
              <MessageSquareText className="h-[18px] w-[18px]" strokeWidth={1.8} />
              <CreditCard className="h-[18px] w-[18px]" strokeWidth={1.8} />
            </div>
          </motion.div>
        </div>

        {/* Product visual: an example WhatsApp conversation (desktop / tablet) */}
        <motion.figure
          initial={{ opacity: 0, y: 24 }}
          animate={introDone ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 1, ease, delay: 0.35 }}
          className="hidden w-full max-w-[420px] justify-self-center md:block lg:col-span-5 lg:justify-self-end"
        >
          <div className="overflow-hidden rounded-[22px] border border-white/10 bg-[#0e1512] shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)]">
            <div className="flex items-center gap-3 border-b border-white/[0.06] bg-[#16211c] px-4 py-3">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-wa/15 text-wa">
                <WhatsAppIcon className="h-[18px] w-[18px]" />
              </span>
              <div className="leading-tight">
                <div className="text-[14px] font-semibold text-fg">Your business</div>
                <div className="text-[12px] text-fg/55">Replies instantly</div>
              </div>
            </div>
            <div className="space-y-2.5 px-4 py-5">
              {chat.map((m, i) =>
                m.from === "system" ? (
                  <div key={i} className="flex justify-center pt-1">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] px-3 py-1 text-[12px] text-fg/70">
                      <Check className="h-3.5 w-3.5 text-wa" /> {m.text}
                    </span>
                  </div>
                ) : (
                  <div key={i} className={m.from === "customer" ? "flex justify-end" : "flex justify-start"}>
                    <p
                      className={
                        m.from === "customer"
                          ? "max-w-[80%] rounded-2xl rounded-br-md bg-[#1f5c45] px-3.5 py-2 text-[14px] leading-snug text-fg"
                          : "max-w-[80%] rounded-2xl rounded-bl-md bg-white/[0.07] px-3.5 py-2 text-[14px] leading-snug text-fg/90"
                      }
                    >
                      {m.text}
                    </p>
                  </div>
                ),
              )}
            </div>
          </div>
          <figcaption className="mt-3 text-center text-[12.5px] text-muted">Example conversation</figcaption>
        </motion.figure>
      </div>
    </section>
  );
}
