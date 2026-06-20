import Link from "next/link";
export default function NotFound() {
  return (
    <main className="auth-page" style={{ display: "grid", placeItems: "center" }}>
      <section className="surface" style={{ maxWidth: 700, padding: 60 }}>
        <p className="eyebrow" style={{ color: "var(--red)" }}>
          404
        </p>
        <h1 className="display" style={{ fontSize: "clamp(60px,10vw,120px)" }}>
          Not in the archive.
        </h1>
        <p className="muted">The page may have moved or does not exist.</p>
        <Link className="button red" href="/">
          Return home
        </Link>
      </section>
    </main>
  );
}
