"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Minimal typings for the Web Speech API (not in TS's DOM lib everywhere).
type Recognition = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  onresult: ((e: { resultIndex: number; results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

function getCtor(): (new () => Recognition) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

const ERRORS: Record<string, string> = {
  "not-allowed": "Allow microphone access to speak to Ira.",
  "service-not-allowed": "Allow microphone access to speak to Ira.",
  "no-speech": "I didn't catch that. Tap the mic and try again.",
  "audio-capture": "No microphone found.",
  network: "Voice input needs an internet connection.",
};

/** Speech → text in the browser (free; no server call). */
export function useDictation(opts: { onText: (t: string) => void; onDone: (t: string) => void; onError: (msg: string) => void }) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  // Speech recognition only understands the language it's told to expect, so Malayalam needs ml-IN.
  const [lang, setLangState] = useState<"en-IN" | "ml-IN">("en-IN");
  useEffect(() => {
    try {
      if (localStorage.getItem("lnd-mic-lang") === "ml-IN") setLangState("ml-IN");
    } catch {}
  }, []);
  const setLang = useCallback((l: "en-IN" | "ml-IN") => {
    setLangState(l);
    try {
      localStorage.setItem("lnd-mic-lang", l);
    } catch {}
  }, []);
  const langRef = useRef(lang);
  langRef.current = lang;
  const recRef = useRef<Recognition | null>(null);
  const textRef = useRef("");
  const optsRef = useRef(opts);
  optsRef.current = opts;

  useEffect(() => setSupported(!!getCtor()), []);
  useEffect(() => () => recRef.current?.abort(), []);

  const start = useCallback(() => {
    const Ctor = getCtor();
    if (!Ctor || recRef.current) return;
    const rec = new Ctor();
    rec.lang = langRef.current;
    rec.interimResults = true;
    rec.continuous = false;
    rec.maxAlternatives = 1;
    textRef.current = "";
    rec.onresult = (e) => {
      let text = "";
      for (let i = 0; i < e.results.length; i++) text += e.results[i][0].transcript;
      textRef.current = text;
      optsRef.current.onText(text);
    };
    rec.onerror = (e) => {
      if (e.error !== "aborted") optsRef.current.onError(ERRORS[e.error] ?? "Voice input stopped. Please try again.");
    };
    rec.onend = () => {
      recRef.current = null;
      setListening(false);
      const text = textRef.current.trim();
      if (text) optsRef.current.onDone(text);
    };
    recRef.current = rec;
    optsRef.current.onText("");
    try {
      rec.start();
      setListening(true);
    } catch {
      recRef.current = null;
    }
  }, []);

  const stop = useCallback(() => recRef.current?.stop(), []);

  return { supported, listening, start, stop, lang, setLang };
}
