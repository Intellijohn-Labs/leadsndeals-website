import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import TextMask from "@/components/motion/TextMask";

type Brand = {
  name: string;
  what: string;
  url?: string;
  domain: string;
  badge?: "Flagship" | "Coming soon";
  logo: React.ReactNode;
};

const brands: Brand[] = [
  {
    name: "WAAU",
    what: "AI WhatsApp automation: chatbots, voice-note replies, campaigns, a shared inbox and WhatsApp stores.",
    url: "https://waau.in",
    domain: "waau.in",
    badge: "Flagship",
    logo: <Image src="/brands/waau.webp" alt="WAAU" width={600} height={102} className="h-9 w-auto" />,
  },
  {
    name: "DirectSMS",
    what: "Bulk and transactional SMS: OTPs, alerts and reminders, TRAI DLT compliant, with a direct API.",
    url: "https://directsms.in",
    domain: "directsms.in",
    logo: <Image src="/brands/directsms.webp" alt="DirectSMS" width={700} height={81} className="h-7 w-auto" />,
  },
  {
    name: "CallCall.in",
    what: "Automated voice calls that speak to your customers: reminders, confirmations and follow-ups.",
    domain: "callcall.in",
    badge: "Coming soon",
    logo: (
      <span className="flex items-center gap-2.5">
        <Image src="/brands/callcall-icon.webp" alt="" width={220} height={227} className="h-10 w-auto" />
        <span className="text-[26px] font-extrabold tracking-tight text-[#3f9a35]">callcall.in</span>
      </span>
    ),
  },
  {
    name: "Web & Apps",
    what: "Websites, web apps and Android / iOS apps, connected to your chatbots, CRM and payments.",
    url: "#contact",
    domain: "leadsndeals.com",
    logo: (
      <span className="flex items-center gap-2.5">
        <Image src="/brands/ln-icon.webp" alt="" width={96} height={96} className="h-10 w-10 rounded-xl" />
        <span className="text-[24px] font-bold tracking-tight text-paper-ink">Web &amp; Apps</span>
      </span>
    ),
  },
];

/** Our brands: the Leadsndeals product family, with each product's own logo. */
export default function Brands() {
  return (
    <section id="brands" data-section="Our brands" className="relative bg-paper py-24 text-paper-ink sm:py-32">
      <div className="container-x">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <TextMask className="display text-[clamp(36px,5vw,64px)]" lines={["One company.", "Four ways to grow."]} />
          <p className="max-w-[380px] text-[15.5px] leading-relaxed text-paper-muted">
            Leadsndeals Intelligent Automations helps businesses reach customers on every channel, through our own products.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {brands.map((b) => {
            const flagship = b.badge === "Flagship";
            const inner = (
              <>
                {b.badge && (
                  <span
                    className={`absolute right-5 top-0 -translate-y-1/2 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${
                      flagship ? "bg-paper-ink text-paper" : "bg-brand text-ink"
                    }`}
                  >
                    {b.badge}
                  </span>
                )}
                <div className="flex h-14 items-center">{b.logo}</div>
                <div className="mt-6 text-[19px] font-semibold tracking-tight">{b.name}</div>
                <p className="mt-2 flex-1 text-[14.5px] leading-relaxed text-paper-muted">{b.what}</p>
                <span className="mt-6 inline-flex items-center gap-1.5 text-[14px] font-medium">
                  {b.domain}
                  {b.url && <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />}
                </span>
              </>
            );
            const cls = `group relative flex flex-col rounded-[24px] border p-7 transition-all duration-300 ${
              flagship ? "border-brand bg-[#fff8dc]" : "border-black/[0.08] bg-white"
            } ${b.url ? "hover:-translate-y-1 hover:shadow-[0_24px_50px_-24px_rgba(0,0,0,0.35)]" : ""}`;
            return b.url ? (
              <a
                key={b.name}
                href={b.url}
                {...(b.url.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className={cls}
              >
                {inner}
              </a>
            ) : (
              <div key={b.name} className={cls}>
                {inner}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
