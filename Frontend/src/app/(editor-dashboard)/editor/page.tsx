import { requireRole } from "@/lib/auth/require-role";

export default async function EditorDashboardPage(): Promise<React.ReactElement> {
  const session = await requireRole("EDITOR");

  return (
    <main className="min-h-screen bg-[var(--surface-soft)] p-8">
      <section className="rounded-[2rem] border border-[var(--border)] bg-white p-8 shadow-card">
        <p className="eyebrow text-[var(--brand-aqua)]">
          Editor dashboard
        </p>

        <h1 className="mt-4 dashboard-heading">
          Welcome, {session.user.username}
        </h1>

        <p className="mt-4 text-[var(--text-secondary)]">
          Editor role protection is active.
        </p>
      </section>
    </main>
  );
}