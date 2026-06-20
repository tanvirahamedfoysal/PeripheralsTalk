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
  LoginInput
} from "@/lib/auth/auth.types";
import {
  useSessionContext
} from "@/providers/session-provider";

function getSafeRedirectUrl(
  callbackUrl: string | undefined,
  fallbackUrl: string
): string {
  if (
    callbackUrl &&
    callbackUrl.startsWith("/") &&
    !callbackUrl.startsWith("//")
  ) {
    return callbackUrl;
  }

  return fallbackUrl;
}

export function useLogin(
  callbackUrl?: string
) {
  const router = useRouter();
  const { setSession } = useSessionContext();

  return useMutation<
    AuthSuccessResponse,
    Error,
    LoginInput
  >({
    mutationFn: authClient.login,

    onSuccess(response) {
      setSession(response.session);

      toast.success("Login successful", {
        description: "Welcome back to PeripheralsTalk."
      });

      router.replace(
        getSafeRedirectUrl(
          callbackUrl,
          response.redirectTo
        )
      );

      router.refresh();
    },

    onError(error) {
      if (error instanceof AuthClientError) {
        if (error.code === "ACCOUNT_SUSPENDED") {
          router.push("/account-suspended");
          return;
        }

        toast.error("Login failed", {
          description: error.message
        });

        return;
      }

      toast.error("Login failed", {
        description:
          "An unexpected authentication error occurred."
      });
    }
  });
}