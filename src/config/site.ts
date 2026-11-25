/**
 * Single source of truth for company details, services and the AI assistant.
 * Fill in the TODO values before going live — empty contact values hide their buttons.
 */

export const site = {
  name: "Leadsndeals",
  legalName: "Leadsndeals Intelligent Automations",
  tagline: "Intelligent Automations",
  url: "https://leadsndeals.com", // TODO: confirm production domain
  description:
    "AI chatbots for WhatsApp, Instagram, Facebook and websites, Direct SMS, n8n workflow automation, e-commerce and web development — one intelligent system that replies in seconds and follows up until the deal closes.",

  contact: {
    /** WhatsApp chat = the WAAU number that runs the Leadsndeals bot (Ira); digits only with country code. */
    whatsapp: "919048338111",
    /** Call numbers shown in the contact section and footer. */
    phones: ["+91 99617 74455", "+91 80864 95777"],
    email: "mail@leadsndeals.com",
    address: "", // TODO: city / office address
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
  | "web";

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
    key: "web",
    title: "Web Development",
    short: "Fast websites and web apps built to convert.",
    description:
      "High-performance websites and web apps designed to convert — and wired straight into your chatbots and workflows.",
    points: ["Websites & landing pages", "Web apps & portals", "SEO-ready"],
  },
];

export const assistant = {
  name: "Ira",
  role: "Leadsndeals AI assistant",
  greeting:
    "Hi, I'm Ira 👋 I can explain how Leadsndeals automates WhatsApp, Instagram, websites, SMS and more. What would you like to automate?",
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
  greetingClip: { webm: "/assistant/ira-hi.webm" as string, mov: "" as string },
  // talking loop shown while Ira's voice is playing (not word-accurate lip-sync)
  talk: { webm: "/assistant/ira-talk.webm" as string, mov: "" as string },
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
    a: "It depends on the channels, message volume and integrations you need. Book a free demo and we'll recommend a setup and send a clear quote.",
  },
] as const;
