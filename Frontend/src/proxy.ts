import { NextResponse, type NextRequest } from "next/server";
const name = process.env.AUTH_COOKIE_NAME || "peripheralstalk_session";
const protectedRoutes = ["/dashboard", "/editor", "/admin"];
export function proxy(req: NextRequest) {
  if (
    !protectedRoutes.some(
      (p) => req.nextUrl.pathname === p || req.nextUrl.pathname.startsWith(p + "/"),
    )
  )
    return NextResponse.next();
  if (!req.cookies.get(name)?.value) {
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}
export const config = {
  matcher: ["/dashboard/:path*", "/editor/:path*", "/admin/:path*"],
};
