import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    const inputId = id || label.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={inputId}
          className="text-sm font-semibold text-charcoal"
        >
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          className={`rounded-lg border border-warm-gray/30 bg-surface px-4 py-3 text-charcoal placeholder:text-warm-gray/50 transition-colors duration-200 focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20 ${error ? "border-dusty-rose focus:border-dusty-rose focus:ring-dusty-rose/20" : ""} ${className}`}
          {...props}
        />
        {error && <p className="text-sm text-dusty-rose-dark">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
