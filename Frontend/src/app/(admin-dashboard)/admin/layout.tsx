import { DashboardShell } from "@/components/dashboard-shell";
import { requireRole } from "@/lib/auth/guards";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole("ADMIN");
  return (
    <DashboardShell session={session} role="ADMIN">
      {children}
    </DashboardShell>
  );
}
