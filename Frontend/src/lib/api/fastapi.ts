interface FastApiRequestOptions extends RequestInit {
  timeoutMs?: number;
}

interface FastApiValidationError {
  msg?: string;
}

interface FastApiErrorBody {
  detail?: string | FastApiValidationError[];
  message?: string;
}

export class FastApiError extends Error {
  readonly status: number;
  readonly details: unknown;

  constructor(
    message: string,
    status: number,
    details: unknown = null
  ) {
    super(message);

    this.name = "FastApiError";
    this.status = status;
    this.details = details;
  }
}

function buildFastApiUrl(endpoint: string): string {
  const baseUrl = (
    process.env.FASTAPI_BASE_URL ??
    "http://127.0.0.1:8000"
  ).replace(/\/$/, "");

  const apiPrefix = (
    process.env.FASTAPI_API_PREFIX ?? "/api/v1"
  )
    .replace(/^\/?/, "/")
    .replace(/\/$/, "");

  const normalizedEndpoint = endpoint.replace(/^\/?/, "/");

  return `${baseUrl}${apiPrefix}${normalizedEndpoint}`;
}

function extractFastApiErrorMessage(
  errorBody: FastApiErrorBody | null
): string {
  if (!errorBody) {
    return "The backend request failed.";
  }

  if (typeof errorBody.detail === "string") {
    return errorBody.detail;
  }

  if (Array.isArray(errorBody.detail)) {
    const validationMessages = errorBody.detail
      .map((error) => error.msg)
      .filter(
        (message): message is string =>
          typeof message === "string"
      );

    if (validationMessages.length > 0) {
      return validationMessages.join(", ");
    }
  }

  if (typeof errorBody.message === "string") {
    return errorBody.message;
  }

  return "The backend request failed.";
}

export async function fastApiRequest<TResponse>(
  endpoint: string,
  options: FastApiRequestOptions = {}
): Promise<TResponse> {
  const {
    timeoutMs = Number(
      process.env.FASTAPI_REQUEST_TIMEOUT_MS ?? 15000
    ),
    headers,
    ...requestOptions
  } = options;

  const abortController = new AbortController();

  const timeoutId = setTimeout(() => {
    abortController.abort();
  }, timeoutMs);

  try {
    const response = await fetch(
      buildFastApiUrl(endpoint),
      {
        ...requestOptions,
        cache: "no-store",
        signal: abortController.signal,

        headers: {
          Accept: "application/json",

          ...(requestOptions.body instanceof FormData
            ? {}
            : {
                "Content-Type": "application/json"
              }),

          ...headers
        }
      }
    );

    const contentType =
      response.headers.get("content-type") ?? "";

    const responseBody = contentType.includes(
      "application/json"
    )
      ? ((await response.json()) as unknown)
      : null;

    if (!response.ok) {
      throw new FastApiError(
        extractFastApiErrorMessage(
          responseBody as FastApiErrorBody | null
        ),
        response.status,
        responseBody
      );
    }

    return responseBody as TResponse;
  } catch (error) {
    if (error instanceof FastApiError) {
      throw error;
    }

    if (
      error instanceof DOMException &&
      error.name === "AbortError"
    ) {
      throw new FastApiError(
        "The FastAPI server took too long to respond.",
        408
      );
    }

    throw new FastApiError(
      "Unable to connect to the FastAPI backend. Make sure it is running on port 8000.",
      503,
      error
    );
  } finally {
    clearTimeout(timeoutId);
  }
}