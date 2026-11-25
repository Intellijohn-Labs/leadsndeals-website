import { assistant } from "@/config/site";
import { cn } from "@/lib/utils";
import Orb from "./Orb";

/**
 * Round presenter avatar for chat bubbles, the nav button and the minimised bubble.
 * Shows her head-to-chest (not a tight face crop) on the same soft panel as the card.
 * Falls back to the orb when no portrait is configured.
 */
export default function Avatar({ size = 32, className, speaking }: { size?: number; className?: string; speaking?: boolean }) {
  if (!assistant.portrait) return <Orb size={size} className={className} speaking={speaking} />;
  return (
    <span
      aria-hidden="true"
      className={cn("relative inline-block shrink-0 overflow-hidden rounded-full ring-1 ring-white/25", className)}
      style={{
        width: size,
        height: size,
        background: `url(${assistant.portrait}) 50% 2% / 118% auto no-repeat, radial-gradient(circle at 30% 30%, #c9bfff, #ececf1 55%, #ffd1e6)`,
      }}
    >
      {speaking && <span className="absolute -inset-0.5 animate-ping rounded-full border border-brand/60" />}
    </span>
  );
}
