import { AdminOverview } from "@/components/admin-overview";
import { DashboardPage } from "@/components/dashboard-page";

export default function AdminDashboardPage() {
  return (
    <DashboardPage
      eyebrow="Strict Admin workspace"
      title="Control the platform."
      description="Manage Neon-backed users, categories, article versions, Editor requests and reports through only the immutable FastAPI endpoints."
    >
      <AdminOverview />
    </DashboardPage>
  );
}
