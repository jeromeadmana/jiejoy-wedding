"use client";

import { ButtonHTMLAttributes, CSSProperties } from "react";

type ButtonVariant = "primary" | "secondary" | "accent";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantStyles: Record<ButtonVariant, { className: string; style: CSSProperties }> = {
  primary: {
    className: "text-white",
    style: { backgroundColor: "var(--color-sage, #D4849A)" },
  },
  secondary: {
    className: "border-2 hover:text-white",
    style: {
      borderColor: "var(--color-sage, #D4849A)",
      color: "var(--color-sage, #D4849A)",
    },
  },
  accent: {
    className: "text-white",
    style: { backgroundColor: "var(--color-dusty-rose, #C86464)" },
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
  const { className: variantClass, style: variantStyle } = variantStyles[variant];

  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg font-sans font-semibold tracking-wide transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-cream disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${variantClass} ${sizeClasses[size]} ${className}`}
      style={{ ...variantStyle, ...styleProp }}
      onMouseEnter={(e) => {
        if (variant === "secondary") {
          e.currentTarget.style.backgroundColor = "var(--color-sage-dark, #C06E84)";
          e.currentTarget.style.color = "#fff";
        } else if (variant === "primary") {
          e.currentTarget.style.backgroundColor = "var(--color-sage-dark, #C06E84)";
        } else if (variant === "accent") {
          e.currentTarget.style.backgroundColor = "var(--color-dusty-rose-dark, #A85050)";
        }
        onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        if (variant === "secondary") {
          e.currentTarget.style.backgroundColor = "";
          e.currentTarget.style.color = "var(--color-sage, #D4849A)";
        } else if (variant === "primary") {
          e.currentTarget.style.backgroundColor = "var(--color-sage, #D4849A)";
        } else if (variant === "accent") {
          e.currentTarget.style.backgroundColor = "var(--color-dusty-rose, #C86464)";
        }
        onMouseLeave?.(e);
      }}
      {...props}
    >
      {children}
    </button>
  );
}
