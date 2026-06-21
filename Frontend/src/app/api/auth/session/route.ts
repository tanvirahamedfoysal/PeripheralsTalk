import { NextResponse } from "next/server";

import { AUTH_COOKIE, cookieOptions } from "@/lib/auth/cookie";
import { getSession } from "@/lib/auth/session";

export async function GET(): Promise<NextResponse> {
  const session = await getSession();
  const response = NextResponse.json({
    authenticated: Boolean(session),
    session,
  });

  if (!session) {
    response.cookies.set(AUTH_COOKIE, "", {
      ...cookieOptions(),
      maxAge: 0,
    });
  }

  return response;
}
