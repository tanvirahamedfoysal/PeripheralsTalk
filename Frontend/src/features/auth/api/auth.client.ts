import { clientApiRequest } from "@/lib/api/client";
import { NEXT_API_ENDPOINTS } from "@/lib/api/endpoint-map";
import type {
  AuthSuccessResponse,
  LoginInput,
  RegisterInput,
  SessionApiResponse
} from "@/features/auth/types/auth.types";

export const authClientApi = {
  login(payload: LoginInput): Promise<AuthSuccessResponse> {
    return clientApiRequest<AuthSuccessResponse>(
      NEXT_API_ENDPOINTS.auth.login,
      {
        method: "POST",
        body: JSON.stringify(payload)
      }
    );
  },

  register(payload: RegisterInput): Promise<AuthSuccessResponse> {
    const { confirmPassword: _confirmPassword, ...backendPayload } =
      payload;

    return clientApiRequest<AuthSuccessResponse>(
      NEXT_API_ENDPOINTS.auth.register,
      {
        method: "POST",
        body: JSON.stringify(backendPayload)
      }
    );
  },

  logout(): Promise<{ message: string }> {
    return clientApiRequest<{ message: string }>(
      NEXT_API_ENDPOINTS.auth.logout,
      {
        method: "POST"
      }
    );
  },

  session(): Promise<SessionApiResponse> {
    return clientApiRequest<SessionApiResponse>(
      NEXT_API_ENDPOINTS.auth.session,
      {
        method: "GET"
      }
    );
  }
};