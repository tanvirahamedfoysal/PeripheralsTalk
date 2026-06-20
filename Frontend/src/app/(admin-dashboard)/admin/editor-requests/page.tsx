"use client";
import { useState } from "react";
import { DashboardPage } from "@/components/dashboard-page";
import { ResourceManager } from "@/components/resource-manager";
import { apiPaths } from "@/lib/api/paths";
export default function Page() {
  const [id, setId] = useState("1");
  return (
    <DashboardPage
      eyebrow="Editor workflow"
      title="Review Editor requests."
      description="Load pending requests and approve or revoke Editor status."
    >
      <ResourceManager
        title="Load Editor requests"
        description="Exact Admin request queue route."
        path={apiPaths.admin.editorRequests}
      />
      <section className="dashboard-section">
        <div className="field" style={{ maxWidth: 300 }}>
          <label className="label">User ID</label>
          <input className="input" value={id} onChange={(e) => setId(e.target.value)} />
        </div>
      </section>
      <div className="grid-3">
        <ResourceManager
          title="Approve request"
          description="Promote user to Editor."
          path={apiPaths.admin.makeEditor(id)}
          method="POST"
        />
        <ResourceManager
          title="Revoke Editor"
          description="Return Editor to User role."
          path={apiPaths.admin.revokeEditor(id)}
          method="POST"
        />
      </div>
    </DashboardPage>
  );
}
