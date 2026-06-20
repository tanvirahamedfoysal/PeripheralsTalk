"use client";
import { useState } from "react";
import { DashboardPage } from "@/components/dashboard-page";
import { ResourceManager } from "@/components/resource-manager";
import { apiPaths } from "@/lib/api/paths";
export default function Page() {
  const [id, setId] = useState("1");
  return (
    <DashboardPage
      eyebrow="User control"
      title="Accounts and roles."
      description="Load users, promote or demote Editors, and suspend or unsuspend accounts."
    >
      <section className="dashboard-section">
        <div className="field" style={{ maxWidth: 300 }}>
          <label className="label">Target user ID</label>
          <input className="input" value={id} onChange={(e) => setId(e.target.value)} />
        </div>
      </section>
      <ResourceManager
        title="Load all users"
        description="Existing profile list endpoint."
        path={apiPaths.profile.all}
      />
      <div className="grid-3">
        <ResourceManager
          title="Promote to Editor"
          description="Admin role action."
          path={apiPaths.admin.makeEditor(id)}
          method="POST"
        />
        <ResourceManager
          title="Revoke Editor"
          description="Demote to User."
          path={apiPaths.admin.revokeEditor(id)}
          method="POST"
        />
        <ResourceManager
          title="Suspend user"
          description="Lock account."
          path={apiPaths.admin.suspend(id)}
          method="POST"
        />
        <ResourceManager
          title="Unsuspend user"
          description="Restore account."
          path={apiPaths.admin.unsuspend(id)}
          method="POST"
        />
        <ResourceManager
          title="Reset password"
          description="Admin password override."
          path={apiPaths.admin.resetPassword(id)}
          method="POST"
          fields={[{ name: "password", label: "New password", type: "password" }]}
        />
      </div>
    </DashboardPage>
  );
}
