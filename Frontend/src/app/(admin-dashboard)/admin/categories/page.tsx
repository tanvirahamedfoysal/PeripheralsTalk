"use client";
import { useState } from "react";
import { DashboardPage } from "@/components/dashboard-page";
import { ResourceManager } from "@/components/resource-manager";
import { apiPaths } from "@/lib/api/paths";
export default function Page() {
  const [id, setId] = useState("1");
  return (
    <DashboardPage
      eyebrow="Taxonomy"
      title="Category management."
      description="Admins can load, add, update and remove peripheral categories. Successful backend operations persist to PostgreSQL through FastAPI."
    >
      <section className="dashboard-section">
        <div className="field" style={{ maxWidth: 300 }}>
          <label className="label">Category ID</label>
          <input className="input" value={id} onChange={(e) => setId(e.target.value)} />
        </div>
      </section>
      <ResourceManager
        title="Load all categories"
        description="Public category list."
        path={apiPaths.category.list}
      />
      <ResourceManager
        title="Add category"
        description="Creates a new category record through FastAPI."
        path={apiPaths.category.create}
        method="POST"
        fields={[
          { name: "name", label: "Category name" },
          { name: "description", label: "Broad description", type: "textarea" },
          {
            name: "specs",
            label: "Specification schema JSON",
            type: "textarea",
          },
        ]}
      />
      <ResourceManager
        title="Update category"
        description="Updates the selected category."
        path={apiPaths.category.update(id)}
        method="PUT"
        fields={[
          { name: "name", label: "Category name" },
          { name: "description", label: "Broad description", type: "textarea" },
        ]}
      />
      <ResourceManager
        title="Remove category"
        description="Deletes the selected category through FastAPI."
        path={apiPaths.category.remove(id)}
        method="DELETE"
      />
    </DashboardPage>
  );
}
