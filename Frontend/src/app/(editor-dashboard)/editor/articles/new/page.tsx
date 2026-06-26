import { ArticleWorkspace } from "@/components/article-workspace";
import { DashboardPage } from "@/components/dashboard-page";

export default function NewEditorArticlePage() {
  return (
    <DashboardPage
      eyebrow="New content"
      title="Create an article."
      description="Create a complete article here. You can add headings, images, tables, equations and more. You can also add multiple sections to your article."
    >
      <ArticleWorkspace createOnly />
    </DashboardPage>
  );
}
