export type UserRole = "ADMIN" | "EDITOR" | "USER";

export interface SessionUser {
  id: string;
  name: string;
  username: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  avatarUrl: string | null;
}

export interface AuthSession {
  user: SessionUser;
  expiresAt: string | null;
}

export function normalizeRole(value: unknown): UserRole | null {
  const role = String(value ?? "").toUpperCase();
  return role === "ADMIN" || role === "EDITOR" || role === "USER" ? role : null;
}

export function roleHome(role: UserRole): string {
  if (role === "ADMIN") return "/admin/users";
  if (role === "EDITOR") return "/editor/articles";
  return "/dashboard/profile";
}
