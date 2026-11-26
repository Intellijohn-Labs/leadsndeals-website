import Image from "next/image";
import Link from "next/link";
import { site } from "@/config/site";
import IntroDone from "./IntroDone";

/** Simple, readable layout for the Privacy Policy and Terms pages. */
export default function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ink">
      <IntroDone />
      <header className="border-b border-white/[0.06]">
        <div className="container-x flex h-[72px] items-center justify-between">
          <Link href="/" aria-label={`${site.name} home`}>
            <Image src="/brand/wordmark.png" alt={site.name} width={1082} height={199} className="h-[26px] w-auto" priority />
          </Link>
          <Link href="/" className="text-[14px] text-muted hover:text-fg">
            ← Back to website
          </Link>
        </div>
      </header>
      <main className="container-x max-w-[820px] py-16 sm:py-20">
        <h1 className="text-[clamp(34px,5vw,52px)] font-semibold tracking-tight text-fg">{title}</h1>
        <p className="mt-3 text-[14px] text-muted">Effective from {site.legal.effective}</p>
        <div className="legal mt-10 space-y-8 text-[16px] leading-relaxed text-fg/85">{children}</div>
      </main>
      <footer className="border-t border-white/[0.06]">
        <div className="container-x py-8 text-[13px] text-muted">
          © {new Date().getFullYear()} {site.legal.tradeName} ({site.legal.constitution} of {site.legal.owner}) · {site.contact.address}
        </div>
      </footer>
    </div>
  );
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 text-[20px] font-semibold tracking-tight text-fg">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
