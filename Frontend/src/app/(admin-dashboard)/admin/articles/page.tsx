"use client";
import { useState } from "react";
import { DashboardPage } from "@/components/dashboard-page";
import { ResourceManager } from "@/components/resource-manager";
import { apiPaths } from "@/lib/api/paths";
export default function Page() {
  const [id, setId] = useState("1");
  return (
    <DashboardPage
      eyebrow="Content control"
      title="All articles."
      description="Inspect, update, activate and permanently remove article records using only the article routes in api.zip."
    >
      <section className="dashboard-section">
        <div className="field" style={{ maxWidth: 300 }}>
          <label className="label">Article ID</label>
          <input className="input" value={id} onChange={(e) => setId(e.target.value)} />
        </div>
      </section>
      <ResourceManager
        title="Get article"
        description="Loads article details."
        path={apiPaths.article.detail(id)}
      />
      <ResourceManager
        title="Update article"
        description="Creates a new version for the selected article ID."
        path={apiPaths.article.update(id)}
        method="POST"
        fields={[
          { name: "title", label: "Title" },
          { name: "content", label: "Content", type: "textarea" },
          { name: "specs", label: "Specs JSON", type: "textarea" },
        ]}
      />
      <ResourceManager
        title="Delete article"
        description="Strict Admin delete operation."
        path={apiPaths.article.remove(id)}
        method="DELETE"
      />
    </DashboardPage>
  );
}
