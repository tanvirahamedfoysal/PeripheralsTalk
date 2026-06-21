import { ArticleWorkspace } from "@/components/article-workspace";
import { DashboardPage } from "@/components/dashboard-page";

export default function EditorArticlesPage() {
  return (
    <DashboardPage
      eyebrow="Content management"
      title="Article workspace."
      description="Editors can create new versions and update a known article record. Listing all versions and activating one are Admin-only backend operations."
    >
      <ArticleWorkspace />
    </DashboardPage>
  );
}
