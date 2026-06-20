import type { Session } from "@/lib/auth/session.types";

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthSuccessResponse {
  message: string;
  redirectTo: string;
  session: Session;
}

export interface SessionApiResponse {
  authenticated: boolean;
  session: Session | null;
}