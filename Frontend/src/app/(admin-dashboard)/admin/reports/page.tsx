"use client";
import { useState } from "react";
import { DashboardPage } from "@/components/dashboard-page";
import { ResourceManager } from "@/components/resource-manager";
import { apiPaths } from "@/lib/api/paths";
export default function Page() {
  const [id, setId] = useState("1");
  return (
    <DashboardPage
      eyebrow="Safety"
      title="Reports and resolution."
      description="Review all reports, identify the user behind a comment and mark reports resolved."
    >
      <ResourceManager
        title="Load all reports"
        description="Strict Admin report endpoint."
        path={apiPaths.admin.reports}
      />
      <section className="dashboard-section">
        <div className="field" style={{ maxWidth: 300 }}>
          <label className="label">Report or comment ID</label>
          <input className="input" value={id} onChange={(e) => setId(e.target.value)} />
        </div>
      </section>
      <div className="grid-3">
        <ResourceManager
          title="Resolve report"
          description="Marks report solved."
          path={apiPaths.admin.resolveReport(id)}
          method="POST"
        />
        <ResourceManager
          title="Find user by comment"
          description="Loads user associated with comment."
          path={apiPaths.admin.userByComment(id)}
        />
      </div>
    </DashboardPage>
  );
}
