"use client";

import { Toaster } from "sonner";

import { SessionProvider } from "./session-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster richColors closeButton position="top-right" />
    </SessionProvider>
  );
}
