import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import {
  FASTAPI_AUTH_ENDPOINTS
} from "@/lib/api/auth-endpoints";
import {
  fastApiRequest
} from "@/lib/api/fastapi";
import {
  AUTH_COOKIE_NAME,
  getDeletedAuthCookieOptions
} from "@/lib/auth/auth-cookie";
import type {
  AuthSession,
  FastApiValidateTokenResponse
} from "@/lib/auth/auth.types";
import {
  normalizeUserRole
} from "@/lib/auth/roles";

function createUnauthenticatedResponse(): NextResponse {
  const response = NextResponse.json({
    authenticated: false,
    session: null
  });

  response.cookies.set(
    AUTH_COOKIE_NAME,
    "",
    getDeletedAuthCookieOptions()
  );

  return response;
}

export async function GET(): Promise<NextResponse> {
  const cookieStore = await cookies();

  const token =
    cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({
      authenticated: false,
      session: null
    });
  }

  try {
    const validationResponse =
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
      validationResponse.user.role
    );

    if (!role) {
      return createUnauthenticatedResponse();
    }

    const emailName =
      validationResponse.user.email.split("@")[0] ??
      "User";

    const session: AuthSession = {
      user: {
        id: validationResponse.user.id,
        name: emailName,
        email: validationResponse.user.email,
        role,
        isActive: true,
        avatarUrl: null
      },

      expiresAt: validationResponse.user.exp
        ? new Date(
            validationResponse.user.exp * 1000
          ).toISOString()
        : null
    };

    return NextResponse.json({
      authenticated: true,
      session
    });
  } catch {
    return createUnauthenticatedResponse();
  }
}