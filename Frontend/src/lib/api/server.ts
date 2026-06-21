import "server-only";

import type { BackendErrorPayload } from "./types";

const BASE_URL = (
  process.env.FASTAPI_BASE_URL || "https://peripheralstalk-106b064b.fastapicloud.dev"
).replace(/\/$/, "");

const API_PREFIX = (process.env.FASTAPI_API_PREFIX || "/api/v1").replace(/\/$/, "");

const TIMEOUT = Number(process.env.FASTAPI_REQUEST_TIMEOUT_MS || 20000);

export interface FastApiResult<T> {
  ok: boolean;
  status: number;
  data: T;
}

export interface FastApiOptions extends RequestInit {
  token?: string | null;
  query?: Record<string, string | number | boolean | null | undefined>;
  timeoutMs?: number;
}

export async function fastApi<T>(
  path: string,
  options: FastApiOptions = {},
): Promise<FastApiResult<T>> {
  const controller = new AbortController();
  const timeoutMs = options.timeoutMs ?? TIMEOUT;
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const headers = new Headers(options.headers);

  if (!headers.has("accept")) {
    headers.set("accept", "application/json");
  }

  if (options.token) {
    headers.set("authorization", `Bearer ${options.token}`);
  }

  if (
    options.body &&
    !(options.body instanceof FormData) &&
    !(options.body instanceof URLSearchParams) &&
    !headers.has("content-type")
  ) {
    headers.set("content-type", "application/json");
  }

  const normalizedPath = path.replace(/^\/+/, "");
  const url = new URL(`${BASE_URL}${API_PREFIX}/${normalizedPath}`);

  for (const [key, value] of Object.entries(options.query ?? {})) {
    if (value !== null && value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  }

  try {
    const requestOptions: FastApiOptions = { ...options };
    delete requestOptions.timeoutMs;
    delete requestOptions.token;
    delete requestOptions.query;

    const response = await fetch(url, {
      ...requestOptions,
      headers,
      cache: "no-store",
      redirect: "follow",
      signal: controller.signal,
    });

    const contentType = response.headers.get("content-type") ?? "";
    const data = contentType.includes("application/json")
      ? ((await response.json()) as T)
      : ((await response.text()) as T);

    return {
      ok: response.ok,
      status: response.status,
      data,
    };
  } catch (error) {
    const detail =
      error instanceof Error && error.name === "AbortError"
        ? `The request timed out after ${Math.round(timeoutMs / 1000)} seconds.`
        : "The service is temporarily unavailable.";

    return {
      ok: false,
      status: 503,
      data: { detail } as T,
    };
  } finally {
    clearTimeout(timer);
  }
}

export function backendErrorMessage(
  payload: BackendErrorPayload | unknown,
  fallback = "The request could not be completed.",
): string {
  if (typeof payload === "string" && payload.trim()) {
    return payload.trim();
  }

  if (!payload || typeof payload !== "object") {
    return fallback;
  }

  const value = payload as BackendErrorPayload;

  if (typeof value.detail === "string") {
    return value.detail;
  }

  if (Array.isArray(value.detail)) {
    const messages = value.detail
      .map((item) => item.msg)
      .filter((item): item is string => Boolean(item));
    if (messages.length > 0) {
      return messages.join(" ");
    }
  }

  return value.message ?? fallback;
}
