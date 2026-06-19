import "server-only";

import { isUserRole, type UserRole } from "@/lib/constants/roles";

export interface DecodedJwtPayload {
  id: string;
  email: string;
  role: UserRole;
  exp?: number;
}

function base64UrlDecode(value: string): string {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(
    base64.length + ((4 - (base64.length % 4)) % 4),
    "="
  );

  return Buffer.from(padded, "base64").toString("utf8");
}

export function decodeJwtPayload(token: string): DecodedJwtPayload {
  const [, payloadPart] = token.split(".");

  if (!payloadPart) {
    throw new Error("Invalid JWT structure.");
  }

  const payload = JSON.parse(base64UrlDecode(payloadPart)) as {
    id?: unknown;
    email?: unknown;
    role?: unknown;
    exp?: unknown;
  };

  if (
    typeof payload.id !== "string" ||
    typeof payload.email !== "string" ||
    !isUserRole(payload.role)
  ) {
    throw new Error("Invalid JWT payload.");
  }

  return {
    id: payload.id,
    email: payload.email,
    role: payload.role,
    exp:
      typeof payload.exp === "number"
        ? payload.exp
        : undefined
  };
}