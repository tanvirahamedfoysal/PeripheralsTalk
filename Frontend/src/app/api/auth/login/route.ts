import { NextResponse } from "next/server";

import {
  FASTAPI_AUTH_ENDPOINTS
} from "@/lib/api/auth-endpoints";
import {
  fastApiRequest,
  FastApiError
} from "@/lib/api/fastapi";
import {
  AUTH_COOKIE_NAME,
  getAuthCookieOptions
} from "@/lib/auth/auth-cookie";
import type {
  AuthSession,
  FastApiLoginResponse
} from "@/lib/auth/auth.types";
import {
  decodeJwtPayload,
  getJwtExpirationDate
} from "@/lib/auth/jwt";
import {
  getRoleHomeRoute,
  normalizeUserRole
} from "@/lib/auth/roles";
import {
  loginSchema
} from "@/features/auth/schemas/auth.schema";

export async function POST(
  request: Request
): Promise<NextResponse> {
  try {
    const requestBody = await request.json();

    const validationResult =
      loginSchema.safeParse(requestBody);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          message:
            validationResult.error.issues[0]?.message ??
            "Invalid login details."
        },
        {
          status: 400
        }
      );
    }

    const fastApiResponse =
      await fastApiRequest<FastApiLoginResponse>(
        FASTAPI_AUTH_ENDPOINTS.login,
        {
          method: "POST",
          body: JSON.stringify({
            email: validationResult.data.email,
            password: validationResult.data.password
          })
        }
      );

    if (!fastApiResponse.user.is_active) {
      return NextResponse.json(
        {
          message:
            "Your account has been suspended. Contact an administrator.",
          code: "ACCOUNT_SUSPENDED"
        },
        {
          status: 403
        }
      );
    }

    const role = normalizeUserRole(
      fastApiResponse.user.role
    );

    if (!role) {
      return NextResponse.json(
        {
          message:
            "The backend returned an unsupported account role."
        },
        {
          status: 500
        }
      );
    }

    const accessToken = fastApiResponse.access_token;
    const jwtPayload = decodeJwtPayload(accessToken);

    const emailName =
      fastApiResponse.user.email.split("@")[0] ??
      "User";

    const session: AuthSession = {
      user: {
        id: jwtPayload.id,
        name: emailName,
        email: fastApiResponse.user.email,
        role,
        isActive: fastApiResponse.user.is_active,
        avatarUrl: null
      },

      expiresAt: getJwtExpirationDate(accessToken)
    };

    const response = NextResponse.json({
      message: fastApiResponse.message,
      redirectTo: getRoleHomeRoute(role),
      session
    });

    response.cookies.set(
      AUTH_COOKIE_NAME,
      accessToken,
      getAuthCookieOptions(accessToken)
    );

    return response;
  } catch (error) {
    if (error instanceof FastApiError) {
      return NextResponse.json(
        {
          message: error.message
        },
        {
          status: error.status
        }
      );
    }

    return NextResponse.json(
      {
        message:
          "An unexpected error occurred while signing in."
      },
      {
        status: 500
      }
    );
  }
}