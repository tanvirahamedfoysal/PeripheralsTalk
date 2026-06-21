import "server-only";

function positiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  FASTAPI_BASE_URL:
    process.env.FASTAPI_BASE_URL ?? "https://peripheralstalk-106b064b.fastapicloud.dev",
  FASTAPI_API_PREFIX: process.env.FASTAPI_API_PREFIX ?? "/api/v1",
  FASTAPI_REQUEST_TIMEOUT_MS: positiveInt(
    process.env.FASTAPI_REQUEST_TIMEOUT_MS,
    20000,
  ),
  AUTH_COOKIE_NAME: process.env.AUTH_COOKIE_NAME ?? "peripheralstalk_session",
  AUTH_COOKIE_SECURE:
    process.env.AUTH_COOKIE_SECURE === "true" || process.env.NODE_ENV === "production",
  AUTH_COOKIE_MAX_AGE_SECONDS: positiveInt(
    process.env.AUTH_COOKIE_MAX_AGE_SECONDS,
    3600,
  ),
} as const;
