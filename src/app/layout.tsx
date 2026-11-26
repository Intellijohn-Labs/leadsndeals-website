import type { Metadata, Viewport } from "next";
import { Inter_Tight, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers/Providers";
import { faqs, services, site } from "@/config/site";

const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline} for WhatsApp, Instagram, Web & SMS`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  alternates: { canonical: "/" },
  keywords: [
    "WhatsApp automation",
    "WhatsApp Business API",
    "Instagram automation",
    "Facebook Messenger chatbot",
    "website chatbot",
    "Voice AI agent",
    "Direct SMS",
    "n8n automation",
    "WhatsApp e-commerce",
    "web development",
  ],
  openGraph: {
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    type: "website",
    siteName: site.name,
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#09090a",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-intro="pending"
      className={`${interTight.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <noscript>
          <style>{`html[data-intro]{overflow:auto!important}[data-preloader]{display:none!important}`}</style>
        </noscript>
        <script
          type="application/ld+json"
          // Organization + Services + FAQ for search engines
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  name: site.legalName,
                  alternateName: site.name,
                  url: site.url,
                  logo: `${site.url}/brand/logo.png`,
                  email: site.contact.email,
                  telephone: site.contact.phones,
                  description: site.description,
                },
                ...services.map((s) => ({
                  "@type": "Service",
                  name: s.title,
                  description: s.description,
                  provider: { "@type": "Organization", name: site.legalName },
                  areaServed: "IN",
                })),
                {
                  "@type": "FAQPage",
                  mainEntity: faqs.map((f) => ({
                    "@type": "Question",
                    name: f.q,
                    acceptedAnswer: { "@type": "Answer", text: f.a },
                  })),
                },
              ],
            }),
          }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
