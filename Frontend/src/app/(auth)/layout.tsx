import type { ReactNode } from "react";

import { AuthSidePanel } from "@/features/auth/components/auth-side-panel";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({
  children
}: AuthLayoutProps): React.ReactElement {
  return (
    <main className="min-h-screen bg-[var(--brand-blush)] px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] w-full max-w-7xl grid-cols-1 gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <AuthSidePanel />

        <section className="flex items-center justify-center rounded-[2rem] border border-[var(--border)] bg-white p-6 shadow-soft sm:p-10">
          {children}
        </section>
      </div>
    </main>
  );
}