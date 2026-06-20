export const USER_ROLES = {
  USER: "USER",
  EDITOR: "EDITOR",
  ADMIN: "ADMIN"
} as const;

export type UserRole =
  (typeof USER_ROLES)[keyof typeof USER_ROLES];

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  avatarUrl: string | null;
}

export interface AuthSession {
  user: SessionUser;
  expiresAt: string | null;
}

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
  session: AuthSession;
}

export interface SessionResponse {
  authenticated: boolean;
  session: AuthSession | null;
}

export interface FastApiLoginResponse {
  message: string;
  access_token: string;
  token_type: string;

  user: {
    email: string;
    role: string;
    is_active: boolean;
  };
}

export interface FastApiRegisterResponse {
  message: string;
  access_token: string;
  token_type: string;

  user: {
    name: string;
    email: string;
    role: string;
    is_active: boolean;

    image?: {
      id: number;
      url: string;
      public_id: string;
    };
  };
}

export interface FastApiValidateTokenResponse {
  message: string;

  user: {
    id: string;
    email: string;
    role: string;
    exp?: number;
  };
}