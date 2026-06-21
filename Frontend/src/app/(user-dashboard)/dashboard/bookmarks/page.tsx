import { ArticleQuickTools } from "@/components/article-quick-tools";
import { DashboardPage } from "@/components/dashboard-page";

export default function UserBookmarksPage() {
  return (
    <DashboardPage
      eyebrow="Article interaction"
      title="Bookmarks and ratings."
      description="The backend can toggle a bookmark or submit a rating for a known article, but it does not expose a personal bookmark-list endpoint."
    >
      <ArticleQuickTools mode="bookmark" />
    </DashboardPage>
  );
}
