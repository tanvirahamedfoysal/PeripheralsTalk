import Link from "next/link";
export default function Forbidden() {
  return (
    <main className="auth-page" style={{ display: "grid", placeItems: "center" }}>
      <section className="surface" style={{ maxWidth: 650, padding: 50 }}>
        <p className="eyebrow" style={{ color: "var(--red)" }}>
          Access restricted
        </p>
        <h1 className="section-title">You cannot enter this workspace.</h1>
        <p className="muted">
          Your account does not have permission to open this workspace.
        </p>
        <Link href="/" className="button">
          Return home
        </Link>
      </section>
    </main>
  );
}
