import { ArticleWorkspace } from "@/components/article-workspace";
import { DashboardPage } from "@/components/dashboard-page";

export default function EditorArticlesPage() {
  return (
    <DashboardPage
      eyebrow="Content management"
      title="Article workspace."
      description="Create new lessons, improve existing explanations and keep every article accurate, readable and useful."
    >
      <ArticleWorkspace />
    </DashboardPage>
  );
}
