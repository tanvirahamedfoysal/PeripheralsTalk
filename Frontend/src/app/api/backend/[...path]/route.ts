import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE } from "@/lib/auth/cookie";
import { isAllowedBackendRequest } from "@/lib/api/allowed";
const base = (process.env.FASTAPI_BASE_URL || "http://127.0.0.1:8000").replace(
  /\/$/,
  "",
);
const prefix = (process.env.FASTAPI_API_PREFIX || "/api/v1").replace(/\/$/, "");
async function forward(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path: parts } = await context.params;
  const path = parts.join("/");
  if (!isAllowedBackendRequest(req.method, path))
    return NextResponse.json(
      {
        detail:
          "This backend method and endpoints are here",
      },
      { status: 403 },
    );
  const token = (await cookies()).get(AUTH_COOKIE)?.value;
  const headers = new Headers();
  const ct = req.headers.get("content-type");
  if (ct) headers.set("content-type", ct);
  headers.set("accept", "application/json");
  if (token) headers.set("authorization", `Bearer ${token}`);
  const method = req.method;
  const body =
    method === "GET" || method === "HEAD" ? undefined : await req.arrayBuffer();
  try {
    const url = new URL(`${base}${prefix}/${path}`);
    url.search = req.nextUrl.search;
    const response = await fetch(url, {
      method,
      headers,
      body,
      cache: "no-store",
    });
    const buffer = await response.arrayBuffer();
    const outHeaders = new Headers();
    const outType = response.headers.get("content-type");
    if (outType) outHeaders.set("content-type", outType);
    return new NextResponse(buffer, {
      status: response.status,
      headers: outHeaders,
    });
  } catch {
    return NextResponse.json(
      {
        detail: "Unable to connect to FastAPI. Start the backend on port 8000.",
      },
      { status: 503 },
    );
  }
}
export const GET = forward;
export const POST = forward;
export const PUT = forward;
export const DELETE = forward;
