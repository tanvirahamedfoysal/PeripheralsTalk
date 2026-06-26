import { ArticleWorkspace } from "@/components/article-workspace";
import { DashboardPage } from "@/components/dashboard-page";

export default function NewAdminArticlePage() {
  return (
    <DashboardPage
      eyebrow="New content"
      title="Create an article."
      description="Write a complete article. You can add headings, images, tables, equations and more. You can also add multiple sections to your article."
    >
      <ArticleWorkspace admin createOnly />
    </DashboardPage>
  );
}
