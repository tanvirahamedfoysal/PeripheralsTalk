import { NextResponse } from "next/server";

import {
  AUTH_COOKIE_NAME,
  getDeletedAuthCookieOptions
} from "@/lib/auth/auth-cookie";

export async function POST(): Promise<NextResponse> {
  const response = NextResponse.json({
    message: "Logged out successfully."
  });

  response.cookies.set(
    AUTH_COOKIE_NAME,
    "",
    getDeletedAuthCookieOptions()
  );

  return response;
}