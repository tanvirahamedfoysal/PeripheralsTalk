"use client";

import { LoaderCircle, Play } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { apiRequest } from "@/lib/api/client";

interface FieldDefinition {
  name: string;
  label: string;
  type?: "text" | "textarea" | "number";
}

export function ResourceManager({
  title,
  description,
  path,
  method = "GET",
  fields = [],
}: {
  title: string;
  description: string;
  path: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  fields?: FieldDefinition[];
}) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [result, setResult] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    try {
      const body =
        fields.length > 0
          ? Object.fromEntries(
              fields.map((field) => [field.name, values[field.name] ?? ""]),
            )
          : undefined;
      const response = await apiRequest(path, { method, body });
      setResult(response);
      toast.success("Backend request completed.");
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : "Request failed" });
      toast.error(error instanceof Error ? error.message : "Request failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="dashboard-section">
      <h2>{title}</h2>
      <p className="muted">{description}</p>
      {fields.map((field) => (
        <div className="field" key={field.name} style={{ marginTop: 14 }}>
          <label className="label">{field.label}</label>
          {field.type === "textarea" ? (
            <textarea
              className="textarea"
              value={values[field.name] ?? ""}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  [field.name]: event.target.value,
                }))
              }
            />
          ) : (
            <input
              className="input"
              type={field.type === "number" ? "number" : "text"}
              value={values[field.name] ?? ""}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  [field.name]: event.target.value,
                }))
              }
            />
          )}
        </div>
      ))}
      <button
        className="button"
        onClick={() => void run()}
        disabled={loading}
        style={{ marginTop: 18 }}
      >
        {loading ? <LoaderCircle className="spin" size={17} /> : <Play size={17} />}
        Run supported request
      </button>
      {result !== null ? (
        <pre className="response-preview">{JSON.stringify(result, null, 2)}</pre>
      ) : null}
    </section>
  );
}
