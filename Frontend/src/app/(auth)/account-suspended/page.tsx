import type {
  Metadata
} from "next";
import {
  ShieldX
} from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Account suspended"
};

export default function AccountSuspendedPage(): React.ReactElement {
  return (
    <div className="w-full max-w-[30rem]">
      <span className="flex size-16 items-center justify-center rounded-full bg-[var(--danger-soft)] text-[var(--danger)]">
        <ShieldX size={30} aria-hidden="true" />
      </span>

      <p className="eyebrow mt-9 text-[var(--danger)]">
        Access unavailable
      </p>

      <h1 className="mt-5 text-6xl leading-[0.9] tracking-[-0.065em]">
        Account suspended.
      </h1>

      <p className="mt-6 text-base leading-8 text-[var(--text-secondary)]">
        An administrator has suspended this account. You
        cannot access your dashboard until the account is
        activated again.
      </p>

      <Link
        href="/login"
        className="mt-9 inline-flex h-14 items-center justify-center rounded-full bg-[var(--brand-red)] px-7 font-semibold text-white"
      >
        Return to login
      </Link>
    </div>
  );
}