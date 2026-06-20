"use client";
import type { ApiResult } from "@/lib/api/client";
export function ApiStatus({ result }: { result: ApiResult | null }) {
  if (!result) return null;
  return (
    <div className="api-console" style={{ marginTop: 16 }}>
      <b>{result.ok ? "Backend response" : "Backend error"}</b>
      <p className="muted" style={{ fontSize: 13 }}>
        {result.message}
      </p>
      {result.data !== null && <pre>{JSON.stringify(result.data, null, 2)}</pre>}
    </div>
  );
}
