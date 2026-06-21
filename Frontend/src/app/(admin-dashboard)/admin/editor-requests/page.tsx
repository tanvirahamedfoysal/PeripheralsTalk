import { AdminEditorRequests } from "@/components/admin-editor-requests";
import { DashboardPage } from "@/components/dashboard-page";

export default function AdminEditorRequestsPage() {
  return (
    <DashboardPage
      eyebrow="Role management"
      title="Editor applications."
      description="Review contributor applications and give trusted community members access to editorial tools."
    >
      <AdminEditorRequests />
    </DashboardPage>
  );
}
