import { DashboardPage, Metrics } from "@/components/dashboard-page";
import { ResourceManager } from "@/components/resource-manager";
import { apiPaths } from "@/lib/api/paths";
export default function Page() {
  return (
    <DashboardPage
      eyebrow="User workspace"
      title="Your peripheral activity."
      description="Manage the profile, favourites, comments and Editor-access request supported by the supplied APIs."
    >
      <Metrics
        items={[
          { label: "Role", value: "USER" },
          { label: "Bookmarks", value: "—" },
          { label: "Comments", value: "—" },
          { label: "Ratings", value: "—" },
        ]}
      />
      <ResourceManager
        title="Load account profile"
        description="Fetches your profile and personal data from the existing backend route."
        path={apiPaths.profile.me}
      />
    </DashboardPage>
  );
}
