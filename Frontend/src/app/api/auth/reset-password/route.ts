import { NextResponse } from "next/server";

import { backendErrorMessage, fastApi } from "@/lib/api/server";

const AUTH_TIMEOUT_MS = Number(process.env.FASTAPI_AUTH_TIMEOUT_MS || 90000);

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json().catch(() => ({}))) as {
    email?: string;
    otp?: string;
    newPassword?: string;
    new_password?: string;
  };
  const email = body.email?.trim();
  const otp = body.otp?.trim();
  const newPassword = body.newPassword ?? body.new_password ?? "";

  if (!email || !otp || !newPassword) {
    return NextResponse.json(
      { message: "Email, OTP and new password are required." },
      { status: 400 },
    );
  }

  const result = await fastApi<{ message?: string }>("auth/reset-password", {
    method: "POST",
    timeoutMs: AUTH_TIMEOUT_MS,
    body: JSON.stringify({ email, otp, new_password: newPassword }),
  });

  return NextResponse.json(
    {
      message: result.ok
        ? (result.data.message ?? "Password reset successfully.")
        : backendErrorMessage(result.data, "Unable to reset password."),
    },
    { status: result.status },
  );
}
