import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

import { isAllowedBackendRequest } from "@/lib/api/allowed";
import { AUTH_COOKIE } from "@/lib/auth/cookie";

const BASE_URL = (
  process.env.FASTAPI_BASE_URL || "https://peripheralstalk-106b064b.fastapicloud.dev"
).replace(/\/$/, "");
const PREFIX = (process.env.FASTAPI_API_PREFIX || "/api/v1").replace(/\/$/, "");
const TIMEOUT = Number(process.env.FASTAPI_REQUEST_TIMEOUT_MS || 60000);

async function forward(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
): Promise<NextResponse> {
  const { path: segments } = await context.params;
  const normalizedPath = segments.join("/").replace(/^\/+|\/+$/g, "");

  if (!isAllowedBackendRequest(request.method, normalizedPath)) {
    return NextResponse.json(
      {
        detail: "This action is not available.",
      },
      { status: 403 },
    );
  }

  /*
   * FastAPI distinguishes collection routes such as /category/ and /article/
   * from their slashless forms. Next.js catch-all params omit a final slash,
   * so preserve it from the original browser request. This avoids a 307
   * redirect that can break replaying POST request bodies through a proxy.
   */
  const collectionRouteNeedsSlash =
    normalizedPath === "category" || normalizedPath === "article";
  const requestedTrailingSlash = request.nextUrl.pathname.endsWith("/");
  const backendPath =
    collectionRouteNeedsSlash || requestedTrailingSlash
      ? `${normalizedPath}/`
      : normalizedPath;

  const token = (await cookies()).get(AUTH_COOKIE)?.value;
  const headers = new Headers({ Accept: "application/json" });
  const contentType = request.headers.get("content-type");

  if (contentType) headers.set("content-type", contentType);
  if (token) headers.set("authorization", `Bearer ${token}`);

  const url = new URL(`${BASE_URL}${PREFIX}/${backendPath}`);
  url.search = request.nextUrl.search;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT);

  try {
    const body =
      request.method === "GET" || request.method === "HEAD"
        ? undefined
        : await request.arrayBuffer();

    const response = await fetch(url, {
      method: request.method,
      headers,
      body,
      cache: "no-store",
      redirect: "follow",
      signal: controller.signal,
    });

    const responseHeaders = new Headers();
    const responseContentType = response.headers.get("content-type");
    if (responseContentType) {
      responseHeaders.set("content-type", responseContentType);
    }

    return new NextResponse(await response.arrayBuffer(), {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Backend proxy request failed", {
      method: request.method,
      path: backendPath,
      error,
    });

    return NextResponse.json(
      {
        detail:
          error instanceof Error && error.name === "AbortError"
            ? "The request timed out. Please try again."
            : "The service is temporarily unavailable. Please try again.",
      },
      { status: 503 },
    );
  } finally {
    clearTimeout(timer);
  }
}

export const GET = forward;
export const POST = forward;
export const PUT = forward;
export const DELETE = forward;
