import {
  requireAuth
} from "@/lib/auth/require-auth";

export default async function UserDashboardPage(): Promise<React.ReactElement> {
  const session = await requireAuth();

  return (
    <main className="min-h-screen bg-[var(--surface-soft)] p-5 sm:p-10">
      <section className="mx-auto max-w-6xl rounded-[2rem] border border-[var(--border)] bg-white p-8 shadow-card sm:p-12">
        <p className="eyebrow text-[var(--brand-teal)]">
          User dashboard
        </p>

        <h1 className="mt-5 text-5xl">
          Welcome, {session.user.name}
        </h1>

        <div className="mt-8 rounded-3xl bg-[var(--surface-aqua)] p-6">
          <p>
            <strong>Email:</strong>{" "}
            {session.user.email}
          </p>

          <p className="mt-2">
            <strong>Role:</strong>{" "}
            {session.user.role}
          </p>

          <p className="mt-2">
            JWT authentication is connected successfully.
          </p>
        </div>
      </section>
    </main>
  );
}