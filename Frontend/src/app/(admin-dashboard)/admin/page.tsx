import { AdminOverview } from "@/components/admin-overview";
import { DashboardPage } from "@/components/dashboard-page";

export default function AdminDashboardPage() {
  return (
    <DashboardPage
      eyebrow="Administration workspace"
      title="Guide the learning community."
      description="Manage members, learning topics, article versions, contributor applications and community reports from one place."
    >
      <AdminOverview />
    </DashboardPage>
  );
}
