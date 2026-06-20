import { DashboardPage } from "@/components/dashboard-page";
import { ResourceManager } from "@/components/resource-manager";
import { apiPaths } from "@/lib/api/paths";
export default function Page() {
  return (
    <DashboardPage
      eyebrow="Security"
      title="Account settings."
      description="Password reset routes are present in api.zip; the current backend implementation remains incomplete."
    >
      <ResourceManager
        title="Request password reset"
        description="Calls the supplied test email endpoint."
        path={apiPaths.auth.requestReset}
        method="POST"
      />
      <ResourceManager
        title="Reset password"
        description="Calls the supplied reset endpoint."
        path={apiPaths.auth.reset}
        method="POST"
        fields={[
          { name: "token", label: "Reset token" },
          { name: "password", label: "New password", type: "password" },
        ]}
      />
    </DashboardPage>
  );
}
