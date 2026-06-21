import { DashboardShell } from "@/components/dashboard-shell";
import { requireRole } from "@/lib/auth/guards";

export default async function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole("USER");
  return (
    <DashboardShell session={session} role="USER">
      {children}
    </DashboardShell>
  );
}
