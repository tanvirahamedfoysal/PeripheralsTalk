"use client";
import { useState } from "react";
import { DashboardPage } from "@/components/dashboard-page";
import { ResourceManager } from "@/components/resource-manager";
import { apiPaths } from "@/lib/api/paths";
export default function Page() {
  const [id, setId] = useState("1");
  return (
    <DashboardPage
      eyebrow="Content"
      title="Article collection."
      description="Load category articles and activate a selected article version."
    >
      <section className="dashboard-section">
        <div className="field" style={{ maxWidth: 300 }}>
          <label className="label">Category ID</label>
          <input className="input" value={id} onChange={(e) => setId(e.target.value)} />
        </div>
      </section>
      <ResourceManager
        title="Load category articles"
        description="GET all article versions/items for the selected category."
        path={apiPaths.article.byCategory(id)}
      />
      <ResourceManager
        title="Make article active"
        description="Activates a chosen article for this category."
        path={apiPaths.article.makeActive(id, "1")}
        method="POST"
        fields={[
          {
            name: "article_id",
            label: "Article ID (update URL manually in backend adapter if needed)",
          },
        ]}
      />
    </DashboardPage>
  );
}
