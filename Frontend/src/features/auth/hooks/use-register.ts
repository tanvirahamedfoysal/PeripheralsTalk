"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  authClient,
  AuthClientError
} from "@/features/auth/api/auth.client";
import type {
  AuthSuccessResponse,
  RegisterInput
} from "@/lib/auth/auth.types";
import {
  useSessionContext
} from "@/providers/session-provider";

export function useRegister() {
  const router = useRouter();
  const { setSession } = useSessionContext();

  return useMutation<
    AuthSuccessResponse,
    Error,
    RegisterInput
  >({
    mutationFn: authClient.register,

    onSuccess(response) {
      setSession(response.session);

      toast.success("Account created", {
        description:
          "Your PeripheralsTalk account is ready."
      });

      router.replace(response.redirectTo);
      router.refresh();
    },

    onError(error) {
      if (error instanceof AuthClientError) {
        toast.error("Registration failed", {
          description: error.message
        });

        return;
      }

      toast.error("Registration failed", {
        description:
          "An unexpected registration error occurred."
      });
    }
  });
}