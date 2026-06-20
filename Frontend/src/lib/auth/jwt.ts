import type { UserRole } from "./types";
import { normalizeRole } from "./types";
export interface JwtPayload {
  id: string;
  email: string;
  role: UserRole;
  exp?: number;
}
export function decodeJwt(token: string): JwtPayload {
  const part = token.split(".")[1];
  if (!part) throw new Error("Invalid token");
  const raw = Buffer.from(
    part.replace(/-/g, "+").replace(/_/g, "/"),
    "base64",
  ).toString("utf8");
  const p = JSON.parse(raw) as Record<string, unknown>;
  const role = normalizeRole(p.role);
  if (typeof p.id !== "string" || typeof p.email !== "string" || !role)
    throw new Error("Invalid token payload");
  return {
    id: p.id,
    email: p.email,
    role,
    exp: typeof p.exp === "number" ? p.exp : undefined,
  };
}
