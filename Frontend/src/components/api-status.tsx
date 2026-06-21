export function ApiStatus({
  status,
  message,
}: {
  status?: "idle" | "loading" | "success" | "error";
  message?: string;
}) {
  if (!status || status === "idle") return null;
  return (
    <div
      className={
        status === "error"
          ? "error-box"
          : status === "success"
            ? "success-box"
            : "notice"
      }
    >
      {message ?? (status === "loading" ? "Loading…" : status)}
    </div>
  );
}
