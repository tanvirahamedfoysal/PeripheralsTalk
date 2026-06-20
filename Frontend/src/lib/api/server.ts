const base = (process.env.FASTAPI_BASE_URL || "http://127.0.0.1:8000").replace(
  /\/$/,
  "",
);
const prefix = (process.env.FASTAPI_API_PREFIX || "/api/v1").replace(/\/$/, "");
export async function fastApi<T = unknown>(path: string, init: RequestInit = {}) {
  const controller = new AbortController();
  const timer = setTimeout(
    () => controller.abort(),
    Number(process.env.FASTAPI_REQUEST_TIMEOUT_MS || 15000),
  );
  try {
    const r = await fetch(`${base}${prefix}/${path.replace(/^\//, "")}`, {
      ...init,
      cache: "no-store",
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        ...(init.body instanceof FormData
          ? {}
          : { "Content-Type": "application/json" }),
        ...init.headers,
      },
    });
    const t = r.headers.get("content-type") || "";
    const data = t.includes("application/json") ? await r.json() : await r.text();
    return { ok: r.ok, status: r.status, data: data as T };
  } finally {
    clearTimeout(timer);
  }
}
