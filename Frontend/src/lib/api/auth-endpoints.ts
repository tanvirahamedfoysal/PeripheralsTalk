export const FASTAPI_AUTH_ENDPOINTS = {
  register: "/auth/register",
  login: "/auth/login",
  validateToken: "/auth/validate-token"
} as const;

export const NEXT_AUTH_ENDPOINTS = {
  register: "/api/auth/register",
  login: "/api/auth/login",
  session: "/api/auth/session",
  logout: "/api/auth/logout"
} as const;