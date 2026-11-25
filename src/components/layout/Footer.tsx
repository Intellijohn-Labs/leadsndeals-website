import Image from "next/image";
import { services, site, whatsappLink } from "@/config/site";
import PixelReveal from "@/components/motion/PixelReveal";

export default function Footer() {
  const wa = whatsappLink();
  const socials = Object.entries(site.social).filter(([, v]) => v);
  return (
    <footer className="relative overflow-hidden border-t border-white/[0.06] pt-20">
      <div className="container-x grid gap-12 pb-16 md:grid-cols-12">
        <div className="md:col-span-5">
          <Image src="/brand/logo.png" alt={site.legalName} width={1082} height={284} className="h-14 w-auto" />
          <p className="mt-6 max-w-[360px] text-[15px] leading-relaxed text-muted">{site.description}</p>
        </div>
        <div className="md:col-span-3">
          <h4 className="eyebrow text-dim">Services</h4>
          <ul className="mt-5 space-y-2.5 text-[15px]">
            {services.map((s) => (
              <li key={s.key}>
                <a href="#services" className="tactile text-fg/75 hover:text-fg">
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-2">
          <h4 className="eyebrow text-dim">Company</h4>
          <ul className="mt-5 space-y-2.5 text-[15px]">
            {[
              ["How it works", "#workflow"],
              ["Voice AI", "#voice"],
              ["E-commerce", "#commerce"],
              ["FAQ", "#faq"],
              ["Contact", "#contact"],
            ].map(([l, h]) => (
              <li key={h}>
                <a href={h} className="tactile text-fg/75 hover:text-fg">
                  {l}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className={wa || site.contact.email || socials.length || site.contact.address ? "md:col-span-2" : "hidden"}>
          <h4 className="eyebrow text-dim">Reach us</h4>
          <ul className="mt-5 space-y-2.5 text-[15px]">
            {wa && (
              <li>
                <a href={wa} target="_blank" rel="noopener noreferrer" className="tactile text-fg/75 hover:text-fg">
                  WhatsApp
                </a>
              </li>
            )}
            {site.contact.phones.map((p) => (
              <li key={p}>
                <a href={`tel:${p.replace(/\s/g, "")}`} className="tactile text-fg/75 hover:text-fg">
                  {p}
                </a>
              </li>
            ))}
            {site.contact.email && (
              <li>
                <a href={`mailto:${site.contact.email}`} className="tactile text-fg/75 hover:text-fg">
                  {site.contact.email}
                </a>
              </li>
            )}
            {socials.map(([k, v]) => (
              <li key={k}>
                <a href={v} target="_blank" rel="noopener noreferrer" className="tactile capitalize text-fg/75 hover:text-fg">
                  {k}
                </a>
              </li>
            ))}
            {site.contact.address && <li className="text-muted">{site.contact.address}</li>}
          </ul>
        </div>
      </div>

      <PixelReveal cols={16} rows={3} className="container-x">
        <div
          aria-hidden="true"
          className="display select-none whitespace-nowrap text-center text-[clamp(40px,12.2vw,196px)] leading-[0.85] tracking-[-0.06em]"
          style={{ color: "transparent", WebkitTextStroke: "1px rgba(244,243,238,0.16)" }}
        >
          LEADSNDEALS
        </div>
      </PixelReveal>

      <div className="container-x flex flex-col items-center justify-between gap-3 border-t border-white/[0.06] py-7 text-[13px] text-dim sm:flex-row">
        <span>
          © {new Date().getFullYear()} {site.legalName}. All rights reserved.
        </span>
        <a href="#" className="tactile hover:text-fg">
          Back to top ↑
        </a>
      </div>
    </footer>
  );
}
