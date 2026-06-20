import { requireRole } from "@/lib/auth/guards";
import { DashboardShell } from "@/components/dashboard-shell";
export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await requireRole("EDITOR");
  return (
    <DashboardShell session={session} role="EDITOR">
      {children}
    </DashboardShell>
  );
}
