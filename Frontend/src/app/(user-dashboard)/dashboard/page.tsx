import { requireAuth } from "@/lib/auth/require-auth";

export default async function UserDashboardPage(): Promise<React.ReactElement> {
  const session = await requireAuth();

  return (
    <main className="min-h-screen bg-[var(--surface-soft)] p-8">
      <section className="rounded-[2rem] border border-[var(--border)] bg-white p-8 shadow-card">
        <p className="eyebrow text-[var(--brand-teal)]">
          User dashboard
        </p>

        <h1 className="mt-4 dashboard-heading">
          Welcome, {session.user.username}
        </h1>

        <p className="mt-4 text-[var(--text-secondary)]">
          JWT login connection is working. This page is protected
          by the frontend session cookie.
        </p>
      </section>
    </main>
  );
}