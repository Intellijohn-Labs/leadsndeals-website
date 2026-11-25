import { CodeXml, Globe, PhoneCall, ShoppingBag, MessageSquareText, Smartphone, DatabaseZap } from "lucide-react";
import type { ServiceKey } from "@/config/site";
import { InstagramIcon, N8nIcon, WhatsAppIcon } from "./BrandIcons";

export default function ServiceIcon({ k, className }: { k: ServiceKey; className?: string }) {
  switch (k) {
    case "whatsapp":
      return <WhatsAppIcon className={className} />;
    case "social":
      return <InstagramIcon className={className} />;
    case "webchat":
      return <Globe className={className} strokeWidth={1.8} />;
    case "voice":
      return <PhoneCall className={className} strokeWidth={1.8} />;
    case "sms":
      return <MessageSquareText className={className} strokeWidth={1.8} />;
    case "ecommerce":
      return <ShoppingBag className={className} strokeWidth={1.8} />;
    case "n8n":
      return <N8nIcon className={className} />;
    case "web":
      return <CodeXml className={className} strokeWidth={1.8} />;
    case "crm":
      return <DatabaseZap className={className} strokeWidth={1.8} />;
    case "app":
      return <Smartphone className={className} strokeWidth={1.8} />;
  }
}
