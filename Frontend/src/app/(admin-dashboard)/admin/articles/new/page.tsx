import { ArticleWorkspace } from "@/components/article-workspace";
import { DashboardPage } from "@/components/dashboard-page";

export default function NewAdminArticlePage() {
  return (
    <DashboardPage
      eyebrow="New content"
      title="Create an article."
      description="Write a complete rich-text article. Its permanent searchable ID is assigned by the database after saving."
    >
      <ArticleWorkspace admin createOnly />
    </DashboardPage>
  );
}
