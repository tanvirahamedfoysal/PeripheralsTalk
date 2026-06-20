import type {
  NextRequest
} from "next/server";
import {
  NextResponse
} from "next/server";

const AUTH_COOKIE_NAME =
  process.env.AUTH_COOKIE_NAME ??
  "peripheralstalk_session";

const protectedRoutes = [
  "/dashboard",
  "/editor",
  "/admin"
] as const;

function isProtectedPath(
  pathname: string
): boolean {
  return protectedRoutes.some(
    (route) =>
      pathname === route ||
      pathname.startsWith(`${route}/`)
  );
}

export function proxy(
  request: NextRequest
): NextResponse {
  const pathname = request.nextUrl.pathname;

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  const token =
    request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    const loginUrl = new URL(
      "/login",
      request.url
    );

    loginUrl.searchParams.set(
      "callbackUrl",
      `${request.nextUrl.pathname}${request.nextUrl.search}`
    );

    return NextResponse.redirect(loginUrl);
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