import { SelectHTMLAttributes, forwardRef } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className = "", id, ...props }, ref) => {
    const selectId = id || label.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={selectId}
          className="text-sm font-semibold text-charcoal"
        >
          {label}
        </label>
        <select
          ref={ref}
          id={selectId}
          className={`rounded-lg border border-warm-gray/30 bg-white px-4 py-3 text-charcoal transition-colors duration-200 focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20 ${error ? "border-dusty-rose focus:border-dusty-rose focus:ring-dusty-rose/20" : ""} ${className}`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-sm text-dusty-rose-dark">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
