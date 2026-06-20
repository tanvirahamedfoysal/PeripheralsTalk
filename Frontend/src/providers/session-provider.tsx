"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction
} from "react";

import type {
  AuthSession
} from "@/lib/auth/auth.types";

interface SessionContextValue {
  session: AuthSession | null;
  isAuthenticated: boolean;
  setSession: Dispatch<
    SetStateAction<AuthSession | null>
  >;
  clearSession: () => void;
}

const SessionContext =
  createContext<SessionContextValue | null>(null);

interface SessionProviderProps
  extends PropsWithChildren {
  initialSession?: AuthSession | null;
}

export function SessionProvider({
  children,
  initialSession = null
}: SessionProviderProps): React.ReactElement {
  const [session, setSession] =
    useState<AuthSession | null>(initialSession);

  const contextValue =
    useMemo<SessionContextValue>(
      () => ({
        session,
        isAuthenticated: session !== null,
        setSession,

        clearSession() {
          setSession(null);
        }
      }),
      [session]
    );

  return (
    <SessionContext.Provider value={contextValue}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSessionContext(): SessionContextValue {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error(
      "useSessionContext must be used inside SessionProvider."
    );
  }

  return context;
}