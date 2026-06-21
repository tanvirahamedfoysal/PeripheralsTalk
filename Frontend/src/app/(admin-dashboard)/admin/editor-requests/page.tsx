import { AdminEditorRequests } from "@/components/admin-editor-requests";
import { DashboardPage } from "@/components/dashboard-page";

export default function AdminEditorRequestsPage() {
  return (
    <DashboardPage
      eyebrow="Role management"
      title="Editor applications."
      description="Review submitted applications and promote approved users to Editor. The backend automatically approves pending applications when the role changes."
    >
      <AdminEditorRequests />
    </DashboardPage>
  );
}
