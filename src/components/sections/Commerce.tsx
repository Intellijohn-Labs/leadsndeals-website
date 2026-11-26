"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "motion/react";
import { Check, CheckCheck, ShoppingCart, Store, Truck, Undo2 } from "lucide-react";
import TextMask from "@/components/motion/TextMask";
import Parallax from "@/components/motion/Parallax";
import { WhatsAppIcon } from "@/components/ui/BrandIcons";

const products = [
  { name: "Chocolate Truffle", price: "₹1,250", hue: "from-[#5b3a29] to-[#2a1a12]" },
  { name: "Red Velvet", price: "₹1,100", hue: "from-[#9d2235] to-[#4a0f19]" },
  { name: "Mango Delight", price: "₹980", hue: "from-[#f2b01e] to-[#b8730a]" },
];

type Msg =
  | { from: "user"; text: string }
  | { from: "bot"; text: string; catalogue?: boolean; pay?: boolean };

const thread: Msg[] = [
  { from: "user", text: "Hi! Do you have birthday cakes for tomorrow?" },
  { from: "bot", text: "Yes! Here are today's favourites 🎂", catalogue: true },
  { from: "user", text: "Chocolate Truffle, 1 kg please" },
  { from: "bot", text: "Added to cart · 1 × Chocolate Truffle — ₹1,250", pay: true },
  { from: "bot", text: "✅ Payment received. Order #1042 confirmed — delivery tomorrow, 5 PM." },
];

function WhatsAppDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.4 });
  const [shown, setShown] = useState(1);
  const [typing, setTyping] = useState(false);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const run = (i: number) => {
      if (cancelled) return;
      if (i > thread.length) {
        timers.push(
          setTimeout(() => {
            setCycle((c) => c + 1);
            setShown(1);
            run(2);
          }, 3200),
        );
        return;
      }
      const isBot = thread[i - 1].from === "bot";
      if (isBot) setTyping(true);
      timers.push(
        setTimeout(
          () => {
            setTyping(false);
            setShown(i);
            run(i + 1);
          },
          isBot ? 1300 : 1100,
        ),
      );
    };
    run(Math.max(2, shown + 1));
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  return (
    <div ref={ref} className="relative mx-auto w-full max-w-[400px]">
      <div className="overflow-hidden rounded-[30px] border border-white/10 bg-[#0b141a] shadow-[0_40px_90px_-30px_rgba(0,0,0,0.9)]">
        <div className="flex items-center gap-3 bg-[#1f2c33] px-4 py-3">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-brand text-[13px] font-bold text-ink">SB</span>
          <div className="leading-tight">
            <div className="text-[14px] font-medium text-white">Sweet Bakes · example</div>
            <div className="text-[11px] text-white/55">{typing ? "typing…" : "Business account · online"}</div>
          </div>
          <WhatsAppIcon className="ml-auto h-5 w-5 text-wa" />
        </div>

        <div
          className="flex h-[440px] flex-col justify-end gap-2 overflow-hidden px-3 py-4"
          style={{
            backgroundColor: "#0b141a",
            backgroundImage: "radial-gradient(rgba(255,255,255,0.035) 1px, transparent 1px)",
            backgroundSize: "18px 18px",
          }}
        >
          <AnimatePresence initial={false}>
            {thread.slice(0, shown).map((m, i) => (
              <motion.div
                key={`${cycle}-${i}`}
                layout
                initial={{ opacity: 0, y: 14, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className={m.from === "user" ? "self-end" : "self-start"}
              >
                <div
                  className={
                    m.from === "user"
                      ? "max-w-[260px] rounded-xl rounded-tr-sm bg-[#005c4b] px-3 py-2 text-[13px] text-white"
                      : "max-w-[290px] rounded-xl rounded-tl-sm bg-[#1f2c33] px-3 py-2 text-[13px] text-white"
                  }
                >
                  {m.text}
                  {m.from === "bot" && m.catalogue && (
                    <div className="no-scrollbar -mx-1 mt-2 flex gap-2 overflow-x-auto pb-1">
                      {products.map((p) => (
                        <div key={p.name} className="w-[104px] shrink-0 overflow-hidden rounded-lg bg-[#2a3942]">
                          <div className={`h-[70px] bg-gradient-to-br ${p.hue}`} />
                          <div className="p-1.5">
                            <div className="truncate text-[11px]">{p.name}</div>
                            <div className="text-[11px] font-semibold text-brand">{p.price}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {m.from === "bot" && m.pay && (
                    <div className="mt-2 rounded-lg bg-[#2a3942] py-2 text-center text-[12.5px] font-medium text-[#53bdeb]">
                      Pay ₹1,250 with UPI
                    </div>
                  )}
                  <span className="float-right ml-2 mt-1 flex items-center gap-0.5 text-[10px] text-white/45">
                    {m.from === "user" ? <CheckCheck className="h-3 w-3 text-[#53bdeb]" /> : <Check className="h-3 w-3" />}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {typing && (
            <div className="flex w-fit items-center gap-1 self-start rounded-xl rounded-tl-sm bg-[#1f2c33] px-3 py-3">
              {[0, 1, 2].map((d) => (
                <span
                  key={d}
                  className="h-1.5 w-1.5 rounded-full bg-white/60"
                  style={{ animation: `caret 1s ${d * 0.2}s infinite` }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const features = [
  { icon: Store, title: "Website stores", text: "Fast storefronts with UPI and card checkout." },
  { icon: WhatsAppIcon, title: "WhatsApp stores", text: "Catalogue, cart and payment inside the chat." },
  { icon: Undo2, title: "Cart recovery", text: "Automatic nudges bring abandoned carts back." },
  { icon: Truck, title: "Order updates", text: "Confirmations and delivery alerts on WhatsApp & SMS." },
];

export default function Commerce() {
  return (
    <section id="commerce" data-section="E-commerce" className="relative isolate overflow-hidden py-28 sm:py-36">
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div className="absolute left-[10%] top-[20%] h-[420px] w-[420px] rounded-full glow [--glow-color:rgb(37_211_102/0.07)]" />
        <div className="absolute right-[5%] bottom-[10%] h-[420px] w-[420px] rounded-full glow [--glow-color:rgb(242_194_27/0.08)]" />
      </div>

      <div className="container-x grid items-center gap-16 lg:grid-cols-2">
        <div className="relative order-2 lg:order-1">
          <WhatsAppDemo />
          <Parallax speed={-0.9} className="pointer-events-none absolute -left-2 top-10 hidden sm:block lg:-left-10">
            <div className="glass flex items-center gap-2 rounded-2xl px-3.5 py-2.5 text-[12.5px]">
              <ShoppingCart className="h-4 w-4 text-brand" /> Cart recovered · ₹980
            </div>
          </Parallax>
          <Parallax speed={0.7} className="pointer-events-none absolute -right-2 bottom-16 hidden sm:block lg:-right-8">
            <div className="glass flex items-center gap-2 rounded-2xl px-3.5 py-2.5 text-[12.5px]">
              <span className="h-2 w-2 rounded-full bg-wa" /> Order #1042 · paid via UPI
            </div>
          </Parallax>
        </div>

        <div className="order-1 lg:order-2">
          <TextMask
            className="display text-[clamp(38px,5.6vw,76px)]"
            lines={[
              "Sell where your",
              <>
                customers chat.
              </>,
            ]}
          />
          <p className="mt-6 max-w-[480px] text-[17px] leading-relaxed text-muted">
            We build online stores on your website and inside WhatsApp — catalogue, cart, payment and delivery updates,
            all automated end to end.
          </p>
          <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.08] sm:grid-cols-2">
            {features.map((f) => (
              <div key={f.title} className="group bg-ink p-5 transition-colors duration-500 hover:bg-ink-3">
                <f.icon className="h-5 w-5 text-brand transition-transform duration-500 group-hover:-translate-y-0.5" />
                <div className="mt-4 text-[15.5px] font-semibold tracking-tight">{f.title}</div>
                <p className="mt-1 text-[13.5px] leading-snug text-muted">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
