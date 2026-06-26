import { ArticleQuickTools } from "@/components/article-quick-tools";
import { DashboardPage } from "@/components/dashboard-page";

export default function EditorBookmarksPage() {
  return (
    <DashboardPage
      eyebrow="Saved learning"
      title="Your favorite articles."
      description="Keep important references close while writing, editing, and supporting learners."
    >
      <ArticleQuickTools mode="bookmark" />
    </DashboardPage>
  );
}
