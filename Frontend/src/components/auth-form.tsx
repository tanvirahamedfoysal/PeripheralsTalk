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
  async function submit(e: FormEvent) {
    e.preventDefault();
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
      const r = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          mode === "login" ? { email, password } : { name, email, password },
        ),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message || "Authentication failed");
      setSession(d.session);
      location.assign(d.redirectTo || "/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }
  return (
    <form onSubmit={submit}>
      {mode === "register" && (
        <div className="field">
          <label className="label">Full name</label>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            required
            placeholder="Your full name"
          />
        </div>
      )}
      <div className="field">
        <label className="label">Email address</label>
        <input
          className="input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
          placeholder="name@example.com"
        />
      </div>
      <div className="field">
        <label className="label">Password</label>
        <div style={{ position: "relative" }}>
          <input
            className="input"
            style={{ paddingRight: 52 }}
            type={show ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            required
            placeholder="Minimum 8 characters"
          />
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="icon-button"
            style={{ position: "absolute", right: 8, top: 7, border: 0 }}
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>
      {mode === "register" && (
        <div className="field">
          <label className="label">Confirm password</label>
          <input
            className="input"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
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
            <Link href="/register" style={{ color: "var(--teal)", fontWeight: 800 }}>
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already registered?{" "}
            <Link href="/login" style={{ color: "var(--teal)", fontWeight: 800 }}>
              Sign in
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
