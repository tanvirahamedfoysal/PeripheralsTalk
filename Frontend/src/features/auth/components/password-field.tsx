"use client";

import {
  Eye,
  EyeOff
} from "lucide-react";
import {
  forwardRef,
  useState,
  type InputHTMLAttributes
} from "react";

import { cn } from "@/lib/utils/cn";

interface PasswordFieldProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "type"
  > {
  hasError?: boolean;
}

export const PasswordField = forwardRef<
  HTMLInputElement,
  PasswordFieldProps
>(function PasswordField(
  {
    className,
    hasError = false,
    ...inputProperties
  },
  reference
) {
  const [showPassword, setShowPassword] =
    useState(false);

  return (
    <div className="relative">
      <input
        {...inputProperties}
        ref={reference}
        type={showPassword ? "text" : "password"}
        className={cn(
          "h-14 w-full rounded-full border bg-white px-5 pr-14 text-sm text-[var(--text-primary)] outline-none transition-all",
          "placeholder:text-[var(--text-muted)]",
          "focus:border-[var(--brand-teal)] focus:ring-4 focus:ring-[var(--brand-aqua)]/25",
          hasError
            ? "border-[var(--danger)]"
            : "border-[var(--border)]",
          className
        )}
      />

      <button
        type="button"
        onClick={() => {
          setShowPassword((currentValue) => !currentValue);
        }}
        className="absolute top-1/2 right-5 -translate-y-1/2 text-[var(--text-muted)] transition-colors hover:text-[var(--brand-teal)]"
        aria-label={
          showPassword
            ? "Hide password"
            : "Show password"
        }
      >
        {showPassword ? (
          <EyeOff size={19} aria-hidden="true" />
        ) : (
          <Eye size={19} aria-hidden="true" />
        )}
      </button>
    </div>
  );
});