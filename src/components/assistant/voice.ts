"use client";

/**
 * Ira's voice in the browser.
 * Each sentence is sent to /api/tts as soon as it's complete; audio streams back as
 * 16-bit PCM and is scheduled gaplessly with the Web Audio API, in sentence order.
 * Call unlock() inside a click/keypress so browsers allow sound.
 */
const RATE = 24000;

type Job = {
  chunks: Float32Array[];
  done: boolean;
  notify: (() => void) | null;
  ctrl: AbortController;
};

export class IraVoice {
  private ctx: AudioContext | null = null;
  private jobs: Job[] = [];
  private running = false;
  private nextTime = 0;
  private sources = new Set<AudioBufferSourceNode>();
  private generation = 0;
  private speaking = false;

  constructor(private onSpeaking: (on: boolean) => void) {}

  unlock() {
    if (typeof window === "undefined") return;
    if (!this.ctx) {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return;
      this.ctx = new Ctx();
    }
    if (this.ctx.state === "suspended") this.ctx.resume().catch(() => {});
  }

  /** Queue one sentence. Fetching starts immediately; playback keeps order. */
  say(text: string) {
    const clean = prepareForSpeech(text);
    if (!clean || !this.ctx) return;
    const job: Job = { chunks: [], done: false, notify: null, ctrl: new AbortController() };
    this.jobs.push(job);
    this.fetchJob(job, clean);
    if (!this.running) this.play(this.generation);
  }

  stop() {
    this.generation++;
    this.jobs.forEach((j) => j.ctrl.abort());
    this.jobs = [];
    this.sources.forEach((s) => {
      try {
        s.stop();
      } catch {}
    });
    this.sources.clear();
    this.nextTime = 0;
    this.running = false;
    this.setSpeaking(false);
  }

  private setSpeaking(on: boolean) {
    if (on === this.speaking) return;
    this.speaking = on;
    this.onSpeaking(on);
  }

  private async fetchJob(job: Job, text: string) {
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
        signal: job.ctrl.signal,
      });
      if (!res.ok || !res.body) throw new Error(`tts ${res.status}`);
      const reader = res.body.getReader();
      let carry: number | null = null; // odd byte split across network chunks
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        let bytes = value;
        if (carry !== null) {
          const merged = new Uint8Array(bytes.length + 1);
          merged[0] = carry;
          merged.set(bytes, 1);
          bytes = merged;
          carry = null;
        }
        if (bytes.length % 2) {
          carry = bytes[bytes.length - 1];
          bytes = bytes.subarray(0, bytes.length - 1);
        }
        const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
        const f = new Float32Array(bytes.length / 2);
        for (let i = 0; i < f.length; i++) f[i] = view.getInt16(i * 2, true) / 32768;
        if (f.length) job.chunks.push(f);
        job.notify?.();
      }
    } catch (err) {
      if ((err as Error)?.name !== "AbortError") console.warn("[ira] voice failed:", err);
    } finally {
      job.done = true;
      job.notify?.();
    }
  }

  private async play(gen: number) {
    this.running = true;
    while (gen === this.generation && this.jobs.length) {
      const job = this.jobs[0];
      let i = 0;
      while (gen === this.generation) {
        if (i < job.chunks.length) {
          this.schedule(job.chunks[i++]);
          continue;
        }
        if (job.done) break;
        await new Promise<void>((r) => (job.notify = r));
        job.notify = null;
      }
      if (gen !== this.generation) return;
      this.jobs.shift();
    }
    this.running = false;
  }

  private schedule(data: Float32Array) {
    const ctx = this.ctx!;
    const buf = ctx.createBuffer(1, data.length, RATE);
    buf.copyToChannel(data as Float32Array<ArrayBuffer>, 0);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(ctx.destination);
    const at = Math.max(this.nextTime, ctx.currentTime + 0.04);
    src.start(at);
    this.nextTime = at + buf.duration;
    this.sources.add(src);
    this.setSpeaking(true);
    src.onended = () => {
      this.sources.delete(src);
      if (!this.sources.size && !this.running && !this.jobs.length) this.setSpeaking(false);
      else if (!this.sources.size && this.running) {
        // brief gap while the next sentence streams in — keep "speaking" unless it stays silent
        setTimeout(() => {
          if (!this.sources.size && !this.jobs.length) this.setSpeaking(false);
        }, 400);
      }
    };
  }
}

/** Make text pleasant to hear: brand names, emojis, links, markdown. */
export function prepareForSpeech(text: string) {
  return text
    .replace(/https?:\/\/\S+/g, "")
    .replace(/\p{Extended_Pictographic}|️/gu, "")
    .replace(/[*_#`>]/g, "")
    .replace(/Leadsndeals/gi, "Leads n Deals")
    .replace(/\bn8n\b/gi, "n eight n")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Splits streaming text into speakable chunks: complete sentences, merged so
 * each request is at least ~40 characters (fewer, more natural-sounding requests).
 */
export class SentenceFeeder {
  private sent = 0;
  constructor(private emit: (sentence: string) => void) {}

  push(full: string) {
    const pending = full.slice(this.sent);
    const re = /[.!?।]+["')\]]*(\s+)|\n+/g;
    let cut = -1;
    let m: RegExpExecArray | null;
    while ((m = re.exec(pending))) {
      const end = m.index + m[0].length;
      if (end >= 40 || /\n/.test(m[0])) cut = end; // keep the latest boundary past the minimum
    }
    if (cut > 0) {
      this.emit(pending.slice(0, cut));
      this.sent += cut;
    }
  }

  flush(full: string) {
    const rest = full.slice(this.sent);
    if (rest.trim()) this.emit(rest);
    this.sent = full.length;
  }
}
