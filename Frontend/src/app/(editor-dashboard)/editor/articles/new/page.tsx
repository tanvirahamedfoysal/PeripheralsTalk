"use client";
import { useState } from "react";
import { DashboardPage } from "@/components/dashboard-page";
import { ResourceManager } from "@/components/resource-manager";
import { apiPaths } from "@/lib/api/paths";
export default function Page() {
  const [id, setId] = useState("1");
  return (
    <DashboardPage
      eyebrow="Publishing"
      title="Create or update article."
      description="api.zip exposes POST /article/{article_id}; this form uses that exact route without inventing a separate create endpoint."
    >
      <section className="dashboard-section">
        <div className="field" style={{ maxWidth: 300 }}>
          <label className="label">Article ID</label>
          <input className="input" value={id} onChange={(e) => setId(e.target.value)} />
        </div>
      </section>
      <ResourceManager
        title="Submit article content"
        description="The payload is ready for title, HTML content and JSON specifications when the backend accepts request bodies."
        path={apiPaths.article.update(id)}
        method="POST"
        fields={[
          { name: "title", label: "Title" },
          { name: "content", label: "Article HTML", type: "textarea" },
          {
            name: "specs",
            label: "Specifications JSON",
            type: "textarea",
            placeholder: '{"dpi":26000}',
          },
        ]}
      />
    </DashboardPage>
  );
}
