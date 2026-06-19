import { ApiError } from "@/lib/api/api-error";

interface ClientApiRequestOptions extends RequestInit {
  parseJson?: boolean;
}

interface ClientErrorBody {
  message?: string;
  detail?: string;
  code?: string;
}

export async function clientApiRequest<TResponse>(
  path: string,
  options: ClientApiRequestOptions = {}
): Promise<TResponse> {
  const { headers, parseJson = true, ...restOptions } = options;

  const response = await fetch(path, {
    ...restOptions,
    headers: {
      Accept: "application/json",
      ...(restOptions.body instanceof FormData
        ? {}
        : {
            "Content-Type": "application/json"
          }),
      ...headers
    }
  });

  const contentType = response.headers.get("content-type");
  const hasJson = contentType?.includes("application/json");

  const responseBody = hasJson
    ? ((await response.json()) as unknown)
    : null;

  if (!response.ok) {
    const errorBody = responseBody as ClientErrorBody | null;

    throw new ApiError({
      status: response.status,
      message:
        errorBody?.message ??
        errorBody?.detail ??
        "Request failed.",
      code: errorBody?.code,
      details: responseBody
    });
  }

  if (!parseJson) {
    return undefined as TResponse;
  }

  return responseBody as TResponse;
}