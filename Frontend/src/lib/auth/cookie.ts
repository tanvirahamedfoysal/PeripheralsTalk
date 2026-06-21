import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

import { decodeJwt } from "./jwt";

export const AUTH_COOKIE =
  process.env.AUTH_COOKIE_NAME?.trim() || "peripheralstalk_session";

export function cookieOptions(token?: string): Partial<ResponseCookie> {
  const configuredMaxAge = Number(process.env.AUTH_COOKIE_MAX_AGE_SECONDS || 3600);
  const exp = token ? decodeJwt(token).exp : undefined;
  const tokenMaxAge =
    typeof exp === "number" ? Math.max(1, exp - Math.floor(Date.now() / 1000)) : null;

  return {
    httpOnly: true,
    secure:
      process.env.AUTH_COOKIE_SECURE === "true" ||
      process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: tokenMaxAge ?? configuredMaxAge,
  };
}
