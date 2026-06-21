import { DashboardShell } from "@/components/dashboard-shell";
import { requireRole } from "@/lib/auth/guards";

export default async function EditorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole("EDITOR");
  return (
    <DashboardShell session={session} role="EDITOR">
      {children}
    </DashboardShell>
  );
}
