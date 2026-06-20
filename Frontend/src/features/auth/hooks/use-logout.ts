"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { authClientApi } from "@/features/auth/api/auth.client";
import { useSessionContext } from "@/providers/session-provider";

export function useLogout() {
  const router = useRouter();
  const { clearSession } = useSessionContext();

  return useMutation({
    mutationFn: authClientApi.logout,

    onSuccess: () => {
      clearSession();

      toast.success("Logged out", {
        description: "Your session has ended."
      });

      router.replace("/login");
      router.refresh();
    },

    onError: () => {
      toast.error("Logout failed", {
        description: "Try again in a moment."
      });
    }
  });
}