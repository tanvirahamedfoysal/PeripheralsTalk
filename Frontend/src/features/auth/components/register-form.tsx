"use client";

import {
  zodResolver
} from "@hookform/resolvers/zod";
import {
  ArrowRight,
  Mail,
  UserRound
} from "lucide-react";
import Link from "next/link";
import {
  useForm
} from "react-hook-form";

import {
  PasswordField
} from "@/features/auth/components/password-field";
import {
  useRegister
} from "@/features/auth/hooks/use-register";
import {
  registerSchema,
  type RegisterFormValues
} from "@/features/auth/schemas/auth.schema";
import { cn } from "@/lib/utils/cn";

export function RegisterForm(): React.ReactElement {
  const registerMutation = useRegister();

  const {
    register,
    handleSubmit,
    watch,
    formState: {
      errors
    }
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),

    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: ""
    }
  });

  const password = watch("password");

  function submitRegistration(
    values: RegisterFormValues
  ): void {
    registerMutation.mutate(values);
  }

  return (
    <form
      onSubmit={handleSubmit(submitRegistration)}
      className="space-y-5"
      noValidate
    >
      <div className="space-y-2">
        <label
          htmlFor="register-name"
          className="text-sm font-semibold"
        >
          Full name
        </label>

        <div className="relative">
          <input
            id="register-name"
            type="text"
            autoComplete="name"
            placeholder="Your full name"
            aria-invalid={Boolean(errors.name)}
            {...register("name")}
            className={cn(
              "h-14 w-full rounded-full border bg-white px-5 pr-14 text-sm outline-none transition-all",
              "placeholder:text-[var(--text-muted)]",
              "focus:border-[var(--brand-teal)] focus:ring-4 focus:ring-[var(--brand-aqua)]/25",
              errors.name
                ? "border-[var(--danger)]"
                : "border-[var(--border)]"
            )}
          />

          <UserRound
            size={19}
            aria-hidden="true"
            className="absolute top-1/2 right-5 -translate-y-1/2 text-[var(--text-muted)]"
          />
        </div>

        {errors.name ? (
          <p className="text-sm text-[var(--danger)]">
            {errors.name.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="register-email"
          className="text-sm font-semibold"
        >
          Email address
        </label>

        <div className="relative">
          <input
            id="register-email"
            type="email"
            autoComplete="email"
            placeholder="name@example.com"
            aria-invalid={Boolean(errors.email)}
            {...register("email")}
            className={cn(
              "h-14 w-full rounded-full border bg-white px-5 pr-14 text-sm outline-none transition-all",
              "placeholder:text-[var(--text-muted)]",
              "focus:border-[var(--brand-teal)] focus:ring-4 focus:ring-[var(--brand-aqua)]/25",
              errors.email
                ? "border-[var(--danger)]"
                : "border-[var(--border)]"
            )}
          />

          <Mail
            size={19}
            aria-hidden="true"
            className="absolute top-1/2 right-5 -translate-y-1/2 text-[var(--text-muted)]"
          />
        </div>

        {errors.email ? (
          <p className="text-sm text-[var(--danger)]">
            {errors.email.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="register-password"
          className="text-sm font-semibold"
        >
          Password
        </label>

        <PasswordField
          id="register-password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          hasError={Boolean(errors.password)}
          aria-invalid={Boolean(errors.password)}
          {...register("password")}
        />

        <PasswordStrengthIndicator
          password={password}
        />

        {errors.password ? (
          <p className="text-sm text-[var(--danger)]">
            {errors.password.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="register-confirm-password"
          className="text-sm font-semibold"
        >
          Confirm password
        </label>

        <PasswordField
          id="register-confirm-password"
          autoComplete="new-password"
          placeholder="Enter the password again"
          hasError={Boolean(errors.confirmPassword)}
          aria-invalid={Boolean(
            errors.confirmPassword
          )}
          {...register("confirmPassword")}
        />

        {errors.confirmPassword ? (
          <p className="text-sm text-[var(--danger)]">
            {errors.confirmPassword.message}
          </p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={registerMutation.isPending}
        className="group flex h-14 w-full items-center justify-center gap-3 rounded-full bg-[var(--brand-red)] px-7 font-semibold text-white shadow-card transition-all hover:-translate-y-0.5 hover:shadow-elevated disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {registerMutation.isPending
          ? "Creating account..."
          : "Create account"}

        {!registerMutation.isPending ? (
          <ArrowRight
            size={19}
            aria-hidden="true"
            className="transition-transform group-hover:translate-x-1"
          />
        ) : null}
      </button>

      <p className="text-center text-sm text-[var(--text-muted)]">
        Already registered?{" "}
        <Link
          href="/login"
          className="font-semibold text-[var(--brand-teal)] hover:underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}

interface PasswordStrengthIndicatorProps {
  password: string;
}

function PasswordStrengthIndicator({
  password
}: PasswordStrengthIndicatorProps): React.ReactElement {
  const strengthChecks = [
    password.length >= 8,
    /[a-z]/.test(password),
    /[A-Z]/.test(password),
    /[0-9]/.test(password)
  ];

  const score = strengthChecks.filter(Boolean).length;

  const strengthLabel =
    score <= 1
      ? "Weak"
      : score <= 3
        ? "Moderate"
        : "Strong";

  return (
    <div className="space-y-2 pt-1">
      <div className="flex gap-1.5">
        {Array.from({
          length: 4
        }).map((_, index) => (
          <span
            key={index}
            className={cn(
              "h-1.5 flex-1 rounded-full bg-[var(--border)] transition-colors",

              index < score && score <= 1
                ? "bg-[var(--danger)]"
                : "",

              index < score &&
                score > 1 &&
                score <= 3
                ? "bg-[var(--warning)]"
                : "",

              index < score && score === 4
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
            {strengthLabel}
          </span>
        </p>
      ) : null}
    </div>
  );
}