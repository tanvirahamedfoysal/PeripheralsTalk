import "server-only";

import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

import { env } from "@/lib/env";

export const AUTH_COOKIE_NAME = env.AUTH_COOKIE_NAME;

export function createAuthCookieOptions(): Partial<ResponseCookie> {
  return {
    httpOnly: true,
    secure: env.AUTH_COOKIE_SECURE,
    sameSite: env.AUTH_COOKIE_SAME_SITE,
    maxAge: env.AUTH_COOKIE_MAX_AGE_SECONDS,
    path: env.AUTH_COOKIE_PATH
  };
}