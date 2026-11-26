/**
 * Single source of truth for company details, services and the AI assistant.
 * Fill in the TODO values before going live — empty contact values hide their buttons.
 */

export const site = {
  name: "Leadsndeals",
  legalName: "Leadsndeals Intelligent Automations",
  tagline: "Intelligent Automations",
  // Canonical address. Set NEXT_PUBLIC_SITE_URL=https://leadsndeals.com once the domain is connected.
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://leadsndeals-website.vercel.app",
  description:
    "AI chatbots for WhatsApp, Instagram, Facebook and websites, Direct SMS, n8n workflow automation, e-commerce and web development — one intelligent system that replies in seconds and follows up until the deal closes.",

  contact: {
    /** WhatsApp chat = the WAAU number that runs the Leadsndeals bot (Lia); digits only with country code. */
    whatsapp: "919048338111",
    /** Call numbers shown in the contact section and footer. */
    phones: ["+91 99617 74455", "+91 80864 95777"],
    email: "mail@leadsndeals.com",
    address: "Ground Floor, 1/57, Kuthiyathodu, Kunnukara, Ernakulam, Kerala 683578",
  },

  /** From the GST registration. */
  legal: {
    tradeName: "Leadsndeals Intelligent Automations",
    owner: "Justin Johny",
    constitution: "Proprietorship",
    street: "Ground Floor, 1/57, Kuthiyathodu",
    locality: "Kunnukara",
    district: "Ernakulam",
    state: "Kerala",
    pin: "683578",
    effective: "26 November 2026",
  },

  social: {
    instagram: "", // TODO
    facebook: "", // TODO
    linkedin: "", // TODO
  } as Record<string, string>,
};

// "Chat with Leadsndeals" is the WAAU hot keyword that routes the chat to the Leadsndeals bot.
export function whatsappLink(message = "Chat with Leadsndeals") {
  if (!site.contact.whatsapp) return null;
  return `https://wa.me/${site.contact.whatsapp}?text=${encodeURIComponent(message)}`;
}

export type ServiceKey =
  | "whatsapp"
  | "social"
  | "webchat"
  | "voice"
  | "sms"
  | "ecommerce"
  | "n8n"
  | "crm"
  | "web"
  | "app";

export interface Service {
  key: ServiceKey;
  title: string;
  short: string;
  description: string;
  points: string[];
  status?: "coming-soon";
}

export const services: Service[] = [
  {
    key: "whatsapp",
    title: "WhatsApp Automation",
    short: "Official API chatbots that sell, support and follow up.",
    description:
      "WhatsApp Business API chatbots with catalogues, broadcasts, payment links and automatic follow-ups — so no enquiry waits for a human.",
    points: ["AI chatbots", "Broadcasts & templates", "Catalogue + payments"],
  },
  {
    key: "social",
    title: "Instagram & Facebook",
    short: "Every DM and comment answered, every lead captured.",
    description:
      "Auto-replies for Instagram and Messenger DMs, comment-to-DM flows and lead capture from your ads, with a clean hand-off to your team.",
    points: ["DM & comment replies", "Lead-ad capture", "Human hand-off"],
  },
  {
    key: "webchat",
    title: "Website Chatbots",
    short: "An AI assistant that answers, qualifies and books.",
    description:
      "An AI assistant trained on your business that answers visitors, qualifies them and books demos — like the one on this page.",
    points: ["Trained on your data", "Lead qualification", "Demo booking"],
  },
  {
    key: "voice",
    title: "Voice AI Agents",
    short: "Natural voice agents for inbound and outbound calls.",
    description:
      "AI voice agents that pick up every call, answer questions and book appointments in a natural voice. Calling is launching soon.",
    points: ["Inbound & outbound", "Appointment booking", "Call summaries"],
    status: "coming-soon",
  },
  {
    key: "sms",
    title: "Direct SMS",
    short: "Reliable SMS for alerts, OTPs and campaigns.",
    description:
      "Transactional and promotional SMS — OTPs, reminders, order updates and campaigns — triggered automatically from your workflows.",
    points: ["Transactional & promo", "DLT-ready templates", "Workflow triggers"],
  },
  {
    key: "ecommerce",
    title: "E-commerce",
    short: "Stores on your website and inside WhatsApp.",
    description:
      "Online stores on the web and inside WhatsApp: catalogue, cart, UPI checkout, order tracking and abandoned-cart recovery.",
    points: ["Website stores", "WhatsApp stores", "Cart recovery"],
  },
  {
    key: "n8n",
    title: "n8n Automation",
    short: "Workflows that connect every tool you use.",
    description:
      "Custom n8n workflows connecting your CRM, Google Sheets, payment gateways and AI — self-hosted or cloud, built to run without babysitting.",
    points: ["CRM & Sheets sync", "Payment webhooks", "AI agents"],
  },
  {
    key: "crm",
    title: "CRM Integrations",
    short: "Every lead lands in your CRM — none lost or typed twice.",
    description:
      "Leads from your website, WhatsApp, forms and ads flow straight into your CRM, with automatic follow-ups so nobody slips through.",
    points: ["All channels → one CRM", "Automatic follow-ups", "No double entry"],
  },
  {
    key: "web",
    title: "Web Development",
    short: "Fast websites and web apps built to convert.",
    description:
      "High-performance websites and web apps designed to convert — and wired straight into your chatbots and workflows.",
    points: ["Websites & landing pages", "Web apps & portals", "SEO-ready"],
  },
  {
    key: "app",
    title: "Mobile App Development",
    short: "Android and iOS apps your customers keep on their phones.",
    description:
      "Custom Android and iOS apps for bookings, orders and loyalty, with push notifications and an admin panel for your team.",
    points: ["Android & iOS", "Bookings, orders & loyalty", "Push notifications"],
  },
];

/* ---------- Pricing (from the Leadsndeals × WAAU brochure; INR, 18% GST extra) ---------- */

export const chatbotPlans = [
  {
    tier: "Starter",
    name: "Bot Creator & Bulk Messaging",
    blurb: "Your first chatbot plus broadcasts",
    price: 999,
    features: [
      "Drag-and-drop bot flow builder, running 24/7",
      "Live chat inbox for your team, bot hands over to a human",
      "Bulk broadcasts with images, PDFs and buttons — see who read them",
    ],
  },
  {
    tier: "Most popular",
    name: "Advance Bot Builder & Bulk Messaging",
    blurb: "AI voice replies, API & CRM, multi-language",
    price: 2999,
    popular: true,
    features: [
      "Everything in Starter",
      "AI replies to customer voice notes, in their language",
      "API & CRM integrations, multi-language",
      "WhatsApp product catalog",
    ],
  },
  {
    tier: "Complete package",
    name: "Premium Bot Builder & Messaging",
    blurb: "Instagram, Facebook, Webchat, payments, 24/7 support",
    price: 4999,
    features: [
      "Everything in Advance",
      "Instagram, Facebook and website chat — one bot for every channel",
      "Payment links in chat, e-commerce order flows",
      "24/7 priority support",
    ],
  },
];

export const chatbotNotes = [
  "1,000 free service messages every month",
  "Prices per month in INR, 18% GST extra",
  "WhatsApp message charges follow Meta's rates and may change",
  "AI chatbot usage has a separate AI charge",
  "WhatsApp Business API setup and approved templates required",
];

export const smsPackages = [
  { qty: 50000, rate: 0.15 },
  { qty: 100000, rate: 0.14 },
  { qty: 200000, rate: 0.13 },
  { qty: 500000, rate: 0.12 },
].map((p) => {
  const basic = Math.round(p.qty * p.rate);
  const gst = Math.round(basic * 0.18);
  return { ...p, basic, gst, total: basic + gst };
});

export const smsNotes = [
  "Charges apply only to successfully delivered SMS",
  "40% of undelivered SMS are credited back to your account",
  "24×7 service and support, with monthly delivery reports",
];

export const inr = (n: number) => "₹" + n.toLocaleString("en-IN");

export const assistant = {
  name: "Lia",
  role: "Leadsndeals AI assistant",
  greeting:
    "Hi, I'm Lia, the Leadsndeals assistant. Ask me about our services, pricing or booking a demo.",
  suggestions: [
    "Automate my WhatsApp",
    "Instagram & Facebook replies",
    "Build an online store",
    "How does pricing work?",
    "Book a demo",
  ],
  /**
   * Presenter media — see docs/AI-PRESENTER.md for how to create it.
   * Leave everything empty to use the animated orb. Put files in /public/assistant/.
   * Best result: a cut-out (transparent background) half-body presenter, like ClaimsLens.
   *   portrait       — transparent PNG/WebP still, also used as the video poster
   *   idle.webm      — 5–8 s seamless idle loop with alpha (Chrome, Edge, Firefox)
   *   idle.mov       — same loop as HEVC-with-alpha for Safari / iPhone (optional;
   *                    without it Safari shows the still portrait)
   *   greetingClip   — "Hi, I'm Ira" clip that plays once when the chat opens (optional)
   */
  portrait: "/assistant/ira.webp" as string,
  // handoffAt: the idle frame (seconds) that best matches the greeting's last frame — where idle resumes after greeting
  idle: { webm: "/assistant/ira-idle.webm" as string, mov: "" as string, handoffAt: 5.958 },
  // Same greeting video as before with a new Gemini TTS (voice Kore) track: "Hi! I'm Lia from Leadsndeals…"
  greetingClip: { webm: "/assistant/lia-hi.webm" as string, mov: "" as string },
  // talking loop shown while Ira's voice is playing (not word-accurate lip-sync)
  // Spoken replies are off, so the talking loop isn't loaded. Restore "/assistant/ira-talk.webm" if they return.
  talk: { webm: "" as string, mov: "" as string },
};

export const faqs = [
  {
    q: "Do you use the official WhatsApp Business API?",
    a: "Yes. We set up your number on the official WhatsApp Business API, get your message templates approved and connect it to your chatbot and workflows.",
  },
  {
    q: "How long does it take to go live?",
    a: "Simple chatbots usually go live within days. Larger projects with integrations, stores or custom workflows are planned in phases so you start seeing results early.",
  },
  {
    q: "Can the AI hand a conversation over to my team?",
    a: "Always. The bot answers routine questions and captures details, and hands over to a person whenever a customer asks for one or the conversation needs it.",
  },
  {
    q: "Which tools can you connect?",
    a: "Anything with an API or webhook — CRMs, Google Sheets, payment gateways, booking tools, e-commerce platforms and your own systems — usually through n8n.",
  },
  {
    q: "When will Voice AI calling be available?",
    a: "Voice AI calling is launching soon. Tell us about your use case and we'll add you to the early-access list.",
  },
  {
    q: "How is pricing worked out?",
    a: "WhatsApp chatbot plans start at ₹999/month (₹2,999 and ₹4,999 plans add AI voice replies, CRM, Instagram, Facebook, webchat and payments). Direct SMS starts at ₹0.15 per SMS. All prices are + 18% GST — see the Pricing section. Websites, apps, CRM and custom workflows are quoted after a free demo.",
  },
] as const;
