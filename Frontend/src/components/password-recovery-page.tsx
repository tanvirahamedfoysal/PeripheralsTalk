"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, Home } from "lucide-react";

import { Brand } from "./brand";
import { apiRequest } from "@/lib/api/client";
import { apiPaths } from "@/lib/api/paths";

type RecoveryMode = "forgot" | "reset" | "change";

interface PasswordRecoveryPageProps {
  mode: RecoveryMode;
}

const copy: Record<
  RecoveryMode,
  { eyebrow: string; title: string; description: string; artTitle: string }
> = {
  forgot: {
    eyebrow: "Password recovery",
    title: "Forgot password?",
    description: "Enter your account email to request a password reset message.",
    artTitle: "Recover access to your hardware community account.",
  },
  reset: {
    eyebrow: "Reset password",
    title: "Set a new password.",
    description: "Enter the reset token and choose a new password.",
    artTitle: "Return to better hardware conversations securely.",
  },
  change: {
    eyebrow: "Change password",
    title: "Choose a new password.",
    description: "Use the supplied password-reset token to update your password.",
    artTitle: "Keep your PeripheralsTalk account protected.",
  },
};

export function PasswordRecoveryPage({ mode }: PasswordRecoveryPageProps) {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const text = copy[mode];
  const isForgot = mode === "forgot";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!isForgot) {
      if (password.length < 8) {
        setError("Password must contain at least 8 characters.");
        return;
      }
      if (password !== confirm) {
        setError("Passwords do not match.");
        return;
      }
    }

    setLoading(true);

    const result = await apiRequest(
      isForgot ? apiPaths.auth.requestReset : apiPaths.auth.reset,
      {
        method: "POST",
        body: JSON.stringify(
          isForgot ? { email } : { token, password, confirm_password: confirm },
        ),
      },
    );

    if (result.ok) {
      setMessage(result.message || "Request completed.");
    } else {
      setError(result.message || "Unable to complete the request.");
    }

    setLoading(false);
  }

  return (
    <main className="auth-page">
      <section className="auth-art">
        <div>
          <Brand light />
          <p className="eyebrow" style={{ color: "var(--aqua)", marginTop: 55 }}>
            Security / Access / Recovery
          </p>
          <h1>{text.artTitle}</h1>
          <p
            style={{
              maxWidth: 580,
              color: "rgba(255,255,255,.72)",
              lineHeight: 1.8,
            }}
          >
            Password recovery uses only the authentication endpoints supplied by the
            PeripheralsTalk backend.
          </p>
        </div>
        <div className="palette-strip" />
      </section>

      <section className="auth-panel">
        <Link href="/" className="auth-home-button" aria-label="Go to home page">
          <Home size={17} />
          Home
        </Link>

        <div className="auth-form">
          <p className="eyebrow" style={{ color: "var(--red)" }}>
            {text.eyebrow}
          </p>
          <h2>{text.title}</h2>
          <p className="muted">{text.description}</p>

          <form onSubmit={submit}>
            {isForgot ? (
              <div className="field">
                <label className="label" htmlFor="recovery-email">
                  Email address
                </label>
                <input
                  id="recovery-email"
                  className="input"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  required
                  placeholder="name@example.com"
                />
              </div>
            ) : (
              <>
                <div className="field">
                  <label className="label" htmlFor="reset-token">
                    Reset token
                  </label>
                  <input
                    id="reset-token"
                    className="input"
                    value={token}
                    onChange={(event) => setToken(event.target.value)}
                    required
                    placeholder="Paste the reset token"
                  />
                </div>
                <div className="field">
                  <label className="label" htmlFor="new-password">
                    New password
                  </label>
                  <input
                    id="new-password"
                    className="input"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="new-password"
                    required
                    placeholder="Minimum 8 characters"
                  />
                </div>
                <div className="field">
                  <label className="label" htmlFor="confirm-new-password">
                    Confirm new password
                  </label>
                  <input
                    id="confirm-new-password"
                    className="input"
                    type="password"
                    value={confirm}
                    onChange={(event) => setConfirm(event.target.value)}
                    autoComplete="new-password"
                    required
                    placeholder="Repeat the new password"
                  />
                </div>
              </>
            )}

            {error && <div className="error-box">{error}</div>}
            {message && <div className="success-box">{message}</div>}

            <button
              className="button red"
              style={{ width: "100%", minHeight: 56 }}
              disabled={loading}
            >
              {loading ? "Submitting…" : isForgot ? "Request reset" : "Update password"}
              {!loading && <ArrowRight size={18} />}
            </button>

            <Link href="/login" className="auth-back-link">
              <ArrowLeft size={16} />
              Back to sign in
            </Link>
          </form>
        </div>
      </section>
    </main>
  );
}
