"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ArrowRight, Eye, EyeOff } from "lucide-react";

import { useSession } from "@/providers/session-provider";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { setSession } = useSession();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (mode === "register" && password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          mode === "login" ? { email, password } : { name, email, password },
        ),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Authentication failed");
      }

      setSession(data.session);
      location.assign(data.redirectTo || "/dashboard");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : "Authentication failed",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit}>
      {mode === "register" && (
        <div className="field">
          <label className="label" htmlFor="name">
            Full name
          </label>
          <input
            id="name"
            className="input"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="name"
            required
            placeholder="Your full name"
          />
        </div>
      )}

      <div className="field">
        <label className="label" htmlFor="email">
          Email address
        </label>
        <input
          id="email"
          className="input"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
          placeholder="name@example.com"
        />
      </div>

      <div className="field">
        <div className="auth-label-row">
          <label className="label" htmlFor="password">
            Password
          </label>
          {mode === "login" && (
            <Link href="/forgot-password" className="auth-text-link">
              Forgot password?
            </Link>
          )}
        </div>
        <div style={{ position: "relative" }}>
          <input
            id="password"
            className="input"
            style={{ paddingRight: 52 }}
            type={show ? "text" : "password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            required
            placeholder="Minimum 8 characters"
          />
          <button
            type="button"
            onClick={() => setShow((current) => !current)}
            className="icon-button"
            style={{ position: "absolute", right: 8, top: 7, border: 0 }}
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {mode === "register" && (
        <div className="field">
          <label className="label" htmlFor="confirm-password">
            Confirm password
          </label>
          <input
            id="confirm-password"
            className="input"
            type="password"
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            required
            autoComplete="new-password"
            placeholder="Repeat password"
          />
        </div>
      )}

      {error && <div className="error-box">{error}</div>}

      <button
        className="button red"
        style={{ width: "100%", minHeight: 56 }}
        disabled={loading}
      >
        {loading ? (
          mode === "login" ? (
            "Signing in…"
          ) : (
            "Creating account…"
          )
        ) : (
          <>
            {mode === "login" ? "Sign in" : "Create account"}
            <ArrowRight size={18} />
          </>
        )}
      </button>

      <p className="muted" style={{ textAlign: "center", fontSize: 13 }}>
        {mode === "login" ? (
          <>
            New here?{" "}
            <Link href="/register" className="auth-text-link strong">
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already registered?{" "}
            <Link href="/login" className="auth-text-link strong">
              Sign in
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
