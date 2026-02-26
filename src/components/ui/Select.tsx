"use client";

import { SelectHTMLAttributes, forwardRef, useState } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className = "", id, onFocus, onBlur, ...props }, ref) => {
    const selectId = id || label.toLowerCase().replace(/\s+/g, "-");
    const [focused, setFocused] = useState(false);

    const borderColor = error
      ? "var(--color-dusty-rose, #C86464)"
      : focused
        ? "var(--color-sage, #D4849A)"
        : "color-mix(in srgb, var(--color-warm-gray, #6B6B6B) 30%, transparent)";

    const ringStyle = focused
      ? {
          boxShadow: error
            ? "0 0 0 3px color-mix(in srgb, var(--color-dusty-rose, #C86464) 20%, transparent)"
            : "0 0 0 3px color-mix(in srgb, var(--color-sage, #D4849A) 20%, transparent)",
        }
      : {};

    return (
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={selectId}
          style={{ color: "var(--color-charcoal, #2C2C2C)" }}
          className="text-sm font-semibold"
        >
          {label}
        </label>
        <select
          ref={ref}
          id={selectId}
          className={`rounded-lg px-4 py-3 transition-colors duration-200 focus:outline-none ${className}`}
          style={{
            backgroundColor: "var(--color-surface, #FFFFFF)",
            color: "var(--color-charcoal, #2C2C2C)",
            borderWidth: "1px",
            borderStyle: "solid",
            borderColor,
            ...ringStyle,
          }}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
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
        {error && (
          <p className="text-sm" style={{ color: "var(--color-dusty-rose-dark, #A85050)" }}>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
