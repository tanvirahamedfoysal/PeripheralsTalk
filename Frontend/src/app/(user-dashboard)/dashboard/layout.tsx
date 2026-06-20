import { requireAuth } from "@/lib/auth/guards";
import { DashboardShell } from "@/components/dashboard-shell";
export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await requireAuth();
  return (
    <DashboardShell session={session} role="USER">
      {children}
    </DashboardShell>
  );
}
