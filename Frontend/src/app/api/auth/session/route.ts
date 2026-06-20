import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME } from "@/lib/auth/auth-cookie";
import { getSession } from "@/lib/auth/get-session";

export async function GET(): Promise<NextResponse> {
  const session = await getSession();

  if (!session) {
    const cookieStore = await cookies();

    cookieStore.delete(AUTH_COOKIE_NAME);

    return NextResponse.json({
      authenticated: false,
      session: null
    });
  }

  return NextResponse.json({
    authenticated: true,
    session
  });
}