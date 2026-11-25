"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * Effect 05 — Micro interaction.
 * Magnet button: the button and its label follow the cursor at different
 * strengths, then spring back. Primary variant adds a hover pulse ring.
 */
type Variant = "primary" | "ghost" | "dark" | "light";

const styles: Record<Variant, string> = {
  primary: "bg-brand text-ink hover:bg-brand-2",
  ghost: "border border-white/15 text-fg hover:border-white/40 bg-white/[0.02]",
  dark: "bg-paper-ink text-paper hover:bg-black",
  light: "bg-fg text-ink hover:bg-white",
};

const spring = { stiffness: 260, damping: 18, mass: 0.6 };

export default function MagneticButton({
  children,
  href,
  onClick,
  variant = "primary",
  className,
  type = "button",
  disabled,
  target,
  pulse = variant === "primary",
  strength = 0.32,
  ariaLabel,
}: {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: Variant;
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  target?: string;
  pulse?: boolean;
  strength?: number;
  ariaLabel?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useSpring(useMotionValue(0), spring);
  const y = useSpring(useMotionValue(0), spring);
  const tx = useSpring(useMotionValue(0), spring);
  const ty = useSpring(useMotionValue(0), spring);

  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    x.set(dx * strength);
    y.set(dy * strength);
    tx.set(dx * strength * 0.45);
    ty.set(dy * strength * 0.45);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
    tx.set(0);
    ty.set(0);
  };

  const cls = cn(
    "group relative inline-flex items-center justify-center gap-2 rounded-full px-6 h-12 text-[15px] font-medium tracking-tight transition-colors duration-300 select-none",
    styles[variant],
    disabled && "opacity-50 pointer-events-none",
    className,
  );

  const inner = (
    <>
      {pulse && <span className="pulse-ring" />}
      <motion.span style={{ x: tx, y: ty }} className="relative z-10 inline-flex items-center gap-2">
        {children}
      </motion.span>
    </>
  );

  return (
    <motion.div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={reset}
      style={{ x, y }}
      className="inline-block p-2 -m-2"
    >
      {href ? (
        <a
          href={href}
          target={target}
          rel={target === "_blank" ? "noopener noreferrer" : undefined}
          onClick={onClick}
          className={cls}
          aria-label={ariaLabel}
        >
          {inner}
        </a>
      ) : (
        <button type={type} onClick={onClick} disabled={disabled} className={cls} aria-label={ariaLabel}>
          {inner}
        </button>
      )}
    </motion.div>
  );
}
