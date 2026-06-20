import "server-only";

type SameSiteValue = "lax" | "strict" | "none";
type LogLevel = "debug" | "info" | "warn" | "error";

function parsePositiveInteger(
  value: string | undefined,
  fallback: number
): number {
  const parsedValue = Number.parseInt(value ?? "", 10);

  return Number.isFinite(parsedValue) && parsedValue > 0
    ? parsedValue
    : fallback;
}

function parseBoolean(
  value: string | undefined,
  fallback: boolean
): boolean {
  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return fallback;
}

function parseSameSite(
  value: string | undefined
): SameSiteValue {
  if (
    value === "lax" ||
    value === "strict" ||
    value === "none"
  ) {
    return value;
  }

  return "lax";
}

function parseLogLevel(
  value: string | undefined
): LogLevel {
  if (
    value === "debug" ||
    value === "info" ||
    value === "warn" ||
    value === "error"
  ) {
    return value;
  }

  return "info";
}

export const env = {
  NODE_ENV:
    process.env.NODE_ENV ?? "development",

  APP_ENV:
    process.env.APP_ENV ?? "development",

  FASTAPI_BASE_URL:
    process.env.FASTAPI_BASE_URL ??
    "http://127.0.0.1:8000",

  FASTAPI_API_PREFIX:
    process.env.FASTAPI_API_PREFIX ??
    "/api/v1",

  FASTAPI_REQUEST_TIMEOUT_MS:
    parsePositiveInteger(
      process.env.FASTAPI_REQUEST_TIMEOUT_MS,
      15000
    ),

  AUTH_COOKIE_NAME:
    process.env.AUTH_COOKIE_NAME ??
    "peripheralstalk_session",

  AUTH_COOKIE_SECURE:
    parseBoolean(
      process.env.AUTH_COOKIE_SECURE,
      false
    ),

  AUTH_COOKIE_SAME_SITE:
    parseSameSite(
      process.env.AUTH_COOKIE_SAME_SITE
    ),

  AUTH_COOKIE_MAX_AGE_SECONDS:
    parsePositiveInteger(
      process.env.AUTH_COOKIE_MAX_AGE_SECONDS,
      3600
    ),

  AUTH_COOKIE_PATH:
    process.env.AUTH_COOKIE_PATH ?? "/",

  PUBLIC_CONTENT_REVALIDATE_SECONDS:
    parsePositiveInteger(
      process.env.PUBLIC_CONTENT_REVALIDATE_SECONDS,
      60
    ),

  LOG_LEVEL:
    parseLogLevel(process.env.LOG_LEVEL)
} as const;