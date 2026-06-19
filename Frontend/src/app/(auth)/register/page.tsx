import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { RegisterForm } from "@/features/auth/components/register-form";
import { getSession } from "@/lib/auth/get-session";
import { getDefaultRouteForRole } from "@/lib/auth/role-routes";

export const metadata: Metadata = {
  title: "Register",
  description: "Create your PeripheralsTalk account."
};

export default async function RegisterPage(): Promise<React.ReactElement> {
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
          Join the archive
        </p>

        <h1 className="mt-4 text-5xl leading-[0.95] tracking-[-0.055em] text-[var(--text-primary)]">
          Create your account.
        </h1>

        <p className="mt-5 text-sm leading-7 text-[var(--text-secondary)]">
          Register to comment, rate peripherals, save bookmarks and
          request Editor access later.
        </p>
      </div>

      <div className="mt-10">
        <RegisterForm />
      </div>
    </div>
  );
}