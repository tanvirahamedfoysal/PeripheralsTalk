"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  Mail,
  RefreshCw,
} from "lucide-react";

import type { AuthSession } from "@/lib/auth/types";
import { useSession } from "@/providers/session-provider";

const OTP_LIFETIME_SECONDS = 120;

interface AuthResponse {
  message?: string;
  redirectTo?: string;
  code?: string;
  session?: AuthSession;
}

function formatCountdown(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function useOtpCountdown(): {
  secondsLeft: number;
  start: () => void;
  clear: () => void;
} {
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (!expiresAt) {
      setSecondsLeft(0);
      return;
    }

    const deadline = expiresAt;

    function update(): void {
      const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining === 0) setExpiresAt(null);
    }

    update();
    const interval = window.setInterval(update, 1000);
    return () => window.clearInterval(interval);
  }, [expiresAt]);

  return {
    secondsLeft,
    start: useCallback(() => {
      setExpiresAt(Date.now() + OTP_LIFETIME_SECONDS * 1000);
      setSecondsLeft(OTP_LIFETIME_SECONDS);
    }, []),
    clear: useCallback(() => {
      setExpiresAt(null);
      setSecondsLeft(0);
    }, []),
  };
}

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  return mode === "login" ? <LoginForm /> : <RegisterForm />;
}

function LoginForm() {
  const router = useRouter();
  const { setSession } = useSession();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setMessage(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: identifier.trim(), password }),
      });
      const payload = (await response.json()) as AuthResponse;

      if (!response.ok) {
        if (payload.code === "ACCOUNT_SUSPENDED") {
          router.push("/account-suspended");
          return;
        }
        throw new Error(payload.message ?? "Unable to sign in.");
      }

      if (payload.session) setSession(payload.session);
      router.replace("/");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to sign in.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-form">
      <p className="eyebrow auth-eyebrow">PeripheralsTalk account</p>
      <h2>Sign in.</h2>
      <p className="muted">Use your account email address or username.</p>

      <form onSubmit={submit}>
        <div className="field">
          <label className="label" htmlFor="identifier">
            Email or username
          </label>
          <input
            id="identifier"
            className="input"
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            autoComplete="username"
            spellCheck={false}
            required
          />
        </div>

        <div className="field">
          <div className="auth-label-row">
            <label className="label" htmlFor="password">
              Password
            </label>
            <Link href="/forgot-password" className="auth-text-link">
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            className="input"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />
        </div>

        {message ? <div className="error-box">{message}</div> : null}

        <button className="button red" type="submit" disabled={submitting}>
          {submitting ? (
            <LoaderCircle className="spin" size={18} />
          ) : (
            <ArrowRight size={18} />
          )}
          {submitting ? "Connecting to your account..." : "Sign in"}
        </button>
      </form>

      <p className="muted auth-switch-copy">
        New to PeripheralsTalk?{" "}
        <Link href="/register" className="auth-text-link strong">
          Create an account
        </Link>
      </p>
    </div>
  );
}

function RegisterForm() {
  const router = useRouter();
  const { setSession } = useSession();
  const countdown = useOtpCountdown();
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const passwordValid = useMemo(() => password.length >= 8, [password]);
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedUsername = username.trim();

  async function verifyUsername(): Promise<void> {
    const response = await fetch(
      `/api/backend/profile/validate-username?username=${encodeURIComponent(normalizedUsername)}`,
      { method: "POST", cache: "no-store", credentials: "same-origin" },
    );
    const payload = (await response.json().catch(() => ({}))) as {
      is_valid?: boolean;
      message?: string;
      detail?: string;
    };

    if (response.ok && payload.is_valid === false) {
      throw new Error(payload.message ?? "Username is already taken.");
    }

    if (!response.ok) {
      throw new Error(
        payload.detail ?? payload.message ?? "Unable to validate the username.",
      );
    }
  }

  async function sendOtp(): Promise<void> {
    const response = await fetch("/api/auth/request-registration-otp", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: normalizedEmail }),
    });
    const payload = (await response.json()) as AuthResponse;
    if (!response.ok) {
      throw new Error(payload.message ?? "Unable to send the verification OTP.");
    }

    setOtp("");
    countdown.start();
    setSuccess(
      "A six-digit OTP was sent to your email. Enter it before the two-minute timer ends.",
    );
    setStep(2);
  }

  async function requestOtp(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setMessage(null);
    setSuccess(null);

    if (name.trim().length < 2) {
      setMessage("Please enter your full name.");
      return;
    }
    if (normalizedUsername.length < 3) {
      setMessage("Username must contain at least 3 characters.");
      return;
    }
    if (!passwordValid) {
      setMessage("Password must contain at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      await verifyUsername();
      await sendOtp();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to send OTP.");
    } finally {
      setSubmitting(false);
    }
  }

  async function resendOtp(): Promise<void> {
    if (countdown.secondsLeft > 0 || submitting) return;
    setMessage(null);
    setSuccess(null);
    setSubmitting(true);
    try {
      await sendOtp();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to resend OTP.");
    } finally {
      setSubmitting(false);
    }
  }

  async function register(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setMessage(null);

    if (countdown.secondsLeft <= 0) {
      setMessage("This OTP has expired. Request a new OTP to continue.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          username: normalizedUsername,
          email: normalizedEmail,
          password,
          otp: otp.trim(),
        }),
      });
      const payload = (await response.json()) as AuthResponse;
      if (!response.ok) {
        throw new Error(payload.message ?? "Registration failed.");
      }

      countdown.clear();
      if (payload.session) setSession(payload.session);
      router.replace("/");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Registration failed.");
    } finally {
      setSubmitting(false);
    }
  }

  function editAccountInformation(): void {
    countdown.clear();
    setStep(1);
    setOtp("");
    setMessage(null);
    setSuccess(null);
  }

  return (
    <div className="auth-form">
      <p className="eyebrow auth-eyebrow">
        {step === 1 ? "Create an account" : "Verify your email"}
      </p>
      <h2>{step === 1 ? "Join us." : "Enter OTP."}</h2>
      <p className="muted">
        {step === 1
          ? "Create a learning profile and verify your email with a secure six-digit code."
          : `The verification code was sent to ${normalizedEmail}.`}
      </p>

      {step === 1 ? (
        <form onSubmit={requestOtp}>
          <div className="form-grid">
            <div className="field full">
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
              />
            </div>
            <div className="field">
              <label className="label" htmlFor="username">
                Username
              </label>
              <input
                id="username"
                className="input"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
                spellCheck={false}
                minLength={3}
                required
              />
            </div>
            <div className="field">
              <label className="label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                className="input"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />
            </div>
            <div className="field">
              <label className="label" htmlFor="register-password">
                Password
              </label>
              <input
                id="register-password"
                className="input"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>
            <div className="field">
              <label className="label" htmlFor="confirm-password">
                Confirm password
              </label>
              <input
                id="confirm-password"
                className="input"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>
          </div>
          {message ? <div className="error-box">{message}</div> : null}
          <button className="button red" type="submit" disabled={submitting}>
            {submitting ? (
              <LoaderCircle className="spin" size={18} />
            ) : (
              <Mail size={18} />
            )}
            {submitting ? "Sending OTP..." : "Send verification OTP"}
          </button>
        </form>
      ) : (
        <form onSubmit={register}>
          <div className="otp-status-card" aria-live="polite">
            <Clock3 size={18} />
            <div>
              <strong>
                {countdown.secondsLeft > 0
                  ? `${formatCountdown(countdown.secondsLeft)} remaining`
                  : "OTP expired"}
              </strong>
              <span>
                {countdown.secondsLeft > 0
                  ? "This verification code is valid for two minutes."
                  : "Request a fresh OTP before creating the account."}
              </span>
            </div>
          </div>

          <div className="field">
            <label className="label" htmlFor="otp">
              Six-digit OTP
            </label>
            <input
              id="otp"
              className="input otp-input"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              value={otp}
              onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))}
              autoComplete="one-time-code"
              disabled={countdown.secondsLeft <= 0}
              required
            />
          </div>

          {success && countdown.secondsLeft > 0 ? (
            <div className="success-box">
              <CheckCircle2 size={17} /> {success}
            </div>
          ) : null}
          {message ? <div className="error-box">{message}</div> : null}

          {countdown.secondsLeft > 0 ? (
            <button
              className="button red"
              type="submit"
              disabled={submitting || otp.length !== 6}
            >
              {submitting ? (
                <LoaderCircle className="spin" size={18} />
              ) : (
                <ArrowRight size={18} />
              )}
              {submitting ? "Creating account..." : "Verify and create account"}
            </button>
          ) : (
            <button
              className="button red"
              type="button"
              onClick={() => void resendOtp()}
              disabled={submitting}
            >
              {submitting ? (
                <LoaderCircle className="spin" size={18} />
              ) : (
                <RefreshCw size={18} />
              )}
              {submitting ? "Resending OTP..." : "Resend OTP"}
            </button>
          )}

          <button
            className="button ghost"
            type="button"
            onClick={editAccountInformation}
          >
            <ArrowLeft size={17} /> Change account information
          </button>
        </form>
      )}

      <p className="muted auth-switch-copy">
        Already registered?{" "}
        <Link href="/login" className="auth-text-link strong">
          Sign in
        </Link>
      </p>
    </div>
  );
}
