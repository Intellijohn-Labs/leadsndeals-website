"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUp, Mic, ScanText, Square, X } from "lucide-react";
import { assistant, whatsappLink } from "@/config/site";
import { useApp } from "@/components/providers/Providers";
import { cn } from "@/lib/utils";
import Avatar from "./Avatar";
import Presenter from "./Presenter";
import { useDictation } from "./dictation";

type Msg = { role: "user" | "assistant"; content: string };
type Mode = "hidden" | "card" | "bubble" | "open";

const ease = [0.16, 1, 0.3, 1] as const;
const STORE = "lnd-assistant";
const isPhone = () => window.matchMedia("(max-width: 639px)").matches;

function loadSaved(): { messages?: Msg[] } {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(sessionStorage.getItem(STORE) || "{}") ?? {};
  } catch {
    return {};
  }
}

function useCurrentSection() {
  const [section, setSection] = useState("Hero");
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-section]"));
    const io = new IntersectionObserver(
      (entries) => {
        const best = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (best) setSection((best.target as HTMLElement).dataset.section!);
      },
      { threshold: [0.2, 0.4, 0.6] },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return section;
}

export default function AssistantWidget() {
  const { introDone } = useApp();
  const [mode, setMode] = useState<Mode>("hidden");
  const dismissedRef = useRef(false);
  // Widget renders nothing until mode changes, so reading storage here can't cause a hydration mismatch.
  const [messages, setMessages] = useState<Msg[]>(() => loadSaved().messages ?? []);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  // Ira's spoken replies (Gemini TTS) — on by default, remembered if the visitor mutes her.
  const [toast, setToast] = useState("");
  const [greet, setGreet] = useState(false);
  const section = useCurrentSection();
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesRef = useRef<Msg[]>([]);
  messagesRef.current = messages;

  // restore + first appearance
  useEffect(() => {
    if (!introDone) return;
    // Phones get the compact bubble: the presenter card would cover too much of the screen.
    const compact = isPhone();
    const t = setTimeout(
      // Always start as the small bubble: the big presenter card covered page content.
      () => setMode((m) => (m === "hidden" ? "bubble" : m)),
      compact ? 900 : 2200,
    );
    return () => clearTimeout(t);
  }, [introDone]);

  const persist = useCallback((patch: Record<string, unknown>) => {
    try {
      const prev = JSON.parse(sessionStorage.getItem(STORE) || "{}");
      sessionStorage.setItem(STORE, JSON.stringify({ ...prev, ...patch }));
    } catch {}
  }, []);

  useEffect(() => {
    persist({ messages: messages.slice(-30) });
  }, [messages, persist]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  const send = useCallback(
    async (text: string) => {
      const content = text.trim();
      if (!content || busy) return;
      setInput("");
      const history: Msg[] = [...messagesRef.current, { role: "user", content }];
      setMessages([...history, { role: "assistant", content: "" }]);
      setBusy(true);
      let reply = "";
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history }),
        });
        if (!res.ok || !res.body) {
          const wa = whatsappLink();
          reply =
            res.status === 429
              ? "You're sending messages quickly — give me a moment and try again."
              : `I'm not connected right now. Please use the demo form at the bottom of the page${wa ? " or message us on WhatsApp" : ""} and our team will help you.`;
        } else {
          const reader = res.body.getReader();
          const dec = new TextDecoder();
          for (;;) {
            const { value, done } = await reader.read();
            if (done) break;
            reply += dec.decode(value, { stream: true });
            setMessages([...history, { role: "assistant", content: reply }]);
          }
        }
      } catch {
        reply = "Sorry — something went wrong. Please try again, or use the demo form below.";
      }
      setMessages([...history, { role: "assistant", content: reply.trim() }]);
      setBusy(false);
    },
    [busy],
  );

  // Voice input → text (browser speech recognition: free, no server call). The words
  // fill the box as they're heard and the question is sent when the visitor stops.
  const dictation = useDictation({
    onText: setInput,
    onDone: (text) => send(text),
    onError: setToast,
  });

  const open = useCallback(
    (prompt?: string) => {
      setMode("open");
      setGreet(true);
      if (prompt) setTimeout(() => send(prompt), 350);
      else setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 400);
    },
    [send],
  );

  useEffect(() => {
    const on = (e: Event) => open((e as CustomEvent<{ prompt?: string }>).detail?.prompt);
    window.addEventListener("lnd:assistant", on);
    return () => window.removeEventListener("lnd:assistant", on);
  }, [open]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  // X hides the card for this page view only — a reload brings Ira back.
  const dismissCard = () => {
    dismissedRef.current = true;
    setMode("bubble");
  };

  return (
    <div className="fixed bottom-4 right-4 z-[60] sm:bottom-6 sm:right-6">
      {/* "wait": the old Ira (card) is gone before the new one (panel) appears — never two at once */}
      <AnimatePresence mode="wait">
        {mode === "card" && (
          <motion.div
            key="card"
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.18 } }}
            transition={{ duration: 0.8, ease }}
            className="relative w-[200px] sm:w-[228px]"
          >
            <button
              onClick={() => open()}
              aria-label={`Talk to ${assistant.name}`}
              className="group relative block h-[280px] w-full overflow-hidden rounded-[30px] bg-gradient-to-b from-[#f4f4f7] to-[#ececf1] text-left shadow-[0_30px_80px_-20px_rgba(0,0,0,0.85)] ring-1 ring-white/40 sm:h-[318px]"
            >
              {/* soft aura behind the presenter */}
              <span aria-hidden="true" className="absolute -left-10 top-10 h-48 w-40 rounded-full bg-[#7b61ff]/45 blur-[46px]" />
              <span aria-hidden="true" className="absolute -right-12 top-28 h-48 w-40 rounded-full bg-[#ff7ab6]/35 blur-[46px]" />
              <span aria-hidden="true" className="absolute left-1/2 top-16 h-40 w-40 -translate-x-1/2 rounded-full bg-white/70 blur-[40px]" />

              <span className="absolute inset-x-0 bottom-0 top-3 transition-transform duration-700 ease-[var(--ease-expo)] group-hover:scale-[1.03]">
                <Presenter fit="stand" />
              </span>

              {/* bottom mist so the pill sits on a clean base */}
              <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#ececf1] via-[#ececf1]/80 to-transparent" />

              <span className="absolute inset-x-0 bottom-5 flex justify-center">
                <span className="relative rounded-full bg-[linear-gradient(100deg,#2fd4a6,#5b8cff_55%,#7b61ff)] p-[2px] shadow-[0_10px_30px_-8px_rgba(0,0,0,0.6)]">
                  <span className="pulse-ring" data-always="true" />
                  <span className="block rounded-full bg-[#0d0d10] px-7 py-3 text-[15px] font-semibold tracking-tight text-white transition-colors group-hover:bg-black">
                    Talk to me
                  </span>
                </span>
              </span>
            </button>
            <button
              onClick={dismissCard}
              aria-label="Hide assistant"
              className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-[#8e8e93]/70 text-white backdrop-blur transition-colors hover:bg-[#6e6e73]"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}

        {mode === "bubble" && (
          <motion.button
            key="bubble"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.5, ease }}
            onClick={() => open()}
            className="group glass relative flex items-center gap-2.5 rounded-full py-1.5 pl-1.5 pr-4 shadow-2xl"
            aria-label={`Chat with ${assistant.name}`}
          >
            <Avatar size={42} />
            <span className="text-[14px] font-medium text-fg">Chat with {assistant.name}</span>
          </motion.button>
        )}

        {mode === "open" && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.96 }}
            transition={{ duration: 0.55, ease }}
            role="dialog"
            aria-label={`${assistant.name}, ${assistant.role}`}
            className="fixed inset-x-2 bottom-2 top-16 flex origin-bottom-right flex-col overflow-hidden rounded-[26px] border border-white/10 bg-[#0d0d10]/95 shadow-[0_40px_120px_-20px_rgba(0,0,0,0.9)] backdrop-blur-2xl sm:absolute sm:inset-auto sm:bottom-0 sm:right-0 sm:h-[min(640px,calc(100svh-110px))] sm:w-[400px]"
          >
            {/* header with presenter strip */}
            <div className="relative h-[118px] shrink-0 overflow-hidden border-b border-white/[0.07]">
              <div className="absolute inset-y-0 right-0 w-[150px] opacity-90">
                <Presenter fit="cover" greet={greet} />
              </div>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#0d0d10] via-[#0d0d10]/85 to-transparent" />
              <div className="pointer-events-none relative flex h-full flex-col justify-center px-5">
                <div className="text-[19px] font-semibold tracking-tight text-fg">Hi, I&apos;m {assistant.name}</div>
                <div className="mt-1 flex items-center gap-1.5 text-[12px] text-muted">
                  <span className="h-1.5 w-1.5 rounded-full bg-wa" /> Online · {assistant.role}
                </div>
              </div>
              <div className="absolute right-3 top-3 flex gap-1.5">
                <button
                  onClick={() => {
                    dictation.stop();
                    setMode("bubble");
                    setGreet(false);
                  }}
                  aria-label="Close chat"
                  className="grid h-8 w-8 place-items-center rounded-full bg-black/50 text-fg/80 hover:text-fg"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* messages */}
            <div ref={listRef} data-lenis-prevent className="flex-1 space-y-3 overflow-y-auto px-4 py-5">
              <Bubble role="assistant" text={assistant.greeting} />
              {messages.length === 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {assistant.suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="rounded-full border border-white/12 px-3.5 py-2 text-[13px] text-fg/85 transition-colors hover:border-brand hover:text-fg"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
              {messages.map((m, i) => (
                <Bubble key={i} role={m.role} text={m.content} pending={busy && i === messages.length - 1 && !m.content} />
              ))}
            </div>

            {/* composer */}
            <div className="shrink-0 border-t border-white/[0.07] p-3">
              <button
                onClick={() => send(`Explain the "${section}" section of this page.`)}
                disabled={busy}
                className="mb-2.5 flex w-full items-center gap-2 rounded-xl bg-white/[0.04] px-3 py-2 text-left text-[13px] text-fg/85 transition-colors hover:bg-white/[0.08] disabled:opacity-50"
              >
                <ScanText className="h-4 w-4 text-brand" />
                Explain this section
                <span className="ml-auto truncate font-mono text-[10.5px] uppercase tracking-wider text-dim">{section}</span>
              </button>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  send(input);
                }}
                data-composer
                className={`group/composer relative flex items-center gap-1.5 rounded-2xl bg-gradient-to-b from-white/[0.07] to-white/[0.03] py-1.5 pl-4 pr-1.5 ring-1 transition-[box-shadow,background-color] duration-300 ${
                  dictation.listening
                    ? "ring-brand/60 shadow-[0_0_0_4px_rgba(242,194,27,0.10)]"
                    : "ring-white/10 focus-within:ring-brand/50 focus-within:shadow-[0_0_0_4px_rgba(242,194,27,0.08)] hover:ring-white/20"
                }`}
              >
                {dictation.listening && !input && (
                  <span aria-hidden="true" className="pointer-events-none absolute left-4 flex h-4 items-center gap-[3px]">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <span
                        key={i}
                        className="h-full w-[3px] origin-center rounded-full bg-brand"
                        style={{ animation: `mic-bar 0.9s ease-in-out ${i * 0.12}s infinite` }}
                      />
                    ))}
                  </span>
                )}
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  maxLength={1000}
                  placeholder={dictation.listening ? "" : dictation.transcribing ? "Writing down what you said…" : `Message ${assistant.name}…`}
                  className={`h-10 min-w-0 flex-1 bg-transparent text-[15px] text-fg outline-none placeholder:text-fg/40 ${
                    dictation.listening && !input ? "pl-9" : ""
                  }`}
                />
                {dictation.listening && !input && (
                  <span className="pointer-events-none absolute left-[3.25rem] text-[14px] text-fg/60">Listening…</span>
                )}
                {dictation.supported && (
                  <button
                    type="button"
                    onClick={() => dictation.setLang(dictation.lang === "ml-IN" ? "en-IN" : "ml-IN")}
                    disabled={dictation.listening || dictation.transcribing}
                    aria-label={dictation.lang === "ml-IN" ? "Voice language: Malayalam. Switch to English" : "Voice language: English. Switch to Malayalam"}
                    title={dictation.lang === "ml-IN" ? "Speaking Malayalam (tap for English)" : "Speaking English (tap for Malayalam)"}
                    className="h-7 shrink-0 rounded-lg border border-white/10 px-2 text-[12px] font-semibold text-fg/70 transition-colors hover:border-white/25 hover:text-fg disabled:opacity-40"
                  >
                    {dictation.lang === "ml-IN" ? "മല" : "EN"}
                  </button>
                )}
                {dictation.supported && (
                  <button
                    type="button"
                    onClick={() => (dictation.listening ? dictation.stop() : dictation.start())}
                    disabled={busy || dictation.transcribing}
                    aria-label={dictation.listening ? "Stop voice input" : "Speak your question"}
                    title={dictation.listening ? "Stop" : "Speak your question"}
                    className={`relative grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-colors disabled:opacity-40 ${
                      dictation.listening
                        ? "bg-brand/15 text-brand"
                        : "text-fg/55 hover:bg-white/[0.07] hover:text-fg"
                    }`}
                  >
                    {dictation.listening && <span className="absolute inset-0 animate-ping rounded-xl bg-brand/20" />}
                    {dictation.listening ? <Square className="h-3.5 w-3.5 fill-current" /> : <Mic className="h-[18px] w-[18px]" />}
                  </button>
                )}
                <button
                  type="submit"
                  disabled={!input.trim() || busy}
                  aria-label="Send"
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand text-ink shadow-[0_6px_20px_-6px_rgba(242,194,27,0.7)] transition-all hover:brightness-110 active:scale-95 disabled:bg-white/[0.06] disabled:text-fg/30 disabled:shadow-none"
                >
                  <ArrowUp className="h-[18px] w-[18px]" strokeWidth={2.5} />
                </button>
              </form>
              <p className="mt-2 text-center text-[11px] text-dim">AI can make mistakes. Please don&apos;t share sensitive details.</p>
            </div>

            <AnimatePresence>
              {toast && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute inset-x-6 bottom-[124px] rounded-xl bg-fg px-4 py-2.5 text-center text-[13px] font-medium text-ink shadow-xl"
                >
                  {toast}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Bubble({ role, text, pending }: { role: "user" | "assistant"; text: string; pending?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease }}
      className={cn("flex gap-2", role === "user" && "justify-end")}
    >
      {role === "assistant" && <Avatar size={26} className="mt-0.5" speaking={pending} />}
      <div
        className={cn(
          "max-w-[82%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-[14px] leading-relaxed",
          role === "user" ? "rounded-br-md bg-brand text-ink" : "rounded-tl-md bg-white/[0.06] text-fg/90",
        )}
      >
        {pending ? (
          <span className="flex gap-1 py-1">
            {[0, 1, 2].map((d) => (
              <span key={d} className="h-1.5 w-1.5 rounded-full bg-fg/60" style={{ animation: `caret 1s ${d * 0.2}s infinite` }} />
            ))}
          </span>
        ) : (
          text
        )}
      </div>
    </motion.div>
  );
}
