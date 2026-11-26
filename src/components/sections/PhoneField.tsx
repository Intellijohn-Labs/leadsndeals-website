"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Search } from "lucide-react";

/** Country dialling codes: India first, then the Gulf (large Malayali diaspora), then the rest A–Z. */
const COUNTRIES: { iso: string; name: string; code: string }[] = [
  { iso: "in", name: "India", code: "91" },
  { iso: "ae", name: "United Arab Emirates", code: "971" },
  { iso: "sa", name: "Saudi Arabia", code: "966" },
  { iso: "qa", name: "Qatar", code: "974" },
  { iso: "om", name: "Oman", code: "968" },
  { iso: "kw", name: "Kuwait", code: "965" },
  { iso: "bh", name: "Bahrain", code: "973" },
  { iso: "au", name: "Australia", code: "61" },
  { iso: "bd", name: "Bangladesh", code: "880" },
  { iso: "ca", name: "Canada", code: "1" },
  { iso: "fr", name: "France", code: "33" },
  { iso: "de", name: "Germany", code: "49" },
  { iso: "hk", name: "Hong Kong", code: "852" },
  { iso: "id", name: "Indonesia", code: "62" },
  { iso: "ie", name: "Ireland", code: "353" },
  { iso: "il", name: "Israel", code: "972" },
  { iso: "it", name: "Italy", code: "39" },
  { iso: "jp", name: "Japan", code: "81" },
  { iso: "ke", name: "Kenya", code: "254" },
  { iso: "my", name: "Malaysia", code: "60" },
  { iso: "mv", name: "Maldives", code: "960" },
  { iso: "np", name: "Nepal", code: "977" },
  { iso: "nl", name: "Netherlands", code: "31" },
  { iso: "nz", name: "New Zealand", code: "64" },
  { iso: "ng", name: "Nigeria", code: "234" },
  { iso: "ph", name: "Philippines", code: "63" },
  { iso: "sg", name: "Singapore", code: "65" },
  { iso: "za", name: "South Africa", code: "27" },
  { iso: "es", name: "Spain", code: "34" },
  { iso: "lk", name: "Sri Lanka", code: "94" },
  { iso: "ch", name: "Switzerland", code: "41" },
  { iso: "th", name: "Thailand", code: "66" },
  { iso: "gb", name: "United Kingdom", code: "44" },
  { iso: "us", name: "United States", code: "1" },
];

function Flag({ iso }: { iso: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://flagcdn.com/w40/${iso}.png`}
      srcSet={`https://flagcdn.com/w80/${iso}.png 2x`}
      alt=""
      width={22}
      height={16}
      loading="lazy"
      className="h-[16px] w-[22px] shrink-0 rounded-[3px] object-cover shadow-[0_0_0_1px_rgba(0,0,0,0.08)]"
    />
  );
}

/**
 * WhatsApp/phone input with a country-code picker (flag + dial code, searchable).
 * Submits the full international number in a hidden input named `name` (e.g. "+971 501234567").
 */
export default function PhoneField({ name, inputClass }: { name: string; inputClass: string }) {
  const [country, setCountry] = useState(COUNTRIES[0]);
  const [local, setLocal] = useState("");
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const boxRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // close on outside click / Esc
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !boxRef.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    setTimeout(() => searchRef.current?.focus(), 30);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase().replace(/^\+/, "");
    if (!s) return COUNTRIES;
    return COUNTRIES.filter((c) => c.name.toLowerCase().includes(s) || c.code.startsWith(s) || c.iso === s);
  }, [q]);

  const digits = local.replace(/\D/g, "");
  const full = digits ? `+${country.code} ${digits}` : "";

  return (
    <div ref={boxRef} className="relative">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={`Country code: ${country.name} +${country.code}`}
          className="flex shrink-0 items-center gap-2 rounded-xl border border-black/10 bg-white px-3 text-[15px] text-paper-ink transition-colors hover:border-black/25 focus:border-paper-ink focus:outline-none"
        >
          <Flag iso={country.iso} />
          <span className="tabular-nums">+{country.code}</span>
          <ChevronDown className={`h-4 w-4 text-paper-ink/50 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        <input
          type="tel"
          inputMode="tel"
          required
          maxLength={16}
          autoComplete="tel-national"
          placeholder={country.code === "91" ? "98765 43210" : "Phone number"}
          value={local}
          onChange={(e) => setLocal(e.target.value.replace(/[^\d\s-]/g, ""))}
          className={`${inputClass} min-w-0 flex-1`}
          aria-label="WhatsApp or phone number"
        />
      </div>
      {/* what the form actually submits: the full international number */}
      <input type="hidden" name={name} value={full} />

      {open && (
        <div
          className="absolute left-0 top-[calc(100%+6px)] z-30 w-[min(320px,calc(100vw-48px))] overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_20px_50px_-15px_rgba(0,0,0,0.35)]"
          data-lenis-prevent
        >
          <div className="flex items-center gap-2 border-b border-black/[0.06] px-3 py-2.5">
            <Search className="h-4 w-4 text-paper-ink/40" />
            <input
              ref={searchRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search country or code"
              className="w-full bg-transparent text-[14px] text-paper-ink outline-none placeholder:text-paper-ink/40"
            />
          </div>
          <ul role="listbox" className="max-h-[260px] overflow-y-auto py-1">
            {list.map((c) => (
              <li key={c.iso}>
                <button
                  type="button"
                  role="option"
                  aria-selected={c.iso === country.iso}
                  onClick={() => {
                    setCountry(c);
                    setOpen(false);
                    setQ("");
                  }}
                  className={`flex w-full items-center gap-3 px-3 py-2 text-left text-[14px] text-paper-ink hover:bg-black/[0.04] ${
                    c.iso === country.iso ? "bg-brand/15" : ""
                  }`}
                >
                  <Flag iso={c.iso} />
                  <span className="flex-1 truncate">{c.name}</span>
                  <span className="tabular-nums text-paper-ink/55">+{c.code}</span>
                </button>
              </li>
            ))}
            {!list.length && <li className="px-3 py-3 text-[13px] text-paper-ink/50">No match</li>}
          </ul>
        </div>
      )}
    </div>
  );
}
