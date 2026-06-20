import { DashboardPage } from "@/components/dashboard-page";
import { ResourceManager } from "@/components/resource-manager";
import { apiPaths } from "@/lib/api/paths";
export default function Page() {
  return (
    <DashboardPage
      eyebrow="Library"
      title="Saved peripherals."
      description="The project documentation assigns personal bookmarks to the profile response, so this page uses only GET /profile/me."
    >
      <ResourceManager
        title="Load profile bookmarks"
        description="No separate bookmark-list API exists in api.zip."
        path={apiPaths.profile.me}
      />
    </DashboardPage>
  );
}
