import {
  USER_ROLES,
  type UserRole
} from "@/lib/auth/auth.types";

export function normalizeUserRole(value: unknown): UserRole | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalizedRole = value.toUpperCase();

  if (normalizedRole === USER_ROLES.ADMIN) {
    return USER_ROLES.ADMIN;
  }

  if (normalizedRole === USER_ROLES.EDITOR) {
    return USER_ROLES.EDITOR;
  }

  if (normalizedRole === USER_ROLES.USER) {
    return USER_ROLES.USER;
  }

  return null;
}

export function getRoleHomeRoute(role: UserRole): string {
  switch (role) {
    case USER_ROLES.ADMIN:
      return "/admin";

    case USER_ROLES.EDITOR:
      return "/editor";

    case USER_ROLES.USER:
      return "/dashboard";
  }
}

export function canAccessRole(
  currentRole: UserRole,
  requiredRole: UserRole
): boolean {
  const roleLevels: Record<UserRole, number> = {
    USER: 1,
    EDITOR: 2,
    ADMIN: 3
  };

  return roleLevels[currentRole] >= roleLevels[requiredRole];
}