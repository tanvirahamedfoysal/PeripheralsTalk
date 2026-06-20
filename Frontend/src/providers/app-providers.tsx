"use client";

import type { PropsWithChildren } from "react";
import { Toaster } from "sonner";

import {
  QueryProvider
} from "@/providers/query-provider";
import {
  SessionProvider
} from "@/providers/session-provider";

export function AppProviders({
  children
}: PropsWithChildren): React.ReactElement {
  return (
    <QueryProvider>
      <SessionProvider>
        {children}

        <Toaster
          richColors
          closeButton
          position="top-right"
        />
      </SessionProvider>
    </QueryProvider>
  );
}