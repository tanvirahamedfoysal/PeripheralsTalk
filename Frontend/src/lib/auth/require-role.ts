import "server-only";

import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth/get-session";
import { hasMinimumRole, type UserRole } from "@/lib/constants/roles";
import type { Session } from "@/lib/auth/session.types";

export async function requireRole(
  requiredRole: UserRole
): Promise<Session> {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (!hasMinimumRole(session.user.role, requiredRole)) {
    redirect("/forbidden");
  }

  return session;
}