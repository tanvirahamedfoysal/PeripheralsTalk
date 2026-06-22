import { ArticleQuickTools } from "@/components/article-quick-tools";
import { DashboardPage } from "@/components/dashboard-page";

export default function UserBookmarksPage() {
  return (
    <DashboardPage
      eyebrow="Saved learning"
      title="Your favorite articles."
      description="Keep useful articles close and return to them whenever you need a refresher."
    >
      <ArticleQuickTools mode="bookmark" />
    </DashboardPage>
  );
}
