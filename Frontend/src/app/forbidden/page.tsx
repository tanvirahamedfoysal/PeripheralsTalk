import Link from "next/link";
export default function Forbidden() {
  return (
    <main className="auth-page" style={{ display: "grid", placeItems: "center" }}>
      <section className="surface" style={{ maxWidth: 650, padding: 50 }}>
        <p className="eyebrow" style={{ color: "var(--red)" }}>
          403 / Role protected
        </p>
        <h1 className="section-title">You cannot enter this workspace.</h1>
        <p className="muted">Your JWT role does not satisfy this route.</p>
        <Link href="/" className="button">
          Return home
        </Link>
      </section>
    </main>
  );
}
