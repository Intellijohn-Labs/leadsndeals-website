# Leadsndeals website

Company website for **Leadsndeals Intelligent Automations** (leadsndeals.com): WhatsApp automation (WAAU), Direct SMS, website chatbots, voice calls (CallCall.in, coming soon), e-commerce, CRM, websites and apps.

It is a **Next.js** app (pages + small API routes). Unlike the WAAU site it is **not** a static folder: it needs a running Node server, because these features run on the server:

| Route | What it does | Needs |
|---|---|---|
| `/api/chat` | Lia, the website assistant (Claude) | `LEADSNDEALS_ANTHROPIC_API_KEY` |
| `/api/transcribe` | Malayalam voice input (Gemini) | `GEMINI_API_KEY` |
| `/api/lead` | Demo booking form → n8n → Work OS + WhatsApp | `LEAD_WEBHOOK_URL` |

On the VPS, **PM2** keeps the Next.js server running on **port 3030** (the WAAU site already uses 3020), and **Nginx** sits in front with the domain and SSL.

**No database.** Leads go to n8n / Work OS; chats are not stored on this server.

---

## Deploy on the VPS (first time)

### 1. Requirements
- **Node.js 20 or 22** (`node -v`)
- **PM2**: `npm install -g pm2`
- **Nginx** and **Certbot** (for HTTPS)
- About **1.5 GB free RAM** during `npm run build` (the running site itself uses ~150–250 MB)

### 2. Get the code on the server
```bash
cd ~
git clone https://github.com/Intellijohn-Labs/leadsndeals-website.git
cd leadsndeals-website
```
(Private repo: use a GitHub deploy key or a personal access token on the server.)

### 3. Add the secret keys
Create **`.env.local`** in the project folder (copy from `.env.example`) and fill in the values. Get the keys from the project owner; they are **not** in git.
```bash
cp .env.example .env.local
nano .env.local
```
```env
LEADSNDEALS_ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=AIza...
LEAD_WEBHOOK_URL=https://n8n.srv1691210.hstgr.cloud/webhook/leadsndeals-demo-form
NEXT_PUBLIC_SITE_URL=https://leadsndeals.com
```
> Type the values directly in `nano` (or `printf` in bash). Don't paste them through Windows PowerShell pipes: that adds an invisible character (BOM) that breaks the key.
>
> `NEXT_PUBLIC_SITE_URL` is baked in when the site is built, so **build after** setting it.

### 4. Install and build
```bash
npm ci
npm run build
```

### 5. Start it with PM2
```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup        # run the command it prints, so the site starts again after a reboot
```
Check: `curl -I http://127.0.0.1:3030` should return `200 OK`.

> Port **3030** is set in `ecosystem.config.cjs` (and `package.json` → `start`). Change both, and the Nginx file, if 3030 is already used on the server.

### 6. Nginx (domain → port 3030)
A ready config is in the repo: **`deploy/nginx-leadsndeals.com.conf`**. It serves the site on `leadsndeals.com`, redirects `www` to it, allows voice-clip uploads (4 MB), caches the build files for a year, and turns off buffering so Lia's answers stream word by word.
```bash
sudo cp deploy/nginx-leadsndeals.com.conf /etc/nginx/sites-available/leadsndeals.com
sudo ln -sf /etc/nginx/sites-available/leadsndeals.com /etc/nginx/sites-enabled/leadsndeals.com
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d leadsndeals.com -d www.leadsndeals.com
```

### 7. DNS
Point the domain to the **VPS IP**:
- `A` record `leadsndeals.com` (`@`) → VPS IP
- `A` record `www` → VPS IP

If it's behind Cloudflare, keep the orange cloud on and set SSL/TLS to **Full (strict)**.

---

## Updating the site later
After pushing changes to GitHub:
```bash
cd ~/leadsndeals-website
git checkout -- package-lock.json   # in case someone ran npm install on the server
git pull
npm ci
npm run build
pm2 restart leadsndeals
```

## Useful PM2 commands
| Command | What it does |
|---|---|
| `pm2 status` | Is the site running? |
| `pm2 logs leadsndeals` | See logs (Lia errors, form delivery errors) |
| `pm2 restart leadsndeals` | Restart after a new build or a `.env.local` change |
| `pm2 stop leadsndeals` | Stop the site |

## Files that matter for hosting
| File | Purpose |
|---|---|
| `ecosystem.config.cjs` | PM2 config: app name `leadsndeals`, port 3030, localhost only |
| `deploy/nginx-leadsndeals.com.conf` | Nginx: domain, www redirect, upload size, caching, streaming |
| `.env.example` | List of the settings `.env.local` needs |
| `package.json` | `npm run build` (make the site), `npm start` (run it without PM2) |

## Checklist after going live
- [ ] `https://leadsndeals.com` opens; the loader finishes and the hero phone plays the WhatsApp chat
- [ ] **Chat with Lia** answers (e.g. "What does the ₹2,999 plan include?")
- [ ] Lia's mic works in **EN**, and in **മല** (Malayalam) after allowing the microphone
- [ ] A service card opens its detail popup
- [ ] The demo form books a slot → lead appears in Work OS (LeadsNDeals) and the WhatsApp confirmation arrives
- [ ] **Chat on WhatsApp** opens 919048338111 with "Chat with Leadsndeals"
- [ ] `/privacy`, `/terms`, `/sitemap.xml` and `/robots.txt` open
- [ ] Then switch off the old Vercel deployment (or point it to the domain) so there's only one live copy

---

# Developer notes

```bash
npm install
npm run dev       # http://localhost:3000 (this machine used port 3100 via .claude/launch.json)
npm run build     # production build
npm start         # run the build on port 3030
```

## Where things live
| Path | What |
|---|---|
| `src/config/site.ts` | All content: company + legal details, contacts, services, pricing (chatbot plans, SMS packages), FAQ, Lia settings |
| `src/config/serviceDetails.ts` | Text for the service detail popups (Direct SMS includes the DLT process) |
| `src/app/page.tsx` | Section order |
| `src/components/sections/*` | Page sections (Hero, HeroPhone, Services + ServiceModal, Brands, Pricing, Contact + SlotPicker, …) |
| `src/components/assistant/*` | Lia: chat widget, presenter video, voice input (`dictation.ts`) |
| `src/app/api/*` | `chat` (Claude), `transcribe` (Gemini), `lead` (n8n), `tts` (off) |
| `src/app/privacy`, `src/app/terms` | Legal pages |
| `public/assistant/` | Lia's still + transparent videos (`lia-hi.webm` greeting) |
| `public/hero/phone-frame.webp` | Hero phone frame with a see-through screen |
| `public/brands/` | WAAU, DirectSMS, CallCall.in logos |
| `design/` | Source images (green-screen originals, banner options, logo source) |

## Outside services
- **n8n** `…/webhook/leadsndeals-demo-form`: demo booking → Work OS lead + WhatsApp template `leadsndeals_demo_booked` + team alert.
- **WhatsApp** `wa.me/919048338111` with "Chat with Leadsndeals": WAAU hot keyword → n8n "Leadsndeals - WhatsApp Bot (Lia)".
- **Anthropic** (Lia's replies) and **Google Gemini** (Malayalam voice transcription).

## Performance notes
- Phones: no smooth-scroll library (it blocked iOS swipes), no hero sphere, no grain/backdrop blur; glows are gradients, not blur filters.
- The loader waits for fonts + page load + a calm main thread (max 8 s on phones, 6 s on desktop).
- The hero phone chat and wave lines are code-drawn (no video download) and pause off-screen.
