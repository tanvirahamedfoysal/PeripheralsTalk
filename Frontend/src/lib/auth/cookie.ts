export const AUTH_COOKIE = process.env.AUTH_COOKIE_NAME || "peripheralstalk_session";
export function cookieOptions(token?: string) {
  let maxAge = Number(process.env.AUTH_COOKIE_MAX_AGE_SECONDS || 3600);
  if (token) {
    try {
      const part = JSON.parse(
        Buffer.from(
          token.split(".")[1]!.replace(/-/g, "+").replace(/_/g, "/"),
          "base64",
        ).toString("utf8"),
      ) as { exp?: number };
      if (part.exp)
        maxAge = Math.max(
          1,
          Math.min(maxAge, Math.floor(part.exp - Date.now() / 1000)),
        );
    } catch {}
  }
  return {
    httpOnly: true,
    secure: process.env.AUTH_COOKIE_SECURE === "true",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}
