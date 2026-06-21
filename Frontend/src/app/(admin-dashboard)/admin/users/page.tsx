import { AdminUsersManager } from "@/components/admin-users-manager";
import { DashboardPage } from "@/components/dashboard-page";
import { requireRole } from "@/lib/auth/guards";

export default async function AdminUsersPage() {
  const session = await requireRole("ADMIN");
  return (
    <DashboardPage
      eyebrow="User administration"
      title="Manage platform users."
      description="Manage member access, contributor roles, account status and password assistance with clear administrative controls."
    >
      <AdminUsersManager currentUserId={session.user.id} />
    </DashboardPage>
  );
}
