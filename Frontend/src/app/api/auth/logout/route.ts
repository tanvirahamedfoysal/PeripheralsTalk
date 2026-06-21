import { NextResponse } from "next/server";

import { AUTH_COOKIE, cookieOptions } from "@/lib/auth/cookie";

export async function POST(): Promise<NextResponse> {
  const response = NextResponse.json({ message: "Logged out successfully." });
  response.cookies.set(AUTH_COOKIE, "", {
    ...cookieOptions(),
    maxAge: 0,
  });
  return response;
}
