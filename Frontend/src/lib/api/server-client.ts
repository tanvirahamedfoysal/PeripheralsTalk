import "server-only";

import { ApiError } from "@/lib/api/api-error";
import { env } from "@/lib/env";

interface ServerApiRequestOptions extends RequestInit {
  token?: string;
  timeoutMs?: number;
}

interface FastApiErrorBody {
  detail?: string | Array<{ msg?: string }>;
  message?: string;
  code?: string;
}

function buildBackendUrl(path: string): string {
  const baseUrl = env.FASTAPI_BASE_URL.replace(/\/$/, "");
  const apiPrefix = env.FASTAPI_API_PREFIX.replace(/^\/?/, "/");
  const cleanPath = path.replace(/^\/?/, "/");

  return `${baseUrl}${apiPrefix}${cleanPath}`;
}

function extractErrorMessage(body: FastApiErrorBody | null): string {
  if (!body) {
    return "Request failed.";
  }

  if (typeof body.detail === "string") {
    return body.detail;
  }

  if (Array.isArray(body.detail)) {
    return body.detail
      .map((item) => item.msg)
      .filter(Boolean)
      .join(", ");
  }

  if (body.message) {
    return body.message;
  }

  return "Request failed.";
}

export async function serverApiRequest<TResponse>(
  path: string,
  options: ServerApiRequestOptions = {}
): Promise<TResponse> {
  const {
    token,
    timeoutMs = env.FASTAPI_REQUEST_TIMEOUT_MS,
    headers,
    body,
    ...restOptions
  } = options;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(buildBackendUrl(path), {
      ...restOptions,
      body,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        ...(body instanceof FormData
          ? {}
          : {
              "Content-Type": "application/json"
            }),
        ...(token
          ? {
              Authorization: `Bearer ${token}`
            }
          : {}),
        ...headers
      },
      cache: "no-store"
    });

    const contentType = response.headers.get("content-type");
    const hasJson = contentType?.includes("application/json");

    const responseBody = hasJson
      ? ((await response.json()) as unknown)
      : null;

    if (!response.ok) {
      const errorBody = responseBody as FastApiErrorBody | null;

      throw new ApiError({
        status: response.status,
        message: extractErrorMessage(errorBody),
        code: errorBody?.code,
        details: responseBody
      });
    }

    return responseBody as TResponse;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError({
        status: 408,
        message: "The backend request timed out."
      });
    }

    throw new ApiError({
      status: 500,
      message:
        error instanceof Error
          ? error.message
          : "Unable to connect to the backend."
    });
  } finally {
    clearTimeout(timeout);
  }
}