# Leadsndeals — company website

Next.js 16 (App Router) · Tailwind CSS v4 · GSAP + ScrollTrigger · Lenis · Motion · Claude (website assistant).

## Run locally

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev                  # http://localhost:3000
```

## Before going live

1. **Contact details** — fill the `TODO`s in `src/config/site.ts` (WhatsApp number, phone, email, socials, domain).
   Empty values simply hide their buttons.
2. **AI assistant (Ira)** — set `LEADSNDEALS_ANTHROPIC_API_KEY` (her answers, Claude) and `GEMINI_API_KEY`
   (her voice, Gemini TTS) in `.env.local` / Vercel. Without them the widget falls back to text / the form.
3. **Leads** — set `LEAD_WEBHOOK_URL` (e.g. an n8n webhook → CRM/Sheet + WhatsApp alert). Without it,
   form submissions are only logged on the server.
4. **Presenter avatar** — to replace the animated orb with a real presenter (ClaimsLens style), add your own
   files to `public/assistant/` and set `portrait` / `idleVideo` / `greetingVideo` in `src/config/site.ts`.
   Use media you own the rights to.
5. **Logo** — `public/brand/*.png` were extracted from a JPG. Swap in an SVG/PNG export of the original logo for sharper edges.

## Where things live

| Path | What |
| --- | --- |
| `src/config/site.ts` | Company info, services, FAQ, assistant settings — edit content here |
| `src/components/sections/*` | Page sections in order (see `src/app/page.tsx`) |
| `src/components/motion/*` | Reusable effects: Preloader, PixelReveal, MagneticButton, TextMask, ScrambleText, ScrollWordReveal, Parallax, ParticleSphere |
| `src/components/assistant/*` | Ira widget, presenter, orb |
| `src/app/api/chat` | Claude chat endpoint (streams plain text) |
| `src/app/api/lead` | Demo-form endpoint → `LEAD_WEBHOOK_URL` |

## Effects (from shakirc.com/animations)

Hover cards (Industries deck, service cards) · smooth loader · 3D particle sphere · pixel entrance reveal ·
magnet + pulse buttons · layered parallax · card fan on scroll · masked headlines · text decrypt · text reveal on scroll.
All respect `prefers-reduced-motion`.
