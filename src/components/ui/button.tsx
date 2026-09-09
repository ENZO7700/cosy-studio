import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors duration-(--motion-fast,250ms) disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 min-h-11 px-4",
  {
    variants: {
      variant: {
        primary: "bg-accent text-canvas hover:bg-accent-strong",
        secondary:
          "bg-elevated text-fg shadow-[0_0_0_1px_var(--color-line)] hover:bg-panel",
        ghost: "text-muted hover:text-fg hover:bg-elevated",
        danger: "bg-danger text-canvas hover:opacity-90",
      },
    },
    defaultVariants: { variant: "primary" },
  },
);

export function Button({
  className,
  variant,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>) {
  return <button className={cn(buttonVariants({ variant }), className)} {...props} />;
}
