import { DashboardPage } from "@/components/dashboard-page";
export default function Page() {
  return (
    <DashboardPage
      eyebrow="Discussion"
      title="Your comments."
      description="api.zip has article-specific comment endpoints but no endpoint for listing all comments by the current user."
    >
      <section className="dashboard-section">
        <div className="notice">
          This page intentionally makes no unauthorized request. Open an article to
          create, edit, delete, vote on or report comments using /api/v1/comment/
          {"{id}"}.
        </div>
      </section>
    </DashboardPage>
  );
}
