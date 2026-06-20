"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { authClientApi } from "@/features/auth/api/auth.client";
import type {
  AuthSuccessResponse,
  LoginInput
} from "@/features/auth/types/auth.types";
import { isApiError } from "@/lib/api/api-error";
import { useSessionContext } from "@/providers/session-provider";

export function useLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setSession } = useSessionContext();

  return useMutation<AuthSuccessResponse, Error, LoginInput>({
    mutationFn: authClientApi.login,

    onSuccess: (response) => {
      setSession(response.session);

      toast.success("Login successful", {
        description: "Welcome back to PeripheralsTalk."
      });

      const callbackUrl = searchParams.get("callbackUrl");

      router.replace(callbackUrl || response.redirectTo);
      router.refresh();
    },

    onError: (error) => {
      if (isApiError(error)) {
        toast.error("Login failed", {
          description: error.message
        });

        return;
      }

      toast.error("Login failed", {
        description: "Unable to login right now."
      });
    }
  });
}