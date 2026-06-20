import { redirect } from "next/navigation";
import { getSession } from "./session";
import type { AuthSession, UserRole } from "./types";
import { canAccess } from "./types";
export async function requireAuth(): Promise<AuthSession> {
  const s = await getSession();
  if (!s) redirect("/login");
  return s;
}
export async function requireRole(role: UserRole): Promise<AuthSession> {
  const s = await requireAuth();
  if (!canAccess(s.user.role, role)) redirect("/forbidden");
  return s;
}
