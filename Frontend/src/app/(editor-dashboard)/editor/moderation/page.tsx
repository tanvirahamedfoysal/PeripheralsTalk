import { DashboardPage } from "@/components/dashboard-page";

export default function EditorModerationPage() {
  return (
    <DashboardPage
      eyebrow="Backend boundary"
      title="Moderation is Admin-only."
      description="The immutable backend exposes report listing and resolution only under the Admin router. No Editor moderation queue exists."
    >
      <section className="dashboard-section">
        <h2>No unsupported request is made</h2>
        <div className="notice">
          This page intentionally does not call an invented Editor moderation API.
          Report management remains available in the Admin dashboard only.
        </div>
      </section>
    </DashboardPage>
  );
}
