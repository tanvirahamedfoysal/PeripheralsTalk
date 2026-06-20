import { DashboardPage, Metrics } from "@/components/dashboard-page";
import { ResourceManager } from "@/components/resource-manager";
import { apiPaths } from "@/lib/api/paths";
export default function Page() {
  return (
    <DashboardPage
      eyebrow="Strict admin workspace"
      title="Control the platform."
      description="Manage users, Editor access, categories, reports and password resets through only the supplied admin and category endpoints."
    >
      <Metrics
        items={[
          { label: "Role", value: "ADMIN" },
          { label: "Users", value: "—" },
          { label: "Categories", value: "14+" },
          { label: "Reports", value: "—" },
        ]}
      />
      <ResourceManager
        title="Load all users"
        description="Uses GET /api/v1/profile/all because that is the user-list route present in api.zip."
        path={apiPaths.profile.all}
      />
    </DashboardPage>
  );
}
