import { ArticleQuickTools } from "@/components/article-quick-tools";
import { DashboardPage } from "@/components/dashboard-page";

export default function UserBookmarksPage() {
  return (
    <DashboardPage
      eyebrow="Article interaction"
      title="Bookmarks and ratings."
      description="Save useful articles for later and rate lessons after you have explored their content."
    >
      <ArticleQuickTools mode="bookmark" />
    </DashboardPage>
  );
}
