"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { useApp } from "@/components/providers/Providers";

const ease = [0.16, 1, 0.3, 1] as const;

/**
 * Bonus — Text mask animation.
 * Each line slides up from behind its own mask. `lines` keeps line breaks
 * intentional; `play` lets the hero wait for the loader.
 */
export default function TextMask({
  lines,
  as: Tag = "h2",
  className,
  lineClassName,
  delay = 0,
  stagger = 0.09,
  play,
}: {
  lines: React.ReactNode[];
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
  lineClassName?: string;
  delay?: number;
  stagger?: number;
  /** undefined = animate when scrolled into view */
  play?: boolean;
}) {
  const { introDone } = useApp();
  const MotionTag = motion[Tag];
  const controlled = play !== undefined;
  const active = introDone && (controlled ? play : true);

  return (
    <MotionTag
      className={className}
      initial="hidden"
      {...(controlled
        ? { animate: active ? "show" : "hidden" }
        : { whileInView: active ? "show" : undefined, viewport: { once: true, amount: 0.4 } })}
      transition={{ staggerChildren: stagger, delayChildren: delay }}
    >
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.08em] -mb-[0.08em]">
          <motion.span
            className={cn("block", lineClassName)}
            variants={{
              hidden: { y: "112%", rotate: 2 },
              show: { y: "0%", rotate: 0, transition: { duration: 1.05, ease } },
            }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </MotionTag>
  );
}
