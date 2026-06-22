import Link from "next/link";
import { ArrowLeft, BookOpen, Layers3 } from "lucide-react";
import { notFound } from "next/navigation";

import { ArticleExperience } from "@/components/article-experience";
import { Footer } from "@/components/footer";
import { PublicShell } from "@/components/public-shell";
import { SiteHeader } from "@/components/site-header";
import { backendErrorMessage, fastApi } from "@/lib/api/server";
import type {
  ActiveArticleRecord,
  ApiEnvelope,
  CategoryRecord,
} from "@/lib/api/types";
import { getCategory } from "@/lib/constants/categories";

export const dynamic = "force-dynamic";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();

  const [listResult, activeResult] = await Promise.all([
    fastApi<ApiEnvelope<CategoryRecord[]>>("category/", { method: "GET" }),
    fastApi<ApiEnvelope<ActiveArticleRecord | null>>(`article/active-article/${id}`, {
      method: "GET",
    }),
  ]);

  const categories = listResult.ok
    ? [...(listResult.data.data ?? [])].sort((a, b) => a.id - b.id)
    : [];
  const liveRecord = categories.find((category) => category.id === Number(id));
  const documented = getCategory(id);

  if (listResult.ok && !liveRecord) notFound();
  if (!documented && !liveRecord) notFound();

  const activeArticle = activeResult.ok ? activeResult.data.data : null;
  const Icon = documented?.icon ?? Layers3;
  const name = liveRecord?.name ?? documented?.name ?? "Peripheral";
  const summary =
    documented?.summary ??
    "Explore the essential ideas, practical uses and shared learning resources for this peripheral.";
  const position = Math.max(
    1,
    categories.findIndex((category) => category.id === Number(id)) + 1 ||
      documented?.id ||
      1,
  );

  return (
    <PublicShell>
      <SiteHeader />

      <header className="category-title-strip">
        <Link href="/categories" className="category-title-back">
          <ArrowLeft size={15} /> All categories
        </Link>
        <div className="category-title-main">
          <div className="category-title-icon" aria-hidden="true">
            <Icon size={27} strokeWidth={1.6} />
          </div>
          <div>
            <p className="eyebrow">
              Category {String(position).padStart(2, "0")}
            </p>
            <h1>{name}</h1>
            <p>{summary}</p>
          </div>
        </div>
      </header>

      <main className="article-shell category-content compact-category-content">
        <section className="dashboard-section category-spec-section">
          <div className="toolbar">
            <div>
              <p className="eyebrow" style={{ color: "var(--teal)" }}>
                Structured specifications
              </p>
              <h2>What to compare</h2>
            </div>
            <span className="status aqua">
              {documented?.specs.length ?? 0} specifications
            </span>
          </div>

          {documented ? (
            <div className="spec-grid expanded-spec-grid">
              {documented.specs.map((spec, index) => (
                <div className="spec-row" key={spec}>
                  <span className="spec-index">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <b>{spec}</b>
                </div>
              ))}
            </div>
          ) : (
            <div className="notice">
              Specifications for this newly added category will appear as its learning
              guide develops.
            </div>
          )}
        </section>

        {activeArticle?.article_id ? (
          <ArticleExperience articleId={String(activeArticle.article_id)} />
        ) : (
          <section className="dashboard-section active-article-section">
            <div className="toolbar">
              <div>
                <p className="eyebrow muted">Active knowledge article</p>
                <h2>{name}</h2>
              </div>
              <span className="status red">Unavailable</span>
            </div>
            <div className="availability-message">
              <BookOpen size={19} />
              <div>
                <b>Unavailable</b>
                <p>
                  {backendErrorMessage(
                    activeResult.data,
                    `${name} does not currently have an active article.`,
                  )}
                </p>
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </PublicShell>
  );
}
