import Link from "next/link";
export default function Suspended() {
  return (
    <main className="auth-page" style={{ display: "grid", placeItems: "center" }}>
      <section className="surface" style={{ maxWidth: 650, padding: 50 }}>
        <p className="eyebrow" style={{ color: "var(--red)" }}>
          Account suspended
        </p>
        <h1 className="section-title">Access is currently unavailable.</h1>
        <p className="muted">
          An administrator must unsuspend this account using the supplied admin API.
        </p>
        <Link href="/login" className="button red">
          Return to login
        </Link>
      </section>
    </main>
  );
}
