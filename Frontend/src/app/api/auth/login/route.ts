import { NextResponse } from "next/server";

import { backendErrorMessage, fastApi } from "@/lib/api/server";
import { AUTH_COOKIE, cookieOptions } from "@/lib/auth/cookie";
import { decodeJwt } from "@/lib/auth/jwt";
import { normalizeRole, roleHome } from "@/lib/auth/types";

const AUTH_TIMEOUT_MS = Number(process.env.FASTAPI_AUTH_TIMEOUT_MS || 90000);

interface LoginBody {
  identifier?: string;
  email?: string;
  password?: string;
}

interface LoginResponse {
  message?: string;
  access_token?: string;
  token_type?: string;
  user?: {
    id: number;
    username: string;
    email: string;
    role: string;
  };
}

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json().catch(() => ({}))) as LoginBody;
  const identifier = (body.identifier ?? body.email ?? "").trim();
  const password = body.password ?? "";

  if (!identifier || !password) {
    return NextResponse.json(
      { message: "Email/username and password are required." },
      { status: 400 },
    );
  }

  const form = new URLSearchParams();
  form.set("username", identifier);
  form.set("password", password);

  const result = await fastApi<LoginResponse>("auth/login", {
    method: "POST",
    timeoutMs: AUTH_TIMEOUT_MS,
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: form,
  });

  if (!result.ok || !result.data.access_token || !result.data.user) {
    return NextResponse.json(
      {
        message: backendErrorMessage(result.data, "Login failed."),
        code: result.status === 403 ? "ACCOUNT_SUSPENDED" : undefined,
      },
      { status: result.status },
    );
  }

  const role = normalizeRole(result.data.user.role);
  if (!role) {
    return NextResponse.json(
      { message: "The backend returned an unsupported user role." },
      { status: 502 },
    );
  }

  const token = result.data.access_token;
  const jwt = decodeJwt(token);
  const response = NextResponse.json({
    message: result.data.message ?? "Login successful",
    redirectTo: roleHome(role),
    session: {
      user: {
        id: String(result.data.user.id ?? jwt.id ?? ""),
        name: result.data.user.username,
        username: result.data.user.username,
        email: result.data.user.email,
        role,
        isActive: true,
        avatarUrl: null,
      },
      expiresAt:
        typeof jwt.exp === "number" ? new Date(jwt.exp * 1000).toISOString() : null,
    },
  });

  response.cookies.set(AUTH_COOKIE, token, cookieOptions(token));
  return response;
}
