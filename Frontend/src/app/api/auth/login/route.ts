import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { ApiError } from "@/lib/api/api-error";
import { API_ENDPOINTS } from "@/lib/api/endpoint-map";
import { serverApiRequest } from "@/lib/api/server-client";
import {
  AUTH_COOKIE_NAME,
  createAuthCookieOptions
} from "@/lib/auth/auth-cookie";
import { decodeJwtPayload } from "@/lib/auth/decode-jwt";
import { getDefaultRouteForRole } from "@/lib/auth/role-routes";
import { isUserRole } from "@/lib/constants/roles";

interface LoginRequestBody {
  email: string;
  password: string;
}

interface FastApiLoginResponse {
  message: string;
  access_token: string;
  token_type: "bearer";
  user: {
    email: string;
    role: string;
    is_active: boolean;
  };
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as LoginRequestBody;

    const backendResponse =
      await serverApiRequest<FastApiLoginResponse>(
        API_ENDPOINTS.auth.login,
        {
          method: "POST",
          body: JSON.stringify({
            email: body.email,
            password: body.password
          })
        }
      );

    if (!backendResponse.user.is_active) {
      return NextResponse.json(
        {
          message: "This account is suspended.",
          code: "ACCOUNT_SUSPENDED"
        },
        {
          status: 403
        }
      );
    }

    const token = backendResponse.access_token;
    const decoded = decodeJwtPayload(token);

    const cookieStore = await cookies();

    cookieStore.set(
      AUTH_COOKIE_NAME,
      token,
      createAuthCookieOptions()
    );

    return NextResponse.json({
      message: backendResponse.message,
      redirectTo: getDefaultRouteForRole(decoded.role),
      session: {
        user: {
          id: decoded.id,
          email: backendResponse.user.email,
          username:
            backendResponse.user.email.split("@")[0] ?? "User",
          role: decoded.role,
          status: "active",
          avatarUrl: null
        },
        expiresAt: decoded.exp
          ? new Date(decoded.exp * 1000).toISOString()
          : null
      }
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        {
          message: error.message,
          code: error.code,
          details: error.details
        },
        {
          status: error.status
        }
      );
    }

    return NextResponse.json(
      {
        message: "Login failed."
      },
      {
        status: 500
      }
    );
  }
}