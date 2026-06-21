import { NextResponse } from "next/server";

import { backendErrorMessage, fastApi } from "@/lib/api/server";

const AUTH_TIMEOUT_MS = Number(process.env.FASTAPI_AUTH_TIMEOUT_MS || 90000);

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json().catch(() => ({}))) as { email?: string };
  const email = body.email?.trim();

  if (!email) {
    return NextResponse.json({ message: "Email is required." }, { status: 400 });
  }

  const result = await fastApi<{ message?: string }>("auth/request-reset-password", {
    method: "POST",
    timeoutMs: AUTH_TIMEOUT_MS,
    body: JSON.stringify({ email }),
  });

  return NextResponse.json(
    {
      message: result.ok
        ? (result.data.message ?? "If the account exists, an OTP was sent.")
        : backendErrorMessage(result.data, "Unable to request a reset OTP."),
    },
    { status: result.status },
  );
}
