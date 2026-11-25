"use client";

import { useEffect, useMemo, useState } from "react";

/** Demo slots: Mon–Sat, 10:00 AM – 5:00 PM IST, 30-minute calls (last one starts 4:30). */
const DAYS_AHEAD = 7;
const OPEN = 10 * 60;
const CLOSE = 17 * 60;
const STEP = 30;
const LEAD_MIN = 60; // earliest slot today = at least an hour from now

type Day = { iso: string; dow: string; date: string; month: string; today: boolean };

function istNow() {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(new Date())
      .map((x) => [x.type, x.value]),
  );
  return { y: +p.year, m: +p.month, d: +p.day, minutes: +p.hour * 60 + +p.minute };
}

function buildDays(): Day[] {
  const now = istNow();
  const days: Day[] = [];
  for (let i = 0; days.length < DAYS_AHEAD && i < 14; i++) {
    const dt = new Date(Date.UTC(now.y, now.m - 1, now.d + i));
    if (dt.getUTCDay() === 0) continue; // Sunday off
    if (i === 0 && now.minutes + LEAD_MIN > CLOSE - STEP) continue; // nothing left today
    const f = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-IN", { timeZone: "UTC", ...o }).format(dt);
    days.push({
      iso: dt.toISOString().slice(0, 10),
      dow: i === 0 ? "Today" : i === 1 ? "Tomorrow" : f({ weekday: "short" }),
      date: f({ day: "numeric" }),
      month: f({ month: "short" }),
      today: i === 0,
    });
  }
  return days;
}

const fmt = (m: number) => {
  const h = Math.floor(m / 60);
  return `${((h + 11) % 12) + 1}:${String(m % 60).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
};
const hhmm = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

export type Slot = { date: string; time: string; label: string };

export default function SlotPicker({ value, onChange }: { value: Slot | null; onChange: (s: Slot | null) => void }) {
  const [days, setDays] = useState<Day[]>([]);
  const [day, setDay] = useState<string>("");

  // Built on the client so the dates follow the visitor's "now" (no SSR mismatch).
  useEffect(() => {
    const d = buildDays();
    setDays(d);
    setDay(d[0]?.iso ?? "");
  }, []);

  const current = days.find((d) => d.iso === day);
  const times = useMemo(() => {
    const out: number[] = [];
    const min = current?.today ? istNow().minutes + LEAD_MIN : 0;
    for (let m = OPEN; m < CLOSE; m += STEP) if (m >= min) out.push(m);
    return out;
  }, [current]);

  const pick = (m: number) => {
    if (!current) return;
    onChange({
      date: current.iso,
      time: hhmm(m),
      label: `${current.today ? "Today" : current.dow}, ${current.date} ${current.month} · ${fmt(m)} IST`,
    });
  };

  if (!days.length) return <div className="h-[168px] animate-pulse rounded-2xl bg-ink/[0.04]" />;

  return (
    <div className="min-w-0 rounded-2xl border border-ink/10 bg-white/60 p-3 sm:p-4">
      <div data-lenis-prevent className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
        {days.map((d) => {
          const on = d.iso === day;
          return (
            <button
              key={d.iso}
              type="button"
              onClick={() => {
                setDay(d.iso);
                if (value?.date !== d.iso) onChange(null);
              }}
              aria-pressed={on}
              className={`flex min-w-[64px] shrink-0 flex-col items-center rounded-xl border px-3 py-2 transition-colors ${
                on ? "border-ink bg-ink text-paper" : "border-ink/10 bg-white text-ink hover:border-ink/30"
              }`}
            >
              <span className={`text-[11px] font-medium uppercase tracking-wide ${on ? "text-paper/70" : "text-paper-muted"}`}>{d.dow}</span>
              <span className="text-[18px] font-semibold leading-tight">{d.date}</span>
              <span className={`text-[11px] ${on ? "text-paper/70" : "text-paper-muted"}`}>{d.month}</span>
            </button>
          );
        })}
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
        {times.map((m) => {
          const on = value?.date === day && value.time === hhmm(m);
          return (
            <button
              key={m}
              type="button"
              onClick={() => pick(m)}
              aria-pressed={on}
              className={`rounded-lg border py-2 text-[13.5px] font-medium tabular-nums transition-colors ${
                on ? "border-brand bg-brand text-ink" : "border-ink/10 bg-white text-ink hover:border-ink/30"
              }`}
            >
              {fmt(m)}
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-[12px] text-paper-muted">
        {value ? <>Selected: <b className="text-ink">{value.label}</b></> : "30-minute call · Mon–Sat, 10 AM – 5 PM IST"}
      </p>
    </div>
  );
}
