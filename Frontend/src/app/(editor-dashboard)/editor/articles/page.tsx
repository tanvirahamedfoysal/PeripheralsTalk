import { ArticleManager } from "@/components/article-manager";
import { DashboardPage } from "@/components/dashboard-page";

export default function EditorArticlesPage() {
  return (
    <DashboardPage
      eyebrow="Content management"
      title="Find and edit articles."
      description="Search by article ID or choose a recent published article. Editing opens the current content in the complete rich-text workspace."
    >
      <ArticleManager />
    </DashboardPage>
  );
}
