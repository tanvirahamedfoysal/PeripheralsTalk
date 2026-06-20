import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  AUTH_COOKIE_NAME,
  createAuthCookieOptions
} from "@/lib/auth/auth-cookie";

export async function POST(): Promise<NextResponse> {
  const cookieStore = await cookies();

  cookieStore.set(AUTH_COOKIE_NAME, "", {
    ...createAuthCookieOptions(),
    maxAge: 0
  });

  return NextResponse.json({
    message: "Logged out successfully."
  });
}