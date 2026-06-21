import "server-only";

import { redirect } from "next/navigation";

import { getSession } from "./session";
import { roleHome, type AuthSession, type UserRole } from "./types";

export async function requireAuth(): Promise<AuthSession> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!session.user.isActive) redirect("/account-suspended");
  return session;
}

export async function requireRole(role: UserRole): Promise<AuthSession> {
  const session = await requireAuth();
  if (session.user.role !== role) {
    redirect(roleHome(session.user.role));
  }
  return session;
}
