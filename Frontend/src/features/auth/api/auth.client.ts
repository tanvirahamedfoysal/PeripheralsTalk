import { NEXT_AUTH_ENDPOINTS } from "@/lib/api/auth-endpoints";

async function request<T>(url: string, body?: unknown): Promise<T> {
  const response = await fetch(url, {
    method: body === undefined ? "GET" : "POST",
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });
  const payload = (await response.json()) as T & { message?: string };
  if (!response.ok)
    throw new Error(payload.message ?? "Authentication request failed.");
  return payload;
}

export const authClientApi = {
  login: (body: unknown) => request(NEXT_AUTH_ENDPOINTS.login, body),
  register: (body: unknown) => request(NEXT_AUTH_ENDPOINTS.register, body),
  session: () => request(NEXT_AUTH_ENDPOINTS.session),
  logout: () => request(NEXT_AUTH_ENDPOINTS.logout, {}),
};
