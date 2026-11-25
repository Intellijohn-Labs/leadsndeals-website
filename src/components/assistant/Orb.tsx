import { cn } from "@/lib/utils";

/**
 * Ira's default face: a living gradient orb. `level` (0–1) swells it while speaking.
 * Pure CSS so it can appear in the nav, chat header and presenter card cheaply.
 */
export default function Orb({
  size = 32,
  className,
  speaking = false,
}: {
  size?: number;
  className?: string;
  speaking?: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn("relative inline-block shrink-0 rounded-full", className)}
      style={{ width: size, height: size }}
    >
      <span
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "conic-gradient(from 0deg, #f2c21b, #ff8a3d, #7b61ff, #3ec6ff, #f2c21b)",
          animation: `orb-spin ${speaking ? 2.2 : 6}s linear infinite`,
          filter: "blur(0.5px)",
        }}
      />
      <span
        className="absolute rounded-full"
        style={{
          inset: "12%",
          background:
            "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.95), rgba(255,255,255,0.15) 38%, rgba(9,9,10,0.05) 62%)",
          mixBlendMode: "screen",
          animation: `orb-breathe ${speaking ? 0.6 : 3.2}s ease-in-out infinite`,
        }}
      />
      <span
        className="absolute inset-0 rounded-full"
        style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.25), inset 0 -6px 14px rgba(0,0,0,0.35)" }}
      />
    </span>
  );
}
