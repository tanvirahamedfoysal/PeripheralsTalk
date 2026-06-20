import { NextResponse } from "next/server";

import {
  registerApiSchema
} from "@/features/auth/schemas/auth.schema";
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
  FastApiRegisterResponse
} from "@/lib/auth/auth.types";
import {
  decodeJwtPayload,
  getJwtExpirationDate
} from "@/lib/auth/jwt";
import {
  getRoleHomeRoute,
  normalizeUserRole
} from "@/lib/auth/roles";

export async function POST(
  request: Request
): Promise<NextResponse> {
  try {
    const requestBody = await request.json();

    const validationResult =
      registerApiSchema.safeParse(requestBody);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          message:
            validationResult.error.issues[0]?.message ??
            "Invalid registration data."
        },
        {
          status: 400
        }
      );
    }

    const fastApiResponse =
      await fastApiRequest<FastApiRegisterResponse>(
        FASTAPI_AUTH_ENDPOINTS.register,
        {
          method: "POST",

          body: JSON.stringify({
            name: validationResult.data.name,
            email: validationResult.data.email,
            password: validationResult.data.password,

            image_url:
              validationResult.data.image_url ?? null,

            image_public_id:
              validationResult.data.image_public_id ?? null
          })
        }
      );

    if (!fastApiResponse.user.is_active) {
      return NextResponse.json(
        {
          message:
            "The newly created account is not active.",
          code: "ACCOUNT_INACTIVE"
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

    const session: AuthSession = {
      user: {
        id: jwtPayload.id,
        name: fastApiResponse.user.name,
        email: fastApiResponse.user.email,
        role,
        isActive: fastApiResponse.user.is_active,
        avatarUrl:
          fastApiResponse.user.image?.url ?? null
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
          "An unexpected error occurred while creating the account."
      },
      {
        status: 500
      }
    );
  }
}