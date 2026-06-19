import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Account suspended",
  description: "Your PeripheralsTalk account is suspended."
};

export default function AccountSuspendedPage(): React.ReactElement {
  return (
    <div className="w-full max-w-md">
      <Link
        href="/"
        className="eyebrow text-[var(--brand-red)]"
      >
        PeripheralsTalk
      </Link>

      <div className="mt-10 rounded-[2rem] border border-[var(--danger)]/20 bg-[var(--danger-soft)] p-8">
        <p className="eyebrow text-[var(--danger)]">
          Account suspended
        </p>

        <h1 className="mt-4 text-5xl leading-[0.95] tracking-[-0.055em] text-[var(--text-primary)]">
          This account cannot sign in.
        </h1>

        <p className="mt-5 text-sm leading-7 text-[var(--text-secondary)]">
          Your account has been suspended by an administrator. Contact
          the platform owner if you believe this is a mistake.
        </p>

        <Link
          href="/login"
          className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-[var(--brand-red)] px-6 font-semibold text-white"
        >
          Back to login
        </Link>
      </div>
    </div>
  );
}