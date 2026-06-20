export const API_ENDPOINTS = {
  auth: {
    register: "/auth/register",
    login: "/auth/login",
    validateToken: "/auth/validate-token",
    requestPasswordReset: "/auth/request-reset-password",
    resetPassword: "/auth/reset-password"
  }
} as const;

export const NEXT_API_ENDPOINTS = {
  auth: {
    register: "/api/auth/register",
    login: "/api/auth/login",
    logout: "/api/auth/logout",
    session: "/api/auth/session"
  }
} as const;