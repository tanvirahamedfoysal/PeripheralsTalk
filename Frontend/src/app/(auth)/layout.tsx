import type {
  ReactNode
} from "react";

import {
  AuthSidePanel
} from "@/features/auth/components/auth-side-panel";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({
  children
}: AuthLayoutProps): React.ReactElement {
  return (
    <main className="min-h-screen bg-[var(--brand-blush)] p-3 sm:p-6">
      <div className="mx-auto grid min-h-[calc(100vh-1.5rem)] max-w-[100rem] gap-5 lg:grid-cols-[1.08fr_0.92fr]">
        <AuthSidePanel />

        <section className="flex items-center justify-center rounded-[2.5rem] border border-[var(--border)] bg-white px-6 py-12 shadow-soft sm:px-12 lg:px-16">
          {children}
        </section>
      </div>
    </main>
  );
}