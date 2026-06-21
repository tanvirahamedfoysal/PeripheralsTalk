import { ArticleWorkspace } from "@/components/article-workspace";
import { DashboardPage } from "@/components/dashboard-page";

export default function NewEditorArticlePage() {
  return (
    <DashboardPage
      eyebrow="New content"
      title="Create an article version."
      description="Create a clear new lesson for a peripheral topic and prepare it for publication review."
    >
      <ArticleWorkspace createOnly />
    </DashboardPage>
  );
}
