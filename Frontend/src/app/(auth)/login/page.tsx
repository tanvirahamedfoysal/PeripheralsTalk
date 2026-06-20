import type {
  Metadata
} from "next";
import Link from "next/link";

import {
  LoginForm
} from "@/features/auth/components/login-form";

export const metadata: Metadata = {
  title: "Login",
  description:
    "Sign in to your PeripheralsTalk account."
};

interface LoginPageProps {
  searchParams: Promise<{
    callbackUrl?: string | string[];
  }>;
}

export default async function LoginPage({
  searchParams
}: LoginPageProps): Promise<React.ReactElement> {
  const parameters = await searchParams;

  const callbackUrl =
    typeof parameters.callbackUrl === "string"
      ? parameters.callbackUrl
      : undefined;

  return (
    <div className="w-full max-w-[30rem]">
      <Link
        href="/"
        className="eyebrow text-[var(--brand-red)]"
      >
        PeripheralsTalk
      </Link>

      <div className="mt-12">
        <p className="eyebrow text-[var(--text-muted)]">
          Account access
        </p>

        <h1 className="mt-5 text-[clamp(3.5rem,6vw,5.5rem)] leading-[0.88] tracking-[-0.07em]">
          Welcome back.
        </h1>

        <p className="mt-6 max-w-md text-base leading-8 text-[var(--text-secondary)]">
          Sign in to manage your profile, discussions,
          bookmarks and role-based workspace.
        </p>
      </div>

      <div className="mt-10">
        <LoginForm callbackUrl={callbackUrl} />
      </div>
    </div>
  );
}