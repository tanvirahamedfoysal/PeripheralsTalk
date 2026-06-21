"use client";

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly payload: unknown,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

export interface ApiRequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown | FormData;
  query?: Record<string, string | number | boolean | null | undefined>;
}

function extractMessage(payload: unknown): string {
  if (!payload || typeof payload !== "object") {
    return "The request failed.";
  }

  const value = payload as {
    detail?: string | Array<{ msg?: string }>;
    message?: string;
  };

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

  return value.message ?? "The request failed.";
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const normalizedPath = path.replace(/^\/+/, "");
  const url = new URL(`/api/backend/${normalizedPath}`, window.location.origin);

  for (const [key, value] of Object.entries(options.query ?? {})) {
    if (value !== null && value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  }

  const headers = new Headers({ Accept: "application/json" });
  let body: BodyInit | undefined;

  if (options.body instanceof FormData) {
    body = options.body;
  } else if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(options.body);
  }

  const response = await fetch(url, {
    method: options.method ?? "GET",
    headers,
    body,
    credentials: "same-origin",
    cache: "no-store",
  });

  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    throw new ApiClientError(extractMessage(payload), response.status, payload);
  }

  return payload as T;
}

export function meaningfulData(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value).length > 0;
  if (typeof value === "string") return value.trim().length > 0;
  return true;
}
