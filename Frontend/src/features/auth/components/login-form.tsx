"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Mail } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";

import { PasswordField } from "@/features/auth/components/password-field";
import { useLogin } from "@/features/auth/hooks/use-login";
import {
  loginSchema,
  type LoginSchemaInput
} from "@/features/auth/schemas/auth.schema";
import { cn } from "@/lib/utils/cn";

export function LoginForm(): React.ReactElement {
  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginSchemaInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  function onSubmit(values: LoginSchemaInput): void {
    loginMutation.mutate(values);
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full space-y-6"
      noValidate
    >
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
        <div className="flex items-center justify-between gap-4">
          <label
            htmlFor="password"
            className="text-sm font-semibold text-[var(--text-primary)]"
          >
            Password
          </label>

          <Link
            href="/forgot-password"
            className="text-sm font-semibold text-[var(--brand-red)] hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <PasswordField
          id="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          error={Boolean(errors.password)}
          aria-invalid={Boolean(errors.password)}
          {...register("password")}
        />

        {errors.password ? (
          <p className="text-sm text-[var(--danger)]">
            {errors.password.message}
          </p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={loginMutation.isPending}
        className="focus-ring group inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--brand-red)] px-6 font-semibold text-white shadow-card transition hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-70"
      >
        {loginMutation.isPending ? "Signing in..." : "Sign in"}

        <ArrowRight
          size={18}
          aria-hidden="true"
          className="transition-transform group-hover:translate-x-1"
        />
      </button>

      <p className="text-center text-sm text-[var(--text-muted)]">
        New to PeripheralsTalk?{" "}
        <Link
          href="/register"
          className="font-semibold text-[var(--brand-teal)] hover:underline"
        >
          Create an account
        </Link>
      </p>
    </form>
  );
}