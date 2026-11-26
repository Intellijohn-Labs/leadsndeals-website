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

type Lang = "en-IN" | "ml-IN";

function getCtor(): (new () => Recognition) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}
const canRecord = () =>
  typeof window !== "undefined" && typeof MediaRecorder !== "undefined" && !!navigator.mediaDevices?.getUserMedia;

const ERRORS: Record<string, string> = {
  "not-allowed": "Allow microphone access to use voice input.",
  "service-not-allowed": "Allow microphone access to use voice input.",
  NotAllowedError: "Allow microphone access to use voice input.",
  "no-speech": "I didn't catch that. Tap the mic and try again.",
  "audio-capture": "No microphone found.",
  NotFoundError: "No microphone found.",
  network: "Voice input needs an internet connection.",
};

/**
 * Voice → text.
 * English: the browser's own speech recognition (free, live words as you talk).
 * Malayalam (or browsers without speech recognition, e.g. some phones): a short recording is
 * transcribed by Gemini on the server (/api/transcribe), which handles Malayalam and Manglish well.
 */
export function useDictation(opts: { onText: (t: string) => void; onDone: (t: string) => void; onError: (msg: string) => void }) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [lang, setLangState] = useState<Lang>("en-IN");
  const recRef = useRef<Recognition | null>(null);
  const mediaRef = useRef<{ recorder: MediaRecorder; cleanup: () => void } | null>(null);
  const textRef = useRef("");
  const optsRef = useRef(opts);
  optsRef.current = opts;
  const langRef = useRef(lang);
  langRef.current = lang;

  useEffect(() => {
    setSupported(!!getCtor() || canRecord());
    try {
      if (localStorage.getItem("lnd-mic-lang") === "ml-IN") setLangState("ml-IN");
    } catch {}
  }, []);
  useEffect(
    () => () => {
      recRef.current?.abort();
      mediaRef.current?.cleanup();
    },
    [],
  );

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem("lnd-mic-lang", l);
    } catch {}
  }, []);

  /* ---------- English: browser speech recognition ---------- */
  const startBrowser = useCallback((Ctor: new () => Recognition) => {
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

  /* ---------- Malayalam / fallback: record → Gemini ---------- */
  const startRecording = useCallback(async () => {
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
    } catch (err) {
      optsRef.current.onError(ERRORS[(err as Error).name] ?? "Couldn't start the microphone.");
      return;
    }
    const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : MediaRecorder.isTypeSupported("audio/mp4")
        ? "audio/mp4"
        : "";
    const recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
    const chunks: Blob[] = [];
    let heard = false;

    // Silence detection: stop ~1.5 s after the person stops talking (max 30 s; give up after 8 s of nothing).
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ac = new AC();
    void ac.resume();
    const analyser = ac.createAnalyser();
    analyser.fftSize = 1024;
    ac.createMediaStreamSource(stream).connect(analyser);
    const data = new Float32Array(analyser.fftSize);
    const startedAt = performance.now();
    let quietSince = performance.now();
    let raf = 0;
    const watch = () => {
      analyser.getFloatTimeDomainData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) sum += data[i] * data[i];
      const rms = Math.sqrt(sum / data.length);
      const now = performance.now();
      if (rms > 0.025) {
        heard = true;
        quietSince = now;
      }
      const elapsed = now - startedAt;
      if ((heard && now - quietSince > 1500) || elapsed > 30000 || (!heard && elapsed > 8000)) {
        if (recorder.state === "recording") recorder.stop();
        return;
      }
      raf = requestAnimationFrame(watch);
    };

    const cleanup = () => {
      cancelAnimationFrame(raf);
      stream.getTracks().forEach((t) => t.stop());
      void ac.close().catch(() => {});
      mediaRef.current = null;
    };

    recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    recorder.onstop = async () => {
      cleanup();
      setListening(false);
      if (!heard || !chunks.length) {
        optsRef.current.onError(ERRORS["no-speech"]);
        return;
      }
      const type = (recorder.mimeType || mime || "audio/webm").split(";")[0];
      const blob = new Blob(chunks, { type });
      setTranscribing(true);
      try {
        const res = await fetch(`/api/transcribe?lang=${langRef.current === "ml-IN" ? "ml" : "en"}`, {
          method: "POST",
          headers: { "Content-Type": type },
          body: blob,
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(res.status === 429 ? "rate" : "fail");
        const text = String(json.text || "").trim();
        if (!text) {
          optsRef.current.onError(ERRORS["no-speech"]);
          return;
        }
        optsRef.current.onText(text);
        optsRef.current.onDone(text);
      } catch (err) {
        optsRef.current.onError(
          (err as Error).message === "rate" ? "That's a lot of voice messages — please type for a moment." : "Couldn't understand the recording. Please try again or type.",
        );
      } finally {
        setTranscribing(false);
      }
    };

    mediaRef.current = { recorder, cleanup };
    optsRef.current.onText("");
    recorder.start();
    setListening(true);
    raf = requestAnimationFrame(watch);
  }, []);

  const start = useCallback(() => {
    if (recRef.current || mediaRef.current || transcribing) return;
    const Ctor = getCtor();
    if (langRef.current === "en-IN" && Ctor) startBrowser(Ctor);
    else if (canRecord()) void startRecording();
    else if (Ctor) startBrowser(Ctor);
  }, [startBrowser, startRecording, transcribing]);

  const stop = useCallback(() => {
    recRef.current?.stop();
    const m = mediaRef.current;
    if (m && m.recorder.state === "recording") m.recorder.stop();
  }, []);

  return { supported, listening, transcribing, start, stop, lang, setLang };
}
