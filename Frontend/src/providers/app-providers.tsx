"use client";

import { Toaster } from "sonner";

import { FloatingActionButtons } from "@/components/floating-action-buttons";

import { SessionProvider } from "./session-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <FloatingActionButtons />
      <Toaster richColors closeButton position="top-right" />
    </SessionProvider>
  );
}
