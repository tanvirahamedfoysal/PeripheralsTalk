import { DashboardPage } from "@/components/dashboard-page";
import { ResourceManager } from "@/components/resource-manager";
import { apiPaths } from "@/lib/api/paths";
export default function Page() {
  return (
    <DashboardPage
      eyebrow="Editor account"
      title="Profile and security."
      description="Use only the shared profile and reset routes supplied by the backend."
    >
      <ResourceManager
        title="Load profile"
        description="Current Editor profile."
        path={apiPaths.profile.me}
      />
      <ResourceManager
        title="Update profile"
        description="Update display information."
        path={apiPaths.profile.me}
        method="PUT"
        fields={[
          { name: "name", label: "Name" },
          { name: "image_url", label: "Avatar URL" },
        ]}
      />
    </DashboardPage>
  );
}
