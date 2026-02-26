"use client";

import { ButtonHTMLAttributes, CSSProperties } from "react";

type ButtonVariant = "primary" | "secondary" | "accent";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantStyles: Record<
  ButtonVariant,
  {
    className: string;
    style: CSSProperties;
    hoverStyle: CSSProperties;
    resetStyle: CSSProperties;
  }
> = {
  primary: {
    className: "text-white",
    style: { backgroundColor: "var(--color-charcoal, #2C2C2C)" },
    hoverStyle: { backgroundColor: "var(--color-warm-gray, #6B6B6B)" },
    resetStyle: { backgroundColor: "var(--color-charcoal, #2C2C2C)" },
  },
  secondary: {
    className: "border-2",
    style: {
      borderColor: "var(--color-charcoal, #2C2C2C)",
      color: "var(--color-charcoal, #2C2C2C)",
    },
    hoverStyle: {
      backgroundColor: "var(--color-charcoal, #2C2C2C)",
      color: "#fff",
    },
    resetStyle: {
      backgroundColor: "",
      color: "var(--color-charcoal, #2C2C2C)",
    },
  },
  accent: {
    className: "text-white",
    style: { backgroundColor: "var(--color-dusty-rose, #C86464)" },
    hoverStyle: { backgroundColor: "var(--color-dusty-rose-dark, #A85050)" },
    resetStyle: { backgroundColor: "var(--color-dusty-rose, #C86464)" },
  },
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-lg",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  style: styleProp,
  children,
  onMouseEnter,
  onMouseLeave,
  ...props
}: ButtonProps) {
  const v = variantStyles[variant];

  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg font-sans font-semibold tracking-wide transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-cream disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${v.className} ${sizeClasses[size]} ${className}`}
      style={{ ...v.style, ...styleProp }}
      onMouseEnter={(e) => {
        Object.assign(e.currentTarget.style, v.hoverStyle);
        onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        Object.assign(e.currentTarget.style, v.resetStyle);
        onMouseLeave?.(e);
      }}
      {...props}
    >
      {children}
    </button>
  );
}
