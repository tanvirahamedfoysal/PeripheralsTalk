import type { UserRole } from "@/lib/constants/roles";

export function getDefaultRouteForRole(role: UserRole): string {
  switch (role) {
    case "ADMIN":
      return "/admin";

    case "EDITOR":
      return "/editor";

    case "USER":
      return "/dashboard";

    default:
      return "/dashboard";
  }
}