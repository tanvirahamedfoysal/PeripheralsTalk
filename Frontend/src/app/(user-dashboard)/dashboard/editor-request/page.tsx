import { DashboardPage } from "@/components/dashboard-page";
import { ResourceManager } from "@/components/resource-manager";
import { apiPaths } from "@/lib/api/paths";
export default function Page() {
  return (
    <DashboardPage
      eyebrow="Role growth"
      title="Request Editor access."
      description="Notify administrators that you would like to contribute and moderate content."
    >
      <ResourceManager
        title="Submit Editor request"
        description="Uses the exact profile request route."
        path={apiPaths.profile.requestEditor}
        method="POST"
      />
    </DashboardPage>
  );
}
