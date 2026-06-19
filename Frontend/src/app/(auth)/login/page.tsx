import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { LoginForm } from "@/features/auth/components/login-form";
import { getSession } from "@/lib/auth/get-session";
import { getDefaultRouteForRole } from "@/lib/auth/role-routes";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to your PeripheralsTalk account."
};

export default async function LoginPage(): Promise<React.ReactElement> {
  const session = await getSession();

  if (session) {
    redirect(getDefaultRouteForRole(session.user.role));
  }

  return (
    <div className="w-full max-w-md">
      <Link
        href="/"
        className="eyebrow text-[var(--brand-red)]"
      >
        PeripheralsTalk
      </Link>

      <div className="mt-10">
        <p className="eyebrow text-[var(--text-muted)]">
          Welcome back
        </p>

        <h1 className="mt-4 text-5xl leading-[0.95] tracking-[-0.055em] text-[var(--text-primary)]">
          Sign in to continue.
        </h1>

        <p className="mt-5 text-sm leading-7 text-[var(--text-secondary)]">
          Access your dashboard, bookmarks, comments, ratings and
          role-based workspace.
        </p>
      </div>

      <div className="mt-10">
        <LoginForm />
      </div>
    </div>
  );
}