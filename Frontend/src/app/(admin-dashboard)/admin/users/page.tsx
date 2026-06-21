import { AdminUsersManager } from "@/components/admin-users-manager";
import { DashboardPage } from "@/components/dashboard-page";
import { requireRole } from "@/lib/auth/guards";

export default async function AdminUsersPage() {
  const session = await requireRole("ADMIN");
  return (
    <DashboardPage
      eyebrow="User administration"
      title="Manage platform users."
      description="Promote, revoke, suspend, reactivate and reset passwords using the exact Admin routes. The UI prevents self-suspension even though the backend comparison is unreliable."
    >
      <AdminUsersManager currentUserId={session.user.id} />
    </DashboardPage>
  );
}
