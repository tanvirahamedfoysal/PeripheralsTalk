"use client";

import { Eye, EyeOff } from "lucide-react";
import {
  forwardRef,
  useState,
  type InputHTMLAttributes
} from "react";

import { cn } from "@/lib/utils/cn";

interface PasswordFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  error?: boolean;
}

export const PasswordField = forwardRef<
  HTMLInputElement,
  PasswordFieldProps
>(({ className, error, ...props }, ref) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative">
      <input
        {...props}
        ref={ref}
        type={isVisible ? "text" : "password"}
        className={cn(
          "h-12 w-full rounded-full border bg-white px-5 pr-12 text-sm text-[var(--text-primary)] outline-none transition",
          "placeholder:text-[var(--text-muted)]",
          "focus:border-[var(--brand-teal)] focus:ring-4 focus:ring-[var(--brand-aqua)]/25",
          error
            ? "border-[var(--danger)]"
            : "border-[var(--border)]",
          className
        )}
      />

      <button
        type="button"
        onClick={() => setIsVisible((value) => !value)}
        className="absolute top-1/2 right-4 -translate-y-1/2 text-[var(--text-muted)] transition hover:text-[var(--brand-teal)]"
        aria-label={
          isVisible ? "Hide password" : "Show password"
        }
      >
        {isVisible ? (
          <EyeOff size={18} aria-hidden="true" />
        ) : (
          <Eye size={18} aria-hidden="true" />
        )}
      </button>
    </div>
  );
});

PasswordField.displayName = "PasswordField";