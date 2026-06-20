import {
  requireRole
} from "@/lib/auth/require-role";

export default async function AdminDashboardPage(): Promise<React.ReactElement> {
  const session = await requireRole("ADMIN");

  return (
    <main className="min-h-screen bg-[var(--surface-soft)] p-5 sm:p-10">
      <section className="mx-auto max-w-6xl rounded-[2rem] border border-[var(--border)] bg-white p-8 shadow-card sm:p-12">
        <p className="eyebrow text-[var(--brand-red)]">
          Admin dashboard
        </p>

        <h1 className="mt-5 text-5xl">
          Welcome, {session.user.name}
        </h1>

        <p className="mt-6 text-[var(--text-secondary)]">
          JWT authentication and Admin role protection are
          working.
        </p>
      </section>
    </main>
  );
}