import { CSSProperties } from "react";

interface BadgeProps {
  variant: "success" | "danger" | "neutral";
  children: React.ReactNode;
}

const variantStyles: Record<BadgeProps["variant"], CSSProperties> = {
  success: {
    backgroundColor: "color-mix(in srgb, var(--color-sage, #D4849A) 15%, transparent)",
    color: "var(--color-sage-dark, #C06E84)",
  },
  danger: {
    backgroundColor: "color-mix(in srgb, var(--color-dusty-rose, #C86464) 15%, transparent)",
    color: "var(--color-dusty-rose-dark, #A85050)",
  },
  neutral: {
    backgroundColor: "color-mix(in srgb, var(--color-warm-gray, #6B6B6B) 15%, transparent)",
    color: "var(--color-warm-gray, #6B6B6B)",
  },
};

export function Badge({ variant, children }: BadgeProps) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
      style={variantStyles[variant]}
    >
      {children}
    </span>
  );
}
