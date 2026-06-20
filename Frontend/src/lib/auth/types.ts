export type UserRole = "USER" | "EDITOR" | "ADMIN";
export interface AuthSession {
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    isActive: boolean;
    avatarUrl: string | null;
  };
  expiresAt: string | null;
}
export function normalizeRole(value: unknown): UserRole | null {
  const role = String(value || "").toUpperCase();
  return role === "USER" || role === "EDITOR" || role === "ADMIN" ? role : null;
}
export function roleHome(role: UserRole) {
  return role === "ADMIN" ? "/admin" : role === "EDITOR" ? "/editor" : "/dashboard";
}
export function canAccess(current: UserRole, required: UserRole) {
  const n = { USER: 1, EDITOR: 2, ADMIN: 3 };
  return n[current] >= n[required];
}
