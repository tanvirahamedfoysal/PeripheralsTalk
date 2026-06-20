import { DashboardPage, Metrics } from "@/components/dashboard-page";
export default function Page() {
  return (
    <DashboardPage
      eyebrow="Editor workspace"
      title="Publish with accountability."
      description="Create and update peripheral content, manage article state, upload media and review moderation information where the supplied APIs permit it."
    >
      <Metrics
        items={[
          { label: "Role", value: "EDITOR" },
          { label: "Articles", value: "—" },
          { label: "Versions", value: "—" },
          { label: "Reports", value: "—" },
        ]}
      />
      <section className="dashboard-section">
        <h2>Editorial readiness</h2>
        <div className="notice">
          The UI is fully wired to the exact article, comment and upload endpoints from
          api.zip. The backend currently returns placeholder responses for most
          operations.
        </div>
      </section>
    </DashboardPage>
  );
}
