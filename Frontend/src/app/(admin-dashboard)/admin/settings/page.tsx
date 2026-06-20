import { DashboardPage } from "@/components/dashboard-page";
import { ResourceManager } from "@/components/resource-manager";
import { apiPaths } from "@/lib/api/paths";
export default function Page() {
  return (
    <DashboardPage
      eyebrow="Administration"
      title="Platform settings."
      description="Only security/profile operations backed by supplied APIs are enabled."
    >
      <ResourceManager
        title="Admin profile"
        description="Load authenticated profile."
        path={apiPaths.profile.me}
      />
      <section className="dashboard-section">
        <h2>API boundary</h2>
        <div className="notice">
          Analytics, system logs and site-content endpoints are described in
          documentation but absent from api.zip. They are not called or fabricated in
          this frontend.
        </div>
      </section>
    </DashboardPage>
  );
}
