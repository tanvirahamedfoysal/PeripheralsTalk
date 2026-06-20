import { Buffer } from "node:buffer";

import type { UserRole } from "@/lib/auth/auth.types";
import { normalizeUserRole } from "@/lib/auth/roles";

export interface JwtPayload {
  id: string;
  email: string;
  role: UserRole;
  exp: number | null;
}

function decodeBase64Url(value: string): string {
  const base64Value = value
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const paddedValue = base64Value.padEnd(
    base64Value.length +
      ((4 - (base64Value.length % 4)) % 4),
    "="
  );

  return Buffer.from(paddedValue, "base64").toString("utf8");
}

export function decodeJwtPayload(token: string): JwtPayload {
  const tokenParts = token.split(".");

  if (tokenParts.length !== 3 || !tokenParts[1]) {
    throw new Error("The backend returned an invalid JWT.");
  }

  const decodedPayload = JSON.parse(
    decodeBase64Url(tokenParts[1])
  ) as {
    id?: unknown;
    email?: unknown;
    role?: unknown;
    exp?: unknown;
  };

  const role = normalizeUserRole(decodedPayload.role);

  if (
    typeof decodedPayload.id !== "string" ||
    typeof decodedPayload.email !== "string" ||
    !role
  ) {
    throw new Error("The JWT payload is missing required user data.");
  }

  return {
    id: decodedPayload.id,
    email: decodedPayload.email,
    role,
    exp:
      typeof decodedPayload.exp === "number"
        ? decodedPayload.exp
        : null
  };
}

export function getJwtExpirationDate(
  token: string
): string | null {
  const payload = decodeJwtPayload(token);

  if (!payload.exp) {
    return null;
  }

  return new Date(payload.exp * 1000).toISOString();
}