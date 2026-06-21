import { ArticleQuickTools } from "@/components/article-quick-tools";
import { DashboardPage } from "@/components/dashboard-page";

export default function UserCommentsPage() {
  return (
    <DashboardPage
      eyebrow="Community"
      title="Article discussions."
      description="Open a known article to read nested comments, reply, vote and report inappropriate behavior."
    >
      <ArticleQuickTools mode="discussion" />
    </DashboardPage>
  );
}
