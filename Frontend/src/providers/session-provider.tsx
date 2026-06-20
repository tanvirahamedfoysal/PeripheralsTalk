"use client";
import {
  createContext,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import type { AuthSession } from "@/lib/auth/types";
const C = createContext<{
  session: AuthSession | null;
  setSession: (s: AuthSession | null) => void;
} | null>(null);
export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const value = useMemo(() => ({ session, setSession }), [session]);
  return <C.Provider value={value}>{children}</C.Provider>;
}
export function useSession() {
  const c = useContext(C);
  if (!c) throw new Error("SessionProvider missing");
  return c;
}
