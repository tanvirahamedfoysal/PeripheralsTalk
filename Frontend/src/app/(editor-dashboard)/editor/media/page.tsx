"use client";
import { useState } from "react";
import { DashboardPage } from "@/components/dashboard-page";
import { ApiStatus } from "@/components/api-status";
import { apiRequest, type ApiResult } from "@/lib/api/client";
import { apiPaths } from "@/lib/api/paths";
export default function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ApiResult | null>(null);
  async function upload() {
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    setResult(
      await apiRequest(apiPaths.utility.upload, { method: "POST", body: form }),
    );
  }
  return (
    <DashboardPage
      eyebrow="Media"
      title="Upload images."
      description="Images are sent only to POST /api/v1/utility/upload-image."
    >
      <section className="dashboard-section">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <button
          className="button"
          onClick={upload}
          disabled={!file}
          style={{ marginLeft: 12 }}
        >
          Upload
        </button>
        <ApiStatus result={result} />
      </section>
    </DashboardPage>
  );
}
