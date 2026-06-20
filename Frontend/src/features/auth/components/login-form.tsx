"use client";

import {
  zodResolver
} from "@hookform/resolvers/zod";
import {
  ArrowRight,
  Mail
} from "lucide-react";
import Link from "next/link";
import {
  useForm
} from "react-hook-form";

import {
  PasswordField
} from "@/features/auth/components/password-field";
import {
  useLogin
} from "@/features/auth/hooks/use-login";
import {
  loginSchema,
  type LoginFormValues
} from "@/features/auth/schemas/auth.schema";
import { cn } from "@/lib/utils/cn";

interface LoginFormProps {
  callbackUrl?: string;
}

export function LoginForm({
  callbackUrl
}: LoginFormProps): React.ReactElement {
  const loginMutation = useLogin(callbackUrl);

  const {
    register,
    handleSubmit,
    formState: {
      errors
    }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),

    defaultValues: {
      email: "",
      password: ""
    }
  });

  function submitLogin(
    values: LoginFormValues
  ): void {
    loginMutation.mutate(values);
  }

  return (
    <form
      onSubmit={handleSubmit(submitLogin)}
      className="space-y-6"
      noValidate
    >
      <div className="space-y-2">
        <label
          htmlFor="login-email"
          className="text-sm font-semibold"
        >
          Email address
        </label>

        <div className="relative">
          <input
            id="login-email"
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
        <div className="flex items-center justify-between gap-4">
          <label
            htmlFor="login-password"
            className="text-sm font-semibold"
          >
            Password
          </label>

          <span
            className="cursor-not-allowed text-sm text-[var(--text-muted)]"
            title="Password reset API is not implemented in the supplied backend."
          >
            Forgot password?
          </span>
        </div>

        <PasswordField
          id="login-password"
          autoComplete="current-password"
          placeholder="Enter your password"
          hasError={Boolean(errors.password)}
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
        className="group flex h-14 w-full items-center justify-center gap-3 rounded-full bg-[var(--brand-red)] px-7 font-semibold text-white shadow-card transition-all hover:-translate-y-0.5 hover:shadow-elevated disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loginMutation.isPending
          ? "Signing in..."
          : "Sign in"}

        {!loginMutation.isPending ? (
          <ArrowRight
            size={19}
            aria-hidden="true"
            className="transition-transform group-hover:translate-x-1"
          />
        ) : null}
      </button>

      <p className="text-center text-sm text-[var(--text-muted)]">
        Do not have an account?{" "}
        <Link
          href="/register"
          className="font-semibold text-[var(--brand-teal)] hover:underline"
        >
          Create one
        </Link>
      </p>
    </form>
  );
}