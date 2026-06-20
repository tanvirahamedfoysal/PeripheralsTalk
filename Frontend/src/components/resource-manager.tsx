"use client";
import { useState } from "react";
import { apiRequest, type ApiResult } from "@/lib/api/client";
import { ApiStatus } from "./api-status";
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
  fields?: {
    name: string;
    label: string;
    type?: string;
    placeholder?: string;
  }[];
}) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [result, setResult] = useState<ApiResult | null>(null);
  const [loading, setLoading] = useState(false);
  async function run() {
    setLoading(true);
    const body =
      method === "GET" || method === "DELETE" ? undefined : JSON.stringify(values);
    setResult(await apiRequest(path, { method, body }));
    setLoading(false);
  }
  return (
    <section className="dashboard-section">
      <div className="toolbar">
        <div>
          <h2>{title}</h2>
          <p className="muted" style={{ margin: 0, fontSize: 13 }}>
            {description}
          </p>
        </div>
        <span className="status">
          {method} /api/v1/{path}
        </span>
      </div>
      {fields.length > 0 && (
        <div className="form-grid">
          {fields.map((f) => (
            <div className="field" key={f.name}>
              <label className="label">{f.label}</label>
              {f.type === "textarea" ? (
                <textarea
                  className="textarea"
                  value={values[f.name] || ""}
                  onChange={(e) => setValues({ ...values, [f.name]: e.target.value })}
                  placeholder={f.placeholder}
                />
              ) : (
                <input
                  className="input"
                  type={f.type || "text"}
                  value={values[f.name] || ""}
                  onChange={(e) => setValues({ ...values, [f.name]: e.target.value })}
                  placeholder={f.placeholder}
                />
              )}
            </div>
          ))}
        </div>
      )}
      <button
        className={`button ${method === "DELETE" ? "danger" : ""}`}
        style={{ marginTop: 16 }}
        onClick={run}
        disabled={loading}
      >
        {loading ? "Working…" : `${method} resource`}
      </button>
      <ApiStatus result={result} />
    </section>
  );
}
