# Creating Ira — the AI presenter

The site is ready for a ClaimsLens-style presenter: a half-body person standing in the
"Talk to me" card, breathing and blinking, who says hello when the chat opens.
You only need to create the media and drop it in `public/assistant/`.

> Use a face you own: an AI-generated person, or a team member who agrees to it.
> Never use another company's presenter (e.g. ClaimsLens's "Anika" or Vozon's "Vini").

## What you need (3 files, 1 optional)

| File | What | Size target |
| --- | --- | --- |
| `ira.webp` | Still, **transparent background**, half body, 9:16 | < 150 KB |
| `ira-idle.webm` | 5–8 s seamless idle loop, transparent (VP9 + alpha) | < 1.5 MB |
| `ira-hi.webm` | 3–5 s "Hi, I'm Ira!" greeting, transparent | < 1.5 MB |
| `ira-idle.mov` / `ira-hi.mov` *(optional)* | Same clips as HEVC-with-alpha for Safari/iPhone | — |

Without the `.mov` files Safari simply shows the still image — still looks good.

## Step 1 — Generate the portrait

Use Gemini (image generation), ChatGPT image or Midjourney. Generate on a **flat green
background** so it can be cut out cleanly later.

**Prompt**

> Photorealistic studio portrait of a friendly, confident South Indian woman in her late
> 20s, a customer-success professional. Half-body shot from the waist up, facing the
> camera, standing straight, hands loosely clasped in front at the waist. Wavy dark
> shoulder-length hair, natural makeup, warm gentle smile with lips closed. Wearing a
> tailored charcoal-black blazer over a plain ivory top, with one small mustard-yellow
> (#F2C21B) pin on the lapel. Soft, even beauty lighting, sharp focus, 85 mm lens look.
> Plain flat chroma-green background (#00B140), no shadows on the background.
> Vertical 9:16, centred, a little empty space above the head. No text, no logos.

Tips: generate 6–10 options, pick one with clean hair edges and relaxed hands.
Keep the chosen image — every video below is made from it so the face stays identical.

## Step 2 — Animate it

Any image-to-video tool works (Kling AI, Runway, Hedra, HeyGen "Photo Avatar").

**Idle loop** (no talking) — upload the portrait and use:

> Static camera. The woman stands still and looks at the camera with a soft smile.
> Subtle natural breathing, two or three slow blinks, a very slight head tilt.
> Mouth stays closed. Background stays flat green. 6 seconds.

For a seamless loop, set the **end frame = the same portrait** (Kling and Runway support
start + end frames).

**Greeting** — use HeyGen / Hedra (talking photo, lip-sync) with this script and a warm
Indian-English female voice:

> "Hi! I'm Ira from Leadsndeals. How can I help you today?"

## Step 3 — Cut out the background

Send the green-screen clips to Claude (or run these yourself with ffmpeg):

```bash
# transparent WebM for Chrome / Edge / Firefox
ffmpeg -i ira-idle-green.mp4 -vf "chromakey=0x00B140:0.12:0.06,despill=green,scale=720:-2,format=yuva420p" \
  -c:v libvpx-vp9 -pix_fmt yuva420p -b:v 0 -crf 34 -an -auto-alt-ref 0 ira-idle.webm

# transparent still (poster) from the first frame
ffmpeg -c:v libvpx-vp9 -i ira-idle.webm -frames:v 1 ira.png   # then convert to .webp
```

Repeat for the greeting clip (keep `-an`; the greeting plays muted in the card).

Safari (optional): on a Mac, open a ProRes 4444 export in Finder → right-click →
*Encode Selected Video Files* → HEVC, tick **Preserve Transparency** → rename to `.mov`.

## Step 4 — Switch it on

Copy the files to `public/assistant/` and edit `src/config/site.ts`:

```ts
portrait: "/assistant/ira.webp",
idle: { webm: "/assistant/ira-idle.webm", mov: "" },
greetingClip: { webm: "/assistant/ira-hi.webm", mov: "" },
```

The "Talk to me" card, the chat header and the Voice AI phone all pick it up automatically.

## Later — a presenter that talks back live

When Voice AI launches, the same face can become a real-time talking avatar
(HeyGen Interactive Avatar, Tavus or D-ID streaming) driven by Ira's replies.
That is a separate integration with per-minute pricing — plan it with the voice rollout.
