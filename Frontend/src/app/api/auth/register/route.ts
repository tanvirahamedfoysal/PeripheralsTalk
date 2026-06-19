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

interface RegisterRequestBody {
  name: string;
  email: string;
  password: string;
  image_url?: string | null;
  image_public_id?: string | null;
}

interface FastApiRegisterResponse {
  message: string;
  access_token: string;
  token_type: "bearer";
  user: {
    name: string;
    email: string;
    is_active: true;
    image?: {
      id: number;
      url: string;
      public_id: string;
    };
  };
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as RegisterRequestBody;

    const backendResponse =
      await serverApiRequest<FastApiRegisterResponse>(
        API_ENDPOINTS.auth.register,
        {
          method: "POST",
          body: JSON.stringify({
            name: body.name,
            email: body.email,
            password: body.password,
            image_url: body.image_url ?? null,
            image_public_id: body.image_public_id ?? null
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
          username: backendResponse.user.name,
          role: decoded.role,
          status: "active",
          avatarUrl: backendResponse.user.image?.url ?? null
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
        message: "Registration failed."
      },
      {
        status: 500
      }
    );
  }
}