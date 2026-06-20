"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { authClientApi } from "@/features/auth/api/auth.client";
import type {
  AuthSuccessResponse,
  RegisterInput
} from "@/features/auth/types/auth.types";
import { isApiError } from "@/lib/api/api-error";
import { useSessionContext } from "@/providers/session-provider";

export function useRegister() {
  const router = useRouter();
  const { setSession } = useSessionContext();

  return useMutation<AuthSuccessResponse, Error, RegisterInput>({
    mutationFn: authClientApi.register,

    onSuccess: (response) => {
      setSession(response.session);

      toast.success("Account created", {
        description: "Your PeripheralsTalk account is ready."
      });

      router.replace(response.redirectTo);
      router.refresh();
    },

    onError: (error) => {
      if (isApiError(error)) {
        toast.error("Registration failed", {
          description: error.message
        });

        return;
      }

      toast.error("Registration failed", {
        description: "Unable to create your account right now."
      });
    }
  });
}