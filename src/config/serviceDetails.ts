import type { ServiceKey } from "./site";

/** Longer service descriptions shown in the service detail popup (Services section). */
export type ServiceDetail = {
  overview: string;
  includes: string[];
  steps: { title: string; text?: string; list?: string[] }[];
  needs?: string[];
  timeline?: string;
  pricing: "chatbot" | "sms" | "quote" | "early-access";
};

export const serviceDetails: Record<ServiceKey, ServiceDetail> = {
  whatsapp: {
    overview:
      "A chatbot on the official WhatsApp Business API that answers customers instantly, shares your catalogue and prices, takes orders and bookings, sends payment links and follows up on its own. Your team sees every chat in one shared inbox and can take over at any time.",
    includes: [
      "Official WhatsApp Business API setup and green-tick guidance",
      "Drag-and-drop bot flows, FAQ and keyword replies",
      "Catalogue, cart and UPI payment links in the chat",
      "Bulk broadcasts with images, PDFs and buttons",
      "Shared team inbox with hand-over to a person",
      "AI replies to text and voice notes (₹2,999 plan and above)",
    ],
    steps: [
      { title: "Understand your business", text: "We map your common questions, products, prices and the journeys you want automated." },
      { title: "Connect your number", text: "We set up your number on the WhatsApp Business API and get your message templates approved by Meta." },
      { title: "Build and test the bot", text: "We build the flows, connect your sheets or CRM, and test every path with you." },
      { title: "Go live and improve", text: "Your bot goes live; we watch real chats and keep improving the answers." },
    ],
    needs: ["A phone number not already used on the WhatsApp app", "Facebook Business Manager access (we guide you)", "Your product list, prices and FAQs"],
    timeline: "Simple bots usually go live within a few days.",
    pricing: "chatbot",
  },
  social: {
    overview:
      "Every Instagram and Facebook DM and comment gets a quick, helpful reply. Comment-to-DM flows turn post engagement into conversations, leads from your ads are captured automatically, and your team takes over whenever needed.",
    includes: [
      "Auto-replies to Instagram DMs and Facebook Messenger",
      "Comment-to-DM: reply to a keyword comment with a private message",
      "Lead capture from Facebook and Instagram lead ads",
      "Same bot brain and inbox as your WhatsApp",
      "Hand-over to your team with full chat history",
    ],
    steps: [
      { title: "Connect your pages", text: "We connect your Instagram professional account and Facebook page." },
      { title: "Design the replies", text: "We set up replies, keyword triggers and comment-to-DM flows for your posts and ads." },
      { title: "Route the leads", text: "Leads go to your CRM or sheet, and your team is alerted." },
      { title: "Go live", text: "We test with real comments and messages, then switch it on." },
    ],
    needs: ["Instagram professional account linked to a Facebook page", "Admin access to the page (we guide you)"],
    pricing: "chatbot",
  },
  webchat: {
    overview:
      "An AI assistant on your website, trained on your business, that answers visitors, qualifies them and books demos or appointments, like Lia on this page. Conversations and leads are saved for your team.",
    includes: [
      "AI chat widget in your brand colours",
      "Trained on your services, prices, FAQs and policies",
      "Lead capture and demo or appointment booking",
      "Voice input, and replies in the visitor's language",
      "Leads saved to your CRM, with team alerts",
    ],
    steps: [
      { title: "Collect your content", text: "We gather your services, FAQs and pricing rules into the assistant's knowledge." },
      { title: "Design the widget", text: "We match your brand and decide what the assistant should do: answer, qualify, book." },
      { title: "Install and connect", text: "We add it to your website and connect it to your CRM or WhatsApp." },
      { title: "Test and launch", text: "We test real questions, tune the answers and go live." },
    ],
    pricing: "quote",
  },
  voice: {
    overview:
      "AI voice agents that answer and make calls in a natural voice: they handle enquiries, qualify leads and book appointments, then send a summary to your team. Voice calling is launching soon.",
    includes: ["Inbound and outbound calls", "Appointment booking during the call", "Call summaries and transcripts", "Malayalam, English and other Indian languages"],
    steps: [
      { title: "Join early access", text: "Tell us your use case and call volume." },
      { title: "We design the agent", text: "Script, voice, booking rules and hand-over to your team." },
      { title: "Pilot and go live", text: "A small pilot first, then full launch." },
    ],
    pricing: "early-access",
  },
  sms: {
    overview:
      "Reliable transactional and promotional SMS (OTPs, order updates, payment and visit reminders, offers and announcements) that reach every phone, even without internet. We handle the TRAI DLT registration and approvals and give you an SMS panel with delivery reports.",
    includes: [
      "DLT registration support with the operators",
      "Sender ID (header) and template approval",
      "SMS panel login with credits and delivery reports",
      "Sending from your workflows and CRM, or in bulk",
      "Charged only for delivered SMS, with 40% of undelivered SMS credited back",
      "24×7 support and monthly delivery reports",
    ],
    steps: [
      {
        title: "DLT registration",
        text: "We register your company on a DLT portal (Jio, Airtel, Vi or BSNL) as a Principal Entity. Once approved, you get an Entity ID (PE ID).",
      },
      {
        title: "Link your PE ID to us",
        text: "On the DLT portal, your PE ID is linked to our Telemarketer ID (PE–TM chain binding). This authorises us to send SMS for you; without it, operators block the messages.",
      },
      { title: "Your SMS panel account", text: "We create your account on our SMS panel, map it to your PE ID, set up your login and add your SMS credits." },
      {
        title: "Sender ID and templates",
        text: "We register your sender name (for example SURABI) and each SMS text, with the changing parts marked, such as “Dear {#var#}, your order {#var#} is confirmed.” Approval usually takes 1–3 days, then we import them into your panel.",
        list: ["Transactional and service sender IDs use 6 letters", "Promotional sender IDs are numeric"],
      },
      { title: "Test and go live", text: "We send a test SMS on every approved template, check delivery on two or more operators and confirm the delivery report. Then you're live." },
    ],
    needs: [
      "Company GST certificate",
      "Company PAN card",
      "ID proof of the authorised person (Aadhaar or PAN)",
      "Authorisation letter on company letterhead, signed and stamped",
      "Business email ID and mobile number for the DLT login",
      "Company website or business proof that matches the brand name",
      "The DLT registration fee, paid by you to the operator",
    ],
    timeline: "Template approval usually takes 1–3 days after DLT registration.",
    pricing: "sms",
  },
  ecommerce: {
    overview:
      "Online stores on your website and inside WhatsApp, with a product catalogue, cart, UPI checkout, order tracking and automatic recovery of abandoned carts, all connected to your inventory and order updates.",
    includes: [
      "Website store, mobile-friendly and fast",
      "WhatsApp catalogue and in-chat ordering",
      "UPI and payment-gateway checkout",
      "Order confirmations and delivery updates on WhatsApp or SMS",
      "Abandoned-cart reminders",
      "Admin panel for products and orders",
    ],
    steps: [
      { title: "Plan your store", text: "Products, categories, delivery areas and payment options." },
      { title: "Build and connect", text: "We build the store and connect payments, WhatsApp and notifications." },
      { title: "Add your products", text: "We help you load products, prices and photos." },
      { title: "Launch", text: "Test orders end-to-end, then go live." },
    ],
    pricing: "quote",
  },
  n8n: {
    overview:
      "Custom n8n workflows that connect the tools you already use (CRM, Google Sheets, payment gateways, email and AI), so data moves on its own and repetitive work disappears. Self-hosted or cloud, built to run without babysitting.",
    includes: [
      "Lead and order sync between apps",
      "Payment webhooks (Razorpay and others)",
      "Google Sheets, Zoho, Gmail, Shopify and any API",
      "AI steps: summaries, classification, replies",
      "Error alerts and monitoring",
    ],
    steps: [
      { title: "Map the process", text: "We list the manual steps and the apps involved." },
      { title: "Build the workflow", text: "We build and connect it in n8n, self-hosted or cloud." },
      { title: "Test with real data", text: "We run real cases and handle the edge cases." },
      { title: "Hand over and support", text: "Documentation, alerts and ongoing support." },
    ],
    pricing: "quote",
  },
  crm: {
    overview:
      "Every lead from your website, WhatsApp, forms and ads lands in your CRM automatically, tagged by source, with follow-ups that run on their own. No lead is lost and nothing is typed twice.",
    includes: [
      "Leads from website, WhatsApp, Instagram, Facebook and ads in one place",
      "Automatic tagging by source and service",
      "Follow-up reminders and messages",
      "Team alerts for new and hot leads",
      "Works with your CRM or ours",
    ],
    steps: [
      { title: "Choose the CRM", text: "Your existing CRM, Google Sheets, or the CRM we provide." },
      { title: "Connect every channel", text: "Website forms, chatbots and ad lead forms feed straight in." },
      { title: "Set follow-ups", text: "Reminders and automatic messages by lead stage." },
      { title: "Go live", text: "Test with real leads, then switch on." },
    ],
    pricing: "quote",
  },
  web: {
    overview:
      "Fast, mobile-friendly websites, landing pages, web apps and portals designed to turn visitors into enquiries, with WhatsApp chat, lead forms and analytics built in, and connected to your chatbots and workflows.",
    includes: [
      "Business websites and landing pages",
      "Web apps, portals and dashboards",
      "SEO-ready, fast and easy to update",
      "WhatsApp chat and lead forms built in",
      "Hosting, domain and SSL setup",
    ],
    steps: [
      { title: "Discover", text: "Your goals, audience, pages and content." },
      { title: "Design", text: "Layouts in your brand, reviewed with you." },
      { title: "Build", text: "Development, content and integrations." },
      { title: "Launch and support", text: "Go live on your domain, with ongoing support." },
    ],
    pricing: "quote",
  },
  app: {
    overview:
      "Custom Android and iOS apps your customers keep on their phones, for bookings, orders and loyalty, with push notifications and an admin panel for your team, connected to your WhatsApp bot and payments.",
    includes: [
      "Android and iOS apps",
      "Bookings, orders and loyalty points",
      "Push notifications",
      "Admin panel for your team",
      "Payments and WhatsApp integration",
    ],
    steps: [
      { title: "Plan the app", text: "Features, screens and who uses it." },
      { title: "Design", text: "App screens in your brand." },
      { title: "Build and test", text: "Development and testing on real devices." },
      { title: "Publish", text: "Play Store and App Store publishing, plus support." },
    ],
    pricing: "quote",
  },
};
