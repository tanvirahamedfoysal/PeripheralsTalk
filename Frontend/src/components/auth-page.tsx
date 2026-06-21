import Link from "next/link";
import { Suspense } from "react";
import { Home } from "lucide-react";

import { Brand } from "./brand";
import { AuthForm } from "./auth-form";

export function AuthPage({ mode }: { mode: "login" | "register" }) {
  const register = mode === "register";

  return (
    <main className="auth-page">
      <section className="auth-art auth-study-image">
        <div className="auth-art-content">
          <Brand light />
          <p className="eyebrow auth-art-eyebrow">Knowledge / Community / Hardware</p>
          <h1>
            {register
              ? "Join a smarter hardware community."
              : "Welcome back to focused hardware learning."}
          </h1>
          <p className="auth-art-copy">
            Explore structured peripheral knowledge, compare article versions, discuss
            devices and help the community make informed technology choices.
          </p>
        </div>
      </section>

      <section className="auth-panel">
        <Link href="/" className="auth-home-button">
          <Home size={17} />
          Home
        </Link>
        <Suspense
          fallback={
            <div className="auth-form">
              <p className="muted">Loading account form…</p>
            </div>
          }
        >
          <AuthForm mode={mode} />
        </Suspense>
      </section>
    </main>
  );
}
