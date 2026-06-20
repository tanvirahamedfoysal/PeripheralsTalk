import { redirect } from "next/navigation";

import {
  getSession
} from "@/lib/auth/get-session";
import type {
  AuthSession
} from "@/lib/auth/auth.types";

export async function requireAuth(): Promise<AuthSession> {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}