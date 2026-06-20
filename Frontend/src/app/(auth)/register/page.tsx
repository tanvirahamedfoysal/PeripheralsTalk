import type {
  Metadata
} from "next";
import Link from "next/link";

import {
  RegisterForm
} from "@/features/auth/components/register-form";

export const metadata: Metadata = {
  title: "Register",
  description:
    "Create a new PeripheralsTalk account."
};

export default function RegisterPage(): React.ReactElement {
  return (
    <div className="w-full max-w-[30rem]">
      <Link
        href="/"
        className="eyebrow text-[var(--brand-red)]"
      >
        PeripheralsTalk
      </Link>

      <div className="mt-10">
        <p className="eyebrow text-[var(--text-muted)]">
          Community registration
        </p>

        <h1 className="mt-5 text-[clamp(3.5rem,6vw,5.5rem)] leading-[0.88] tracking-[-0.07em]">
          Join the conversation.
        </h1>

        <p className="mt-6 max-w-md text-base leading-8 text-[var(--text-secondary)]">
          Create an account to comment, reply, rate
          peripherals, save bookmarks and request Editor
          access.
        </p>
      </div>

      <div className="mt-9">
        <RegisterForm />
      </div>
    </div>
  );
}