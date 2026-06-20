"use client";

import { useQuery } from "@tanstack/react-query";

import { authClientApi } from "@/features/auth/api/auth.client";
import { authQueryKeys } from "@/features/auth/api/auth.keys";

export function useSession() {
  return useQuery({
    queryKey: authQueryKeys.session(),
    queryFn: authClientApi.session,
    staleTime: 60_000,
    retry: false
  });
}