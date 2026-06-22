import { ArticleManager } from "@/components/article-manager";
import { DashboardPage } from "@/components/dashboard-page";

export default function AdminArticlesPage() {
  return (
    <DashboardPage
      eyebrow="Article management"
      title="Find, edit and publish articles."
      description="Search by permanent article ID, edit the current document, and publish the correct version for each peripheral."
    >
      <ArticleManager admin />
    </DashboardPage>
  );
}
