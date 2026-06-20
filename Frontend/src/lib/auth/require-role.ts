import { redirect } from "next/navigation";

import {
  getSession
} from "@/lib/auth/get-session";
import type {
  AuthSession,
  UserRole
} from "@/lib/auth/auth.types";
import {
  canAccessRole
} from "@/lib/auth/roles";

export async function requireRole(
  requiredRole: UserRole
): Promise<AuthSession> {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (
    !canAccessRole(
      session.user.role,
      requiredRole
    )
  ) {
    redirect("/forbidden");
  }

  return session;
}