import "server-only";

import { cookies } from "next/headers";

import { API_ENDPOINTS } from "@/lib/api/endpoint-map";
import { serverApiRequest } from "@/lib/api/server-client";
import { AUTH_COOKIE_NAME } from "@/lib/auth/auth-cookie";
import { decodeJwtPayload } from "@/lib/auth/decode-jwt";
import type { Session } from "@/lib/auth/session.types";

interface ValidateTokenResponse {
  message: string;
  user: {
    id: string;
    email: string;
    role: string;
    exp?: number;
  };
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const decoded = decodeJwtPayload(token);

    await serverApiRequest<ValidateTokenResponse>(
      API_ENDPOINTS.auth.validateToken,
      {
        method: "POST",
        body: JSON.stringify({
          token
        })
      }
    );

    return {
      user: {
        id: decoded.id,
        email: decoded.email,
        username: decoded.email.split("@")[0] ?? "User",
        role: decoded.role,
        status: "active",
        avatarUrl: null
      },
      expiresAt: decoded.exp
        ? new Date(decoded.exp * 1000).toISOString()
        : null
    };
  } catch {
    return null;
  }
}