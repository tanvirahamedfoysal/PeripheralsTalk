import { Footer } from "@/components/footer";
import { PublicShell } from "@/components/public-shell";
import { PublishedArticles } from "@/components/published-articles";
import { SiteHeader } from "@/components/site-header";

export default function ArticlesIndexPage() {
  return (
    <PublicShell>
      <SiteHeader />
      <main className="article-shell article-directory-page article-directory-page-clean">
        <PublishedArticles />
      </main>
      <Footer />
    </PublicShell>
  );
}
