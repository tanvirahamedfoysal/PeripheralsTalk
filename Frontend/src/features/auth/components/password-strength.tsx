"use client";

import { cn } from "@/lib/utils/cn";

interface PasswordStrengthProps {
  password: string;
}

function getPasswordScore(password: string): number {
  let score = 0;

  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  return score;
}

function getStrengthLabel(score: number): string {
  if (score <= 1) return "Weak";
  if (score <= 3) return "Medium";
  return "Strong";
}

export function PasswordStrength({
  password
}: PasswordStrengthProps): React.ReactElement {
  const score = getPasswordScore(password);
  const label = getStrengthLabel(score);

  return (
    <div className="mt-3 space-y-2">
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, index) => (
          <span
            key={index}
            className={cn(
              "h-1.5 flex-1 rounded-full bg-[var(--border)] transition-colors",
              index < score && score <= 1
                ? "bg-[var(--danger)]"
                : "",
              index < score && score > 1 && score <= 3
                ? "bg-[var(--warning)]"
                : "",
              index < score && score > 3
                ? "bg-[var(--success)]"
                : ""
            )}
          />
        ))}
      </div>

      {password ? (
        <p className="text-xs text-[var(--text-muted)]">
          Password strength:{" "}
          <span className="font-semibold text-[var(--text-primary)]">
            {label}
          </span>
        </p>
      ) : null}
    </div>
  );
}