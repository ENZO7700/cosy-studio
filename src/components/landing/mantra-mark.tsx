import { cn } from "@/lib/utils";

const BEATS = [
  { id: "scanuj", x: 1, y: 1, gold: false },
  { id: "skaluj", x: 17, y: 1, gold: true },
  { id: "sleep", x: 1, y: 17, gold: false },
  { id: "repeat", x: 17, y: 17, gold: true },
] as const;

type Props = {
  size?: number;
  className?: string;
  title?: string;
};

/** 2×2 identity mark for SKENUJ ŠKÁLUJ SPI OPAKUJ. */
export function MantraMark({
  size = 32,
  className,
  title = "Skenuj Škáluj Spi Opakuj",
}: Props) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      role="img"
      aria-label={title}
      data-testid="mantra-mark"
    >
      <title>{title}</title>
      {BEATS.map((beat) => (
        <rect
          key={beat.id}
          data-beat={beat.id}
          x={beat.x}
          y={beat.y}
          width="14"
          height="14"
          rx="2.5"
          fill={beat.gold ? "var(--color-gold, var(--color-accent))" : "currentColor"}
          opacity={beat.gold ? 1 : 0.92}
        />
      ))}
    </svg>
  );
}
