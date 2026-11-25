# Leadsndeals website — session log (24 Nov 2026)

A complete record of the work done with Claude on the Leadsndeals Intelligent Automations website:
from reviewing the Antigravity build, through the full rebuild, to creating **Ira**, the
AI presenter who answers questions and speaks.

> **Secrets are not in this file.** API keys live only in `.env.local` (git-ignored).
> Both the Anthropic and Gemini keys were pasted in chat during this session, so **rotate both
> before going live** (Anthropic Console, Google AI Studio).

---

## 1. Starting point: review of the Antigravity build

The first version was built in Antigravity from a Gemini-written spec
(`Downloads/leadsndeals website development spec.pdf`: 7 sections, 6-card bento, pixel reveal,
magnetic buttons, Lenis + GSAP). Claude reviewed all 20 source files against the spec and ran it.

**Bugs found**
- Brand fonts never loaded (`--font-jakarta` / `--font-jetbrains` were never defined), so the site rendered in Segoe UI.
- Logo was a black-background JPG and showed as a black box on the white navbar.
- The velocity marquee was a no-op (GSAP `timeScale` set on DOM nodes can't change a CSS animation).
- The contact form sent nothing; leads were lost.
- All `wa.me` links had no number; the phone was a placeholder.
- The hero animations played behind the preloader (`preloaderDone` was never used).
- The Voice AI showcase overlapped itself and used fixed pixel positions.

**Content problems**
- Healthcare (ABDM/NHCX/ClaimsLens) content had leaked in from another project.
- Only 4 of the 6 services were present.
- Invented stats ("3.8x ROI", "₹14.2M+ closed", "99.98% uptime"…).
- Placeholder footer text.

**Important:** the phone UI and the "Vini" portrait were **Vozon's own assets** (same "Anglo-Norman"
caller and May-2026 calendar; their file is `/images/agents/vini-portrait-full.png`). They were not reused.

The old build is backed up at `Desktop/INTELLIJOHN/Leadsndeals-antigravity-v1-backup`.

---

## 2. Decision: full rebuild

The user asked for a complete rebuild using the effects from
**shakirc.com/animations**, with **vozon.ai** and **claimslens.com** as references, the official logo,
the phone UI kept and improved, and "voice calling coming soon".

### Stack
Next.js 16.4.6 (App Router) · Tailwind CSS v4 · GSAP + ScrollTrigger · Lenis · Motion ·
`@anthropic-ai/sdk` · `next/font` (Inter Tight, Instrument Serif, JetBrains Mono).

### Design
- Dark, premium theme using the logo's yellow (`#f2c21b`), with light "paper" sections for rhythm.
- The logo was cut out of the JPG into transparent PNGs (`public/brand/logo.png`, `wordmark.png`) and is used only on dark surfaces (the light cut-out had JPEG artefacts).
- Favicon (`src/app/icon.png`) and social image (`src/app/opengraph-image.png`) were generated from the logo.
- All content lives in **`src/config/site.ts`** (company info, 8 services, FAQ, assistant settings).

### Effects (from shakirc.com/animations)

| Effect | Where |
| --- | --- |
| 01 Hover effects | Industries deck spreads on hover; service cards lift |
| 02 Smooth loader | Preloader: logo wipe + 0–100 counter, then pixel-grid dissolve |
| 03 3D motion | Hero particle sphere (canvas, draggable, cursor-repelling, loosens on scroll) |
| 04 Entrance reveal | `PixelReveal` on the Voice phone and footer wordmark |
| 05 Micro interaction | `MagneticButton` + hover pulse ring |
| 06 Parallax | Hero layers, Voice/Commerce floats, layered Contact scene |
| Bonus | Card fan (Services), masked headlines, text decrypt (eyebrows), word-by-word text reveal |

All effects respect `prefers-reduced-motion`.

### Page sections (in order)
Preloader → Navbar → Hero (sphere + floating chips) → Channel strip → Statement (scroll text reveal) →
Services (8 cards: stacked deck → fan → grid, pinned) → How it works (pinned 5-step path) →
Voice AI (phone, "Calling · coming soon") → E-commerce (animated WhatsApp shopping chat) →
Industries (hover deck) → Process (sticky stacking cards) → FAQ → Contact (layered parallax + form) → Footer.

### Services (8)
WhatsApp Automation · Instagram & Facebook · Website Chatbots · Voice AI Agents (coming soon) ·
Direct SMS · E-commerce · n8n Automation · Web Development.

### Backend routes
- **`/api/chat`**: Claude streams Ira's answers (see §4).
- **`/api/tts`**: Gemini text-to-speech streams Ira's voice (see §5).
- **`/api/lead`**: validates the demo form and forwards it to `LEAD_WEBHOOK_URL` (e.g. an n8n webhook). Without a webhook, leads are only logged on the server.

---

## 3. UI fixes after the first review

| Issue reported | Cause | Fix |
| --- | --- | --- |
| Service card text spilling out | Cards shorter than their content on ~650 px-tall screens; the heading was also pinned | Only the card stage pins (full height); cards clip, and a container query hides tags/link when short |
| "Coming soon" badge over the Voice AI icon | Absolute positioning | Badge replaces the card number in the header row |
| Marquee looked bad (giant outlined text) | Design | Replaced by two rows of glass channel pills (icon + name), faded edges, still scroll-speed reactive |
| Workflow labels overlapping the curve | Labels placed above/below nodes | Curve moved to the top 60%, labels on one row below |
| Process cards bleeding through | Fade used opacity | Darken with `filter: brightness()` instead |
| Footer wordmark overflowing | Font size | Smaller clamp |

---

## 4. Ira, the AI assistant

### Widget (ClaimsLens-style)
- **"Talk to me" card:** light frosted panel, violet/pink glow, presenter standing from the bottom, dark gradient pill, grey close button. Phones get a compact "Chat with Ira" bubble.
- **Chat panel:** presenter strip in the header, suggestion chips, an **"Explain this section"** button that knows which section is on screen, a mic button ("voice conversations coming soon"), and a speaker toggle.
- The X button hides the card **for this page view only**; a reload brings her back. Closing the chat returns to the card.
- Answers come from **Claude Opus 5.5** (`/api/chat`, effort `low`, server-side refusal fallbacks), with a system prompt built from `site.ts`: services, FAQ, section descriptions, and rules (short plain-text replies, no invented prices or stats, reply in the visitor's language, suggest a demo).
- Tested: English answers in ~1.25 s to first text; **Malayalam** answers are natural.

### Creating Ira's look (Gemini)
1. **Portrait:** 6 options generated with `gemini-3-pro-image` on a green screen; the user picked **option 3** (bun, black blazer, yellow pin).
2. **Videos:** Veo wasn't available on the key, but **Gemini Omni 1.2 Flash** (Interactions API, `POST /v1beta/interactions`, `response_format: video`, 9:16, 720p, about $0.07/s) produced:
   - `ira-idle`: 6 s breathing/blinking loop
   - `ira-hi`: 5 s greeting with voice: "Hi! I'm Ira from Leadsndeals. How can I help you today?"
   - `ira-talk`: 6 s natural talking loop (for spoken replies)
3. **Cut-out:** a custom green-screen key (numpy + despill), the same crop for every clip, encoded to **transparent VP9 WebM** with ffmpeg. The idle and talk loops play **forward then in reverse** so they loop seamlessly.

Files in `public/assistant/`: `ira.webp` (still), `ira-idle.webm`, `ira-hi.webm`, `ira-talk.webm`.
Sources (green-screen MP4s, portrait options) are in `design/ira/`.
Safari can't show transparent WebM, so it gets the still image (a Safari `.mov` can be added later; see `docs/AI-PRESENTER.md`).

### Presenter playback rules (`src/components/assistant/Presenter.tsx`)
Only **one** video is ever visible. Stacking transparent videos showed "two heads", which the user
reported as her head multiplying. Switches happen on the exact painted frame (`requestVideoFrameCallback`), with no fades:

```
idle held on frame 0  → greeting frame 0 painted (identical pose)  → greeting
greeting ended        → idle seeked to handoffAt = 5.958 s (closest pose) → idle
voice starts speaking → talk loop frame 0                            → talk
voice stops           → idle from frame 0                            → idle
```

- The greeting waits ~0.5 s for the panel's open animation so the first word is seen.
- The greeting plays **with sound once per page load**; later opens greet silently and show **"Tap to hear Ira"**, which also appears if the browser blocks sound.
- Header overlays are click-through so the tap button works.

### Bugs fixed along the way
- Greeting silent in Chrome: React dev StrictMode ran the effect twice (first run used up "first open with sound", second restarted it muted). Then a guard cancelled its own timer. Fixed by deciding "with sound" once per opening in a ref.
- The "once per session" rule survived reloads, so the voice never came back. Changed to once per page load + tap-to-hear.
- Card not showing after reload: the X dismissal was saved for the whole tab session. Changed to per page view.
- Loop seam pop: a 12.3 face-difference jump vs a 1.9 normal frame-to-frame change. Fixed with ping-pong loops.

---

## 5. Ira's spoken replies (Claude text → Gemini voice)

- **Voice:** `gemini-3.8-flash-lite-tts`, voice **Kore**, **no style prompt**. Gemini compared candidates against the greeting video: Kore 9/10. With a style tag she sounded lower (6/10), and long instructions were **read aloud**.
- **Streaming:** `/api/tts` turns Gemini SSE into raw 16-bit PCM (24 kHz mono); the first audio arrives in ~0.85 s.
- **Browser (`src/components/assistant/voice.ts`):**
  - `SentenceFeeder` sends each completed sentence (≥ 40 characters) to `/api/tts` while Claude is still writing.
  - `IraVoice` schedules the PCM chunks gaplessly with the Web Audio API, in order, and reports speaking on/off to drive the talking video.
  - `prepareForSpeech` removes emojis, links and markdown, and pronounces "Leadsndeals" as "Leads n Deals" and "n8n" as "n eight n".
  - Audio is unlocked inside the click/Enter that sends a message, so Chrome allows sound.
- **Measured (warm server):** Claude text at +1.25 s → **voice at about +2.5 s** after pressing Enter. A 70-word answer ran ~27 s of speech, then she returned to idle. Malayalam speech was rated 9/10.
- Speaker button = mute or unmute Ira's voice (remembered in `localStorage`).

---

## 6. Costs incurred (approximate)

| Item | Cost |
| --- | --- |
| 6 portrait images (Gemini 3 Pro Image) | small |
| Omni videos: idle 6 s + greeting 5 s + talk 6 s | ≈ $1.20 |
| Voice/transcription tests | small |
| **Per visitor question (ongoing)** | 1 Claude reply + a few short Gemini TTS calls |

---

## 7. Where things live

| Path | What |
| --- | --- |
| `src/config/site.ts` | All content: company, services, FAQ, assistant + presenter media |
| `src/app/page.tsx` | Section order + effects map |
| `src/components/sections/*` | Page sections |
| `src/components/motion/*` | Preloader, PixelReveal, MagneticButton, TextMask, ScrambleText, ScrollWordReveal, Parallax, ParticleSphere |
| `src/components/assistant/*` | AssistantWidget, Presenter, Avatar, Orb, voice.ts |
| `src/app/api/chat` · `api/tts` · `api/lead` | Claude answers · Gemini voice · demo form |
| `public/assistant/*` | Ira's still + transparent videos |
| `design/ira/` | Portrait options, cut-out, green-screen source videos |
| `docs/AI-PRESENTER.md` | How to re-create or extend the presenter (prompts, ffmpeg) |
| `.env.example` | Required environment variables (no values) |

**Environment variables** (`.env.local`, never committed): `LEADSNDEALS_ANTHROPIC_API_KEY`,
`GEMINI_API_KEY`, `LEAD_WEBHOOK_URL`, `LEAD_WEBHOOK_SECRET`.

**Run locally:** `npm run dev` (this session used port 3100 via `.claude/launch.json` "leadsndeals",
because an old `next start` build was running on port 3000; don't run `next build` while it's up,
since they share `.next`).

---

## 8. Still to do before launch

- [ ] **Rotate the Anthropic and Gemini keys** (pasted in chat), then set them in Vercel.
- [ ] Fill in contact details in `src/config/site.ts`: WhatsApp number, phone, email, domain, socials (empty values hide their buttons).
- [ ] Set `LEAD_WEBHOOK_URL` (n8n → CRM/Sheet + WhatsApp alert) so demo requests are delivered.
- [ ] Provide the original vector logo (current PNGs were cut from a JPG).
- [ ] Optional: Safari `.mov` (HEVC with alpha) versions of Ira's videos, exported on a Mac.
- [ ] Optional: live lip-synced avatar (HeyGen Interactive / Tavus / D-ID, or Gemini **Genie 4**, which is on the key) when Voice AI calling launches.
- [ ] Production build + deploy (nothing is committed yet beyond the initial create-next-app commit).
