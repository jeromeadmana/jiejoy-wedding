import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export function Card({
  hover = false,
  className = "",
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={`rounded-2xl bg-white p-6 shadow-sm ${hover ? "transition-shadow duration-300 hover:shadow-md" : ""} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
