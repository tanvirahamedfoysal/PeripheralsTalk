export interface ApiResult<T = unknown> {
  ok: boolean;
  status: number;
  data: T | null;
  message: string;
}
export async function apiRequest<T = unknown>(
  path: string,
  init: RequestInit = {},
): Promise<ApiResult<T>> {
  try {
    const response = await fetch(`/api/backend/${path.replace(/^\//, "")}`, {
      ...init,
      headers: {
        Accept: "application/json",
        ...(init.body instanceof FormData
          ? {}
          : { "Content-Type": "application/json" }),
        ...init.headers,
      },
    });
    const type = response.headers.get("content-type") || "";
    const data = type.includes("application/json")
      ? await response.json()
      : await response.text();
    const message =
      typeof data === "object" && data !== null
        ? String(
            (data as Record<string, unknown>).detail ||
              (data as Record<string, unknown>).message ||
              "Request completed",
          )
        : String(data || "Request completed");
    return {
      ok: response.ok,
      status: response.status,
      data: data as T,
      message,
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      data: null,
      message:
        error instanceof Error ? error.message : "Unable to connect to the backend",
    };
  }
}
export function meaningfulData(value: unknown) {
  if (!value || typeof value !== "object") return false;
  const r = value as Record<string, unknown>;
  return r.message !== "Not implemented yet";
}
