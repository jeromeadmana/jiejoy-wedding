interface BadgeProps {
  variant: "success" | "danger" | "neutral";
  children: React.ReactNode;
}

const variantClasses = {
  success: "bg-sage/10 text-sage-dark",
  danger: "bg-dusty-rose/10 text-dusty-rose-dark",
  neutral: "bg-warm-gray/10 text-warm-gray",
};

export function Badge({ variant, children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${variantClasses[variant]}`}
    >
      {children}
    </span>
  );
}
