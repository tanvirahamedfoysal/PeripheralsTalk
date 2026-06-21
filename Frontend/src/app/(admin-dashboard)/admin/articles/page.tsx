import { ArticleWorkspace } from "@/components/article-workspace";
import { DashboardPage } from "@/components/dashboard-page";

export default function AdminArticlesPage() {
  return (
    <DashboardPage
      eyebrow="Article version control"
      title="Manage article versions."
      description="Create and update content, inspect every version for a peripheral, activate one version and permanently delete unreferenced records."
    >
      <ArticleWorkspace admin />
    </DashboardPage>
  );
}
