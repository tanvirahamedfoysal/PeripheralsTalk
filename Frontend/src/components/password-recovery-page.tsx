"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Home,
  LoaderCircle,
  Mail,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

import { Brand } from "./brand";

const OTP_LIFETIME_SECONDS = 120;

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

export function PasswordRecoveryPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  const countdown = useOtpCountdown();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function sendResetOtp(): Promise<void> {
    const response = await fetch("/api/auth/request-reset-password", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    });
    const payload = (await response.json()) as { message?: string };
    if (!response.ok) {
      throw new Error(payload.message ?? "Unable to request a password-reset OTP.");
    }

    setOtp("");
    countdown.start();
    setMessage(payload.message ?? "If the account exists, a six-digit OTP was sent.");
    setStep(2);
  }

  async function requestOtp(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setMessage(null);
    setError(null);
    setLoading(true);
    try {
      await sendResetOtp();
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Unable to request OTP.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function resendOtp(): Promise<void> {
    if (countdown.secondsLeft > 0 || loading) return;
    setMessage(null);
    setError(null);
    setLoading(true);
    try {
      await sendResetOtp();
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Unable to resend OTP.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setMessage(null);
    setError(null);

    if (countdown.secondsLeft <= 0) {
      setError("This OTP has expired. Request a new OTP to continue.");
      return;
    }
    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp: otp.trim(),
          newPassword: password,
        }),
      });
      const payload = (await response.json()) as { message?: string };
      if (!response.ok) {
        throw new Error(payload.message ?? "Unable to reset password.");
      }
      countdown.clear();
      setMessage(payload.message ?? "Password reset successfully.");
      setStep(3);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to reset password.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-art auth-study-image">
        <div className="auth-art-content">
          <Brand light />
          <p className="eyebrow auth-art-eyebrow">Secure account recovery</p>
          <h1>{title}</h1>
          <p className="auth-art-copy">{description}</p>
        </div>
      </section>

      <section className="auth-panel">
        <Link href="/" className="auth-home-button">
          <Home size={17} /> Home
        </Link>
        <div className="auth-form">
          <p className="eyebrow auth-eyebrow">Email OTP verification</p>
          <h2>
            {step === 1 ? "Request OTP." : step === 2 ? "Set password." : "Completed."}
          </h2>

          {step === 1 ? (
            <form onSubmit={requestOtp}>
              <div className="field">
                <label className="label" htmlFor="recovery-email">
                  Account email
                </label>
                <input
                  id="recovery-email"
                  className="input"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
              {message ? <div className="success-box">{message}</div> : null}
              {error ? <div className="error-box">{error}</div> : null}
              <button className="button red" disabled={loading}>
                {loading ? (
                  <LoaderCircle className="spin" size={18} />
                ) : (
                  <Mail size={18} />
                )}
                {loading ? "Sending OTP..." : "Send reset OTP"}
              </button>
            </form>
          ) : null}

          {step === 2 ? (
            <form onSubmit={resetPassword}>
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
                      ? "Use the code before the two-minute timer ends."
                      : "Request a new OTP before resetting the password."}
                  </span>
                </div>
              </div>

              <div className="field">
                <label className="label" htmlFor="recovery-otp">
                  Six-digit OTP
                </label>
                <input
                  id="recovery-otp"
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
              <div className="field">
                <label className="label" htmlFor="new-password">
                  New password
                </label>
                <input
                  id="new-password"
                  className="input"
                  type="password"
                  minLength={8}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>
              <div className="field">
                <label className="label" htmlFor="confirm-new-password">
                  Confirm password
                </label>
                <input
                  id="confirm-new-password"
                  className="input"
                  type="password"
                  minLength={8}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>
              {message && countdown.secondsLeft > 0 ? (
                <div className="success-box">{message}</div>
              ) : null}
              {error ? <div className="error-box">{error}</div> : null}

              {countdown.secondsLeft > 0 ? (
                <button className="button red" disabled={loading || otp.length !== 6}>
                  {loading ? (
                    <LoaderCircle className="spin" size={18} />
                  ) : (
                    <ShieldCheck size={18} />
                  )}
                  {loading ? "Resetting..." : "Reset password"}
                </button>
              ) : (
                <button
                  className="button red"
                  type="button"
                  onClick={() => void resendOtp()}
                  disabled={loading}
                >
                  {loading ? (
                    <LoaderCircle className="spin" size={18} />
                  ) : (
                    <RefreshCw size={18} />
                  )}
                  {loading ? "Resending OTP..." : "Resend OTP"}
                </button>
              )}

              <button
                type="button"
                className="button ghost"
                onClick={() => {
                  countdown.clear();
                  setStep(1);
                  setMessage(null);
                  setError(null);
                  setOtp("");
                }}
              >
                <ArrowLeft size={17} /> Change email
              </button>
            </form>
          ) : null}

          {step === 3 ? (
            <div className="recovery-complete">
              <div className="success-box">
                <CheckCircle2 size={18} /> {message}
              </div>
              <Link href="/login" className="button red">
                Return to sign in
              </Link>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
