import { ArticleWorkspace } from "@/components/article-workspace";
import { DashboardPage } from "@/components/dashboard-page";

export default function NewEditorArticlePage() {
  return (
    <DashboardPage
      eyebrow="New content"
      title="Create an article version."
      description="A newly created article version is inactive until an Admin activates it for the selected peripheral."
    >
      <ArticleWorkspace createOnly />
    </DashboardPage>
  );
}
