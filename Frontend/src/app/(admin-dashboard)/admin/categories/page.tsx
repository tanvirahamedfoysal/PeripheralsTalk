import { AdminCategoriesManager } from "@/components/admin-categories-manager";
import { DashboardPage } from "@/components/dashboard-page";

export default function AdminCategoriesPage() {
  return (
    <DashboardPage
      eyebrow="Peripheral taxonomy"
      title="Manage categories."
      description="Create, rename and delete peripheral records through FastAPI. Only the category name is stored by this backend."
    >
      <AdminCategoriesManager />
    </DashboardPage>
  );
}
