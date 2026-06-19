import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const AUTH_COOKIE_NAME =
  process.env.AUTH_COOKIE_NAME ?? "peripheralstalk_session";

const protectedRoutePrefixes = [
  "/dashboard",
  "/editor",
  "/admin"
] as const;

function isProtectedRoute(pathname: string): boolean {
  return protectedRoutePrefixes.some(
    (prefix) =>
      pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

function createLoginUrl(request: NextRequest): URL {
  const loginUrl = new URL("/login", request.url);

  const destination =
    request.nextUrl.pathname + request.nextUrl.search;

  loginUrl.searchParams.set("callbackUrl", destination);

  return loginUrl;
}

export function proxy(request: NextRequest): NextResponse {
  const pathname = request.nextUrl.pathname;

  if (!isProtectedRoute(pathname)) {
    return NextResponse.next();
  }

  const sessionCookie =
    request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (!sessionCookie) {
    return NextResponse.redirect(createLoginUrl(request));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/editor/:path*",
    "/admin/:path*"
  ]
};