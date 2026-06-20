import { cookies } from "next/headers";

import {
  FASTAPI_AUTH_ENDPOINTS
} from "@/lib/api/auth-endpoints";
import {
  fastApiRequest
} from "@/lib/api/fastapi";
import {
  AUTH_COOKIE_NAME
} from "@/lib/auth/auth-cookie";
import type {
  AuthSession,
  FastApiValidateTokenResponse
} from "@/lib/auth/auth.types";
import {
  normalizeUserRole
} from "@/lib/auth/roles";

export async function getSession(): Promise<
  AuthSession | null
> {
  const cookieStore = await cookies();

  const token =
    cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const response =
      await fastApiRequest<FastApiValidateTokenResponse>(
        FASTAPI_AUTH_ENDPOINTS.validateToken,
        {
          method: "POST",

          body: JSON.stringify({
            token
          })
        }
      );

    const role = normalizeUserRole(
      response.user.role
    );

    if (!role) {
      return null;
    }

    return {
      user: {
        id: response.user.id,
        name:
          response.user.email.split("@")[0] ??
          "User",
        email: response.user.email,
        role,
        isActive: true,
        avatarUrl: null
      },

      expiresAt: response.user.exp
        ? new Date(
            response.user.exp * 1000
          ).toISOString()
        : null
    };
  } catch {
    return null;
  }
}