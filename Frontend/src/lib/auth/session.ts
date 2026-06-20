import { cookies } from "next/headers";
import { fastApi } from "@/lib/api/server";
import { AUTH_COOKIE } from "./cookie";
import type { AuthSession } from "./types";
import { normalizeRole } from "./types";
export async function getSession(): Promise<AuthSession | null> {
  const token = (await cookies()).get(AUTH_COOKIE)?.value;
  if (!token) return null;
  try {
    const result = await fastApi<{
      user?: { id?: string; email?: string; role?: string; exp?: number };
    }>("auth/validate-token", {
      method: "POST",
      body: JSON.stringify({ token }),
    });
    if (!result.ok || !result.data.user) return null;
    const u = result.data.user;
    const role = normalizeRole(u.role);
    if (!role || !u.id || !u.email) return null;
    return {
      user: {
        id: String(u.id),
        name: u.email.split("@")[0] || "User",
        email: u.email,
        role,
        isActive: true,
        avatarUrl: null,
      },
      expiresAt: u.exp ? new Date(u.exp * 1000).toISOString() : null,
    };
  } catch {
    return null;
  }
}
