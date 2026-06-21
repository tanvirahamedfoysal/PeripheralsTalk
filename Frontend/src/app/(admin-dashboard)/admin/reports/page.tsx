import { AdminReports } from "@/components/admin-reports";
import { DashboardPage } from "@/components/dashboard-page";

export default function AdminReportsPage() {
  return (
    <DashboardPage
      eyebrow="Community safety"
      title="Reports and resolution."
      description="Inspect reported comments and users, then resolve pending reports using the supplied Admin endpoints."
    >
      <AdminReports />
    </DashboardPage>
  );
}
