import { NextResponse } from "next/server";

import { backendErrorMessage, fastApi } from "@/lib/api/server";
import { AUTH_COOKIE, cookieOptions } from "@/lib/auth/cookie";
import { decodeJwt } from "@/lib/auth/jwt";
import { normalizeRole } from "@/lib/auth/types";

const AUTH_TIMEOUT_MS = Number(process.env.FASTAPI_AUTH_TIMEOUT_MS || 90000);

interface RegisterBody {
  name?: string;
  username?: string;
  email?: string;
  password?: string;
  otp?: string;
}

interface RegisterResponse {
  message?: string;
  access_token?: string;
  user?: {
    id: number;
    name: string;
    username: string;
    email: string;
    role: string;
    is_active: boolean;
    image?: { url?: string };
  };
}

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json().catch(() => ({}))) as RegisterBody;
  const name = body.name?.trim();
  const username = body.username?.trim();
  const email = body.email?.trim();
  const password = body.password ?? "";
  const otp = body.otp?.trim();

  if (!name || !username || !email || !password || !otp) {
    return NextResponse.json(
      { message: "Name, username, email, password and OTP are required." },
      { status: 400 },
    );
  }

  const result = await fastApi<RegisterResponse>("auth/register", {
    method: "POST",
    timeoutMs: AUTH_TIMEOUT_MS,
    body: JSON.stringify({
      name,
      username,
      email,
      password,
      otp,
      image_url: null,
      image_public_id: null,
    }),
  });

  if (!result.ok || !result.data.access_token || !result.data.user) {
    return NextResponse.json(
      { message: backendErrorMessage(result.data, "Registration failed.") },
      { status: result.status },
    );
  }

  const role = normalizeRole(result.data.user.role);
  if (!role) {
    return NextResponse.json(
      { message: "The account response could not be processed." },
      { status: 502 },
    );
  }

  const token = result.data.access_token;
  const jwt = decodeJwt(token);
  const response = NextResponse.json({
    message: result.data.message ?? "Account created successfully.",
    redirectTo: "/",
    session: {
      user: {
        id: String(result.data.user.id ?? jwt.id ?? ""),
        name: result.data.user.name,
        username: result.data.user.username,
        email: result.data.user.email,
        role,
        isActive: result.data.user.is_active,
        avatarUrl: result.data.user.image?.url ?? null,
      },
      expiresAt:
        typeof jwt.exp === "number" ? new Date(jwt.exp * 1000).toISOString() : null,
    },
  });

  response.cookies.set(AUTH_COOKIE, token, cookieOptions(token));
  return response;
}
