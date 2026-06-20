import { AuthForm } from "./auth-form";
import { Brand } from "./brand";
export function AuthPage({ mode }: { mode: "login" | "register" }) {
  return (
    <main className="auth-page">
      <section className="auth-art">
        <div>
          <Brand light />
          <p className="eyebrow" style={{ color: "var(--aqua)", marginTop: 55 }}>
            Knowledge / Community / Hardware
          </p>
          <h1>
            {mode === "login"
              ? "Welcome back to better hardware talk."
              : "Join the hardware conversation."}
          </h1>
          <p
            style={{
              maxWidth: 580,
              color: "rgba(255,255,255,.72)",
              lineHeight: 1.8,
            }}
          >
            Explore structured specifications, share practical experience, vote, rate
            and help maintain a useful peripheral archive.
          </p>
        </div>
        <div className="palette-strip" />
      </section>
      <section className="auth-panel">
        <div className="auth-form">
          <p className="eyebrow" style={{ color: "var(--red)" }}>
            PeripheralsTalk account
          </p>
          <h2>{mode === "login" ? "Sign in." : "Create account."}</h2>
          <p className="muted">
            {mode === "login"
              ? "Your role determines the workspace you enter."
              : "New accounts begin with the User role."}
          </p>
          <AuthForm mode={mode} />
        </div>
      </section>
    </main>
  );
}
