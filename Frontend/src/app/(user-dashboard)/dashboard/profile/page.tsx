import { DashboardPage } from "@/components/dashboard-page";
import { ResourceManager } from "@/components/resource-manager";
import { apiPaths } from "@/lib/api/paths";
export default function Page() {
  return (
    <DashboardPage
      eyebrow="Account"
      title="Profile management."
      description="Read, update or delete the authenticated profile with the provided endpoints."
    >
      <ResourceManager
        title="Fetch profile"
        description="Load your current profile."
        path={apiPaths.profile.me}
      />
      <ResourceManager
        title="Update profile"
        description="Send fields supported by the backend implementation."
        path={apiPaths.profile.me}
        method="PUT"
        fields={[
          { name: "name", label: "Display name" },
          { name: "image_url", label: "Avatar URL" },
        ]}
      />
      <ResourceManager
        title="Delete profile"
        description="Permanently requests account deletion."
        path={apiPaths.profile.me}
        method="DELETE"
      />
    </DashboardPage>
  );
}
