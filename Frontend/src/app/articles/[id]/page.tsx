import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { ArticleExperience } from "@/components/article-experience";
import { Footer } from "@/components/footer";
import { PublicShell } from "@/components/public-shell";
import { SiteHeader } from "@/components/site-header";

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <PublicShell>
      <SiteHeader />
      <main className="article-shell">
        <Link
          href="/articles"
          className="category-back-link"
          style={{ marginBottom: 22 }}
        >
          <ArrowLeft size={15} /> Article finder
        </Link>
        <ArticleExperience articleId={id} />
      </main>
      <Footer />
    </PublicShell>
  );
}
