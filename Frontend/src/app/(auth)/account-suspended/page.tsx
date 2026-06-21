import Link from "next/link";
import { Home, LogIn } from "lucide-react";

export default function SuspendedPage() {
  return (
    <main className="centered-page">
      <section className="surface centered-card">
        <p className="eyebrow" style={{ color: "var(--red)" }}>
          Account suspended
        </p>
        <h1 className="section-title">Access is currently unavailable.</h1>
        <p className="muted">
          This account is currently inactive. Please contact an administrator to restore
          access before signing in again.
        </p>
        <div className="actions">
          <Link href="/" className="button ghost">
            <Home size={17} /> Home
          </Link>
          <Link href="/login" className="button red">
            <LogIn size={17} /> Return to login
          </Link>
        </div>
      </section>
    </main>
  );
}
