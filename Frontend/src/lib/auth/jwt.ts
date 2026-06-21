interface JwtPayload {
  id?: string | number;
  email?: string;
  role?: string;
  exp?: number;
  [key: string]: unknown;
}

function decodeBase64Url(value: string): string {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  return Buffer.from(padded, "base64").toString("utf8");
}

export function decodeJwt(token: string): JwtPayload {
  try {
    const payload = token.split(".")[1];
    if (!payload) return {};
    return JSON.parse(decodeBase64Url(payload)) as JwtPayload;
  } catch {
    return {};
  }
}

export const decodeJwtPayload = decodeJwt;
