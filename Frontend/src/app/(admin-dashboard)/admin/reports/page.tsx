import { AdminReports } from "@/components/admin-reports";
import { DashboardPage } from "@/components/dashboard-page";

export default function AdminReportsPage() {
  return (
    <DashboardPage
      eyebrow="Community safety"
      title="Reports and resolution."
      description="Review community concerns, understand their context and resolve each report with a clear decision."
    >
      <AdminReports />
    </DashboardPage>
  );
}
