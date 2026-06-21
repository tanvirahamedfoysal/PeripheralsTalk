export const NEXT_AUTH_ENDPOINTS = {
  login: "/api/auth/login",
  logout: "/api/auth/logout",
  session: "/api/auth/session",
  requestRegistrationOtp: "/api/auth/request-registration-otp",
  register: "/api/auth/register",
  requestResetPassword: "/api/auth/request-reset-password",
  resetPassword: "/api/auth/reset-password",
} as const;
