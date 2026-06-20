import { NextResponse } from "next/server";

import { fastApi } from "@/lib/api/server";
import { AUTH_COOKIE, cookieOptions } from "@/lib/auth/cookie";
import { decodeJwt } from "@/lib/auth/jwt";
import { normalizeRole, roleHome } from "@/lib/auth/types";

interface LoginRequestBody {
  email?: string;
  password?: string;
}

interface LoginBackendResponse {
  message?: string;
  access_token?: string;
  user?: {
    email: string;
    role: string;
    is_active: boolean;
  };
}

interface BackendErrorResponse {
  detail?: string;
  message?: string;
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as LoginRequestBody;
    const email = body.email?.trim();

    if (!email || !body.password) {
      return NextResponse.json(
        { message: "Email and password are required." },
        { status: 400 },
      );
    }

    const result = await fastApi<LoginBackendResponse>("auth/login", {
      method: "POST",
      body: JSON.stringify({
        email,
        password: body.password,
      }),
    });

    if (!result.ok) {
      const error = result.data as BackendErrorResponse;

      return NextResponse.json(
        {
          message: error.detail ?? error.message ?? "Login failed.",
        },
        { status: result.status },
      );
    }

    const accessToken = result.data.access_token;
    const user = result.data.user;

    if (!accessToken || !user) {
      return NextResponse.json(
        { message: "Backend returned an incomplete login response." },
        { status: 502 },
      );
    }

    if (!user.is_active) {
      return NextResponse.json(
        {
          message: "This account is suspended.",
          code: "ACCOUNT_SUSPENDED",
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
      message: result.data.message ?? "Login successful",
      redirectTo: roleHome(role),
      session: {
        user: {
          id: jwt.id,
          name: user.email.split("@")[0] || "User",
          email: user.email,
          role,
          isActive: true,
          avatarUrl: null,
        },
        expiresAt: jwt.exp ? new Date(jwt.exp * 1000).toISOString() : null,
      },
    });

    response.cookies.set(AUTH_COOKIE, accessToken, cookieOptions(accessToken));

    return response;
  } catch {
    return NextResponse.json(
      { message: "Unable to connect to the authentication backend." },
      { status: 503 },
    );
  }
}
