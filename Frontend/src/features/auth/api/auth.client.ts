import {
  NEXT_AUTH_ENDPOINTS
} from "@/lib/api/auth-endpoints";
import type {
  AuthSuccessResponse,
  LoginInput,
  RegisterInput,
  SessionResponse
} from "@/lib/auth/auth.types";

interface ErrorResponseBody {
  message?: string;
  code?: string;
}

export class AuthClientError extends Error {
  readonly status: number;
  readonly code: string | null;

  constructor(
    message: string,
    status: number,
    code: string | null = null
  ) {
    super(message);

    this.name = "AuthClientError";
    this.status = status;
    this.code = code;
  }
}

async function request<TResponse>(
  url: string,
  options: RequestInit
): Promise<TResponse> {
  const response = await fetch(url, {
    ...options,

    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...options.headers
    }
  });

  const body = (await response.json()) as
    | TResponse
    | ErrorResponseBody;

  if (!response.ok) {
    const errorBody = body as ErrorResponseBody;

    throw new AuthClientError(
      errorBody.message ?? "Authentication failed.",
      response.status,
      errorBody.code ?? null
    );
  }

  return body as TResponse;
}

export const authClient = {
  login(
    input: LoginInput
  ): Promise<AuthSuccessResponse> {
    return request<AuthSuccessResponse>(
      NEXT_AUTH_ENDPOINTS.login,
      {
        method: "POST",
        body: JSON.stringify(input)
      }
    );
  },

  register(
    input: RegisterInput
  ): Promise<AuthSuccessResponse> {
    return request<AuthSuccessResponse>(
      NEXT_AUTH_ENDPOINTS.register,
      {
        method: "POST",

        body: JSON.stringify({
          name: input.name,
          email: input.email,
          password: input.password
        })
      }
    );
  },

  session(): Promise<SessionResponse> {
    return request<SessionResponse>(
      NEXT_AUTH_ENDPOINTS.session,
      {
        method: "GET"
      }
    );
  },

  logout(): Promise<{ message: string }> {
    return request<{ message: string }>(
      NEXT_AUTH_ENDPOINTS.logout,
      {
        method: "POST"
      }
    );
  }
};