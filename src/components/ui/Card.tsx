import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export function Card({
  hover = false,
  className = "",
  style: styleProp,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={`rounded-2xl p-6 shadow-sm ${hover ? "transition-shadow duration-300 hover:shadow-md" : ""} ${className}`}
      style={{
        backgroundColor: "var(--color-surface, #FFFFFF)",
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: "color-mix(in srgb, var(--color-warm-gray, #6B6B6B) 10%, transparent)",
        ...styleProp,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
