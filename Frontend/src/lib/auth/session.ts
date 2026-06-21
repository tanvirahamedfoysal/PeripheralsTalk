import "server-only";

import { cookies } from "next/headers";

import { fastApi } from "@/lib/api/server";
import type { ApiEnvelope, ProfileRecord } from "@/lib/api/types";

import { AUTH_COOKIE } from "./cookie";
import { decodeJwt } from "./jwt";
import { normalizeRole, type AuthSession, type SessionUser } from "./types";

interface ValidateTokenResponse {
  message: string;
  user: {
    id: string | number;
    email: string;
    role: string;
    exp?: number;
  };
}

export async function getSession(): Promise<AuthSession | null> {
  const token = (await cookies()).get(AUTH_COOKIE)?.value;
  if (!token) return null;

  const validation = await fastApi<ValidateTokenResponse>("auth/validate-token", {
    method: "POST",
    token,
  });

  if (!validation.ok || !validation.data?.user) {
    return null;
  }

  const role = normalizeRole(validation.data.user.role);
  if (!role) return null;

  const jwt = decodeJwt(token);
  let profile: ProfileRecord | null = null;

  const profileResult = await fastApi<ApiEnvelope<ProfileRecord>>("profile/me", {
    method: "GET",
    token,
  });

  if (profileResult.ok && profileResult.data?.data) {
    profile = profileResult.data.data;
  }

  const user: SessionUser = {
    id: String(profile?.id ?? validation.data.user.id ?? jwt.id ?? ""),
    name:
      profile?.name ??
      profile?.username ??
      validation.data.user.email.split("@")[0] ??
      "User",
    username: profile?.username ?? validation.data.user.email.split("@")[0] ?? "user",
    email: profile?.email ?? validation.data.user.email,
    role,
    isActive: profile?.is_active ?? true,
    avatarUrl: profile?.image_url ?? null,
  };

  const exp = validation.data.user.exp ?? jwt.exp;

  return {
    user,
    expiresAt: typeof exp === "number" ? new Date(exp * 1000).toISOString() : null,
  };
}
