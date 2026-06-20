import { decodeJwtPayload } from "@/lib/auth/jwt";

export const AUTH_COOKIE_NAME =
  process.env.AUTH_COOKIE_NAME ??
  "peripheralstalk_session";

function getConfiguredCookieMaximumAge(): number {
  const parsedValue = Number.parseInt(
    process.env.AUTH_COOKIE_MAX_AGE_SECONDS ?? "3600",
    10
  );

  return Number.isFinite(parsedValue) && parsedValue > 0
    ? parsedValue
    : 3600;
}

function getTokenRemainingSeconds(token: string): number {
  try {
    const payload = decodeJwtPayload(token);

    if (!payload.exp) {
      return getConfiguredCookieMaximumAge();
    }

    return Math.max(
      0,
      Math.floor(payload.exp - Date.now() / 1000)
    );
  } catch {
    return 0;
  }
}

export function getAuthCookieOptions(token: string) {
  const configuredMaximumAge =
    getConfiguredCookieMaximumAge();

  const tokenRemainingSeconds =
    getTokenRemainingSeconds(token);

  return {
    httpOnly: true,
    secure: process.env.AUTH_COOKIE_SECURE === "true",
    sameSite: (
      process.env.AUTH_COOKIE_SAME_SITE ?? "lax"
    ) as "lax" | "strict" | "none",
    path: "/",
    maxAge: Math.min(
      configuredMaximumAge,
      tokenRemainingSeconds
    )
  };
}

export function getDeletedAuthCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.AUTH_COOKIE_SECURE === "true",
    sameSite: (
      process.env.AUTH_COOKIE_SAME_SITE ?? "lax"
    ) as "lax" | "strict" | "none",
    path: "/",
    maxAge: 0
  };
}