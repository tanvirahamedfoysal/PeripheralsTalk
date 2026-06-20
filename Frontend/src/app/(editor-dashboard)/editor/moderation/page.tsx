import { DashboardPage } from "@/components/dashboard-page";
export default function Page() {
  return (
    <DashboardPage
      eyebrow="Moderation"
      title="Community review."
      description="The actual api.zip contains report management under strict Admin routes, not Editor routes."
    >
      <section className="dashboard-section">
        <div className="notice">
          No Editor moderation-queue endpoint exists in the supplied API folder. This
          interface does not call the differently documented endpoint. Admins can use
          the Reports dashboard backed by /api/v1/admin/all-report.
        </div>
      </section>
    </DashboardPage>
  );
}
