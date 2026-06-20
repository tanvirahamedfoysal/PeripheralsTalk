"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Mail, User } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";

import { PasswordField } from "@/features/auth/components/password-field";
import { PasswordStrength } from "@/features/auth/components/password-strength";
import { useRegister } from "@/features/auth/hooks/use-register";
import {
  registerSchema,
  type RegisterSchemaInput
} from "@/features/auth/schemas/auth.schema";
import { cn } from "@/lib/utils/cn";

export function RegisterForm(): React.ReactElement {
  const registerMutation = useRegister();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<RegisterSchemaInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: ""
    }
  });

  const password = watch("password");

  function onSubmit(values: RegisterSchemaInput): void {
    registerMutation.mutate(values);
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full space-y-5"
      noValidate
    >
      <div className="space-y-2">
        <label
          htmlFor="name"
          className="text-sm font-semibold text-[var(--text-primary)]"
        >
          Full name
        </label>

        <div className="relative">
          <input
            id="name"
            type="text"
            autoComplete="name"
            placeholder="Md Mahruf Alam"
            aria-invalid={Boolean(errors.name)}
            {...register("name")}
            className={cn(
              "h-12 w-full rounded-full border bg-white px-5 pr-12 text-sm text-[var(--text-primary)] outline-none transition",
              "placeholder:text-[var(--text-muted)]",
              "focus:border-[var(--brand-teal)] focus:ring-4 focus:ring-[var(--brand-aqua)]/25",
              errors.name
                ? "border-[var(--danger)]"
                : "border-[var(--border)]"
            )}
          />

          <User
            size={18}
            aria-hidden="true"
            className="absolute top-1/2 right-4 -translate-y-1/2 text-[var(--text-muted)]"
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
          htmlFor="email"
          className="text-sm font-semibold text-[var(--text-primary)]"
        >
          Email address
        </label>

        <div className="relative">
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={Boolean(errors.email)}
            {...register("email")}
            className={cn(
              "h-12 w-full rounded-full border bg-white px-5 pr-12 text-sm text-[var(--text-primary)] outline-none transition",
              "placeholder:text-[var(--text-muted)]",
              "focus:border-[var(--brand-teal)] focus:ring-4 focus:ring-[var(--brand-aqua)]/25",
              errors.email
                ? "border-[var(--danger)]"
                : "border-[var(--border)]"
            )}
          />

          <Mail
            size={18}
            aria-hidden="true"
            className="absolute top-1/2 right-4 -translate-y-1/2 text-[var(--text-muted)]"
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
          htmlFor="password"
          className="text-sm font-semibold text-[var(--text-primary)]"
        >
          Password
        </label>

        <PasswordField
          id="password"
          autoComplete="new-password"
          placeholder="Create a strong password"
          error={Boolean(errors.password)}
          aria-invalid={Boolean(errors.password)}
          {...register("password")}
        />

        <PasswordStrength password={password} />

        {errors.password ? (
          <p className="text-sm text-[var(--danger)]">
            {errors.password.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="confirmPassword"
          className="text-sm font-semibold text-[var(--text-primary)]"
        >
          Confirm password
        </label>

        <PasswordField
          id="confirmPassword"
          autoComplete="new-password"
          placeholder="Confirm your password"
          error={Boolean(errors.confirmPassword)}
          aria-invalid={Boolean(errors.confirmPassword)}
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
        className="focus-ring group inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--brand-red)] px-6 font-semibold text-white shadow-card transition hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-70"
      >
        {registerMutation.isPending
          ? "Creating account..."
          : "Create account"}

        <ArrowRight
          size={18}
          aria-hidden="true"
          className="transition-transform group-hover:translate-x-1"
        />
      </button>

      <p className="text-center text-sm text-[var(--text-muted)]">
        Already have an account?{" "}
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