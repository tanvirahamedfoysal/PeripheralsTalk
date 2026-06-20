import { NextResponse } from "next/server";

import { fastApi } from "@/lib/api/server";
import { AUTH_COOKIE, cookieOptions } from "@/lib/auth/cookie";
import { decodeJwt } from "@/lib/auth/jwt";
import { normalizeRole, roleHome } from "@/lib/auth/types";

interface RegisterRequestBody {
  name?: string;
  email?: string;
  password?: string;
}

interface RegisterBackendResponse {
  message?: string;
  access_token?: string;
  user?: {
    name: string;
    email: string;
    role: string;
    is_active: boolean;
    image?: {
      url: string;
    };
  };
}

interface BackendErrorResponse {
  detail?: string;
  message?: string;
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as RegisterRequestBody;
    const name = body.name?.trim();
    const email = body.email?.trim();

    if (!name || !email || !body.password) {
      return NextResponse.json(
        { message: "Name, email and password are required." },
        { status: 400 },
      );
    }

    const result = await fastApi<RegisterBackendResponse>("auth/register", {
      method: "POST",
      body: JSON.stringify({
        name,
        email,
        password: body.password,
        image_url: null,
        image_public_id: null,
      }),
    });

    if (!result.ok) {
      const error = result.data as BackendErrorResponse;

      return NextResponse.json(
        {
          message: error.detail ?? error.message ?? "Registration failed.",
        },
        { status: result.status },
      );
    }

    const accessToken = result.data.access_token;
    const user = result.data.user;

    if (!accessToken || !user) {
      return NextResponse.json(
        { message: "Backend returned an incomplete registration response." },
        { status: 502 },
      );
    }

    if (!user.is_active) {
      return NextResponse.json(
        {
          message: "The newly created account is not active.",
          code: "ACCOUNT_INACTIVE",
        },
        { status: 403 },
      );
    }

    const role = normalizeRole(user.role);

    if (!role) {
      return NextResponse.json(
        { message: "The backend returned an unsupported role." },
        { status: 500 },
      );
    }

    const jwt = decodeJwt(accessToken);
    const response = NextResponse.json({
      message: result.data.message ?? "Account created",
      redirectTo: roleHome(role),
      session: {
        user: {
          id: jwt.id,
          name: user.name,
          email: user.email,
          role,
          isActive: user.is_active,
          avatarUrl: user.image?.url ?? null,
        },
        expiresAt: jwt.exp ? new Date(jwt.exp * 1000).toISOString() : null,
      },
    });

    response.cookies.set(AUTH_COOKIE, accessToken, cookieOptions(accessToken));

    return response;
  } catch {
    return NextResponse.json(
      { message: "Unable to connect to the registration backend." },
      { status: 503 },
    );
  }
}
