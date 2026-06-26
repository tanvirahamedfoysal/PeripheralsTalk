import { ArticleQuickTools } from "@/components/article-quick-tools";
import { DashboardPage } from "@/components/dashboard-page";

export default function AdminBookmarksPage() {
  return (
    <DashboardPage
      eyebrow="Saved learning"
      title="Your favorite articles."
      description="Save platform articles you want to review, audit, improve or return to later."
    >
      <ArticleQuickTools mode="bookmark" />
    </DashboardPage>
  );
}
