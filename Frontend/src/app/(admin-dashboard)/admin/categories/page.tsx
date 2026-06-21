import { AdminCategoriesManager } from "@/components/admin-categories-manager";
import { DashboardPage } from "@/components/dashboard-page";

export default function AdminCategoriesPage() {
  return (
    <DashboardPage
      eyebrow="Peripheral taxonomy"
      title="Manage categories."
      description="Organize the learning directory by creating, renaming and retiring peripheral categories as the curriculum grows."
    >
      <AdminCategoriesManager />
    </DashboardPage>
  );
}
