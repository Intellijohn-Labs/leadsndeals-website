"use client";

import HeroPhone from "./HeroPhone";
import { motion } from "motion/react";
import { ArrowRight, CreditCard, MessageSquareText } from "lucide-react";
import TextMask from "@/components/motion/TextMask";
import MagneticButton from "@/components/motion/MagneticButton";
import WaveLines from "@/components/motion/WaveLines";
import { useApp } from "@/components/providers/Providers";
import { InstagramIcon, MessengerIcon, WhatsAppIcon } from "@/components/ui/BrandIcons";
import { whatsappLink } from "@/config/site";

const ease = [0.16, 1, 0.3, 1] as const;

export default function Hero() {
  const { introDone } = useApp();
  const wa = whatsappLink();

  return (
    <section
      id="top"
      data-section="Hero"
      className="relative isolate flex min-h-[100svh] items-center overflow-hidden pb-16 pt-28 sm:pt-32 lg:pb-10 lg:pt-[max(96px,11svh)]"
    >
      {/* Flowing wave ribbon behind the content; fades out at the edges and top/bottom */}
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={introDone ? { opacity: 1 } : undefined}
        transition={{ duration: 1.6, delay: 0.3 }}
        className="pointer-events-none absolute inset-x-0 bottom-[4%] -z-10 h-[300px] sm:bottom-[8%] sm:h-[400px] [mask-image:linear-gradient(90deg,transparent,#000_14%,#000_86%,transparent),linear-gradient(180deg,transparent,#000_25%,#000_75%,transparent)] [mask-composite:intersect] [-webkit-mask-composite:source-in] lg:[mask-image:linear-gradient(90deg,transparent_28%,#000_58%,#000_90%,transparent),linear-gradient(180deg,transparent,#000_25%,#000_75%,transparent)]"
      >
        <WaveLines />
      </motion.div>
      <div className="container-x relative grid items-center gap-12 lg:grid-cols-12">
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
            className="display text-[clamp(44px,min(7.6vw,9.4svh),100px)] text-fg"
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
            className="mt-7 max-w-[560px] text-[17px] leading-relaxed text-muted sm:text-lg lg:mt-[min(28px,3svh)]"
          >
            We build WhatsApp chatbots, Instagram and Facebook auto-replies, website chat, bulk SMS, online stores and CRM
            integrations. One team sets it up and supports it, so every enquiry gets a quick reply and a follow-up.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={introDone ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.9, ease, delay: 0.65 }}
            className="mt-9 flex flex-wrap items-center gap-3 lg:mt-[min(36px,3.6svh)]"
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
            className="mt-10 flex items-center gap-4 text-[13px] text-muted lg:mt-[min(40px,3.6svh)]"
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

        {/* Banner visual (Gemini-generated product shot in the brand colours; edges fade into the page) */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={introDone ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 1, ease, delay: 0.35 }}
          className="justify-self-center lg:col-span-5"
        >
          {/* Phone with a live, looping WhatsApp bot chat; sized by height so it always fits the first screen */}
          <HeroPhone
            play={introDone}
            className="h-[min(440px,62svh)] drop-shadow-[0_40px_70px_rgba(242,194,27,0.12)] lg:h-[min(680px,74svh)]"
          />
          <p className="mt-3 text-center text-[12px] text-muted">Example conversations</p>
        </motion.div>
      </div>
    </section>
  );
}
