import Link from "next/link";
import { ArrowLeft, BookOpen, Layers3, MessageCircle } from "lucide-react";
import { notFound } from "next/navigation";

import { Footer } from "@/components/footer";
import { PublicShell } from "@/components/public-shell";
import { SiteHeader } from "@/components/site-header";
import { backendErrorMessage, fastApi } from "@/lib/api/server";
import type {
  ActiveArticleRecord,
  ApiEnvelope,
  CategoryDetailRecord,
  CategoryRecord,
} from "@/lib/api/types";
import { getCategory } from "@/lib/constants/categories";
import { sanitizeArticleHtml } from "@/lib/sanitize-html";

export const dynamic = "force-dynamic";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();

  const [listResult, detailResult, activeResult] = await Promise.all([
    fastApi<ApiEnvelope<CategoryRecord[]>>("category/", { method: "GET" }),
    fastApi<ApiEnvelope<CategoryDetailRecord>>(`category/${id}`, {
      method: "GET",
    }),
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

  const live = detailResult.ok ? detailResult.data.data : null;
  const activeArticle = activeResult.ok ? activeResult.data.data : null;
  const Icon = documented?.icon ?? Layers3;
  const name = live?.name ?? liveRecord?.name ?? documented?.name ?? "Peripheral";
  const summary =
    documented?.summary ??
    "Explore the essential ideas, practical uses and shared learning resources for this peripheral.";
  const articleAvailable = Boolean(detailResult.ok && live?.article?.trim());
  const position = Math.max(
    1,
    categories.findIndex((category) => category.id === Number(id)) + 1 ||
      documented?.id ||
      1,
  );

  return (
    <PublicShell>
      <SiteHeader />

      <header className="category-hero detail compact-category-hero">
        <div className="category-hero-copy">
          <Link href="/categories" className="category-back-link">
            <ArrowLeft size={15} /> All categories
          </Link>
          <div className="compact-category-heading">
            <div className="category-icon compact-category-icon">
              <Icon size={30} strokeWidth={1.55} />
            </div>
            <div>
              <p className="eyebrow category-kicker">
                Category {String(position).padStart(2, "0")}
              </p>
              <h1 className="display">{name}.</h1>
              <p className="category-intro">{summary}</p>
            </div>
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

        <section className="dashboard-section active-article-section">
          <div className="toolbar">
            <div>
              <p className="eyebrow muted">Active knowledge article</p>
              <h2>{name}</h2>
            </div>
            <div className="actions compact">
              <span className={`status ${articleAvailable ? "aqua" : "red"}`}>
                {articleAvailable ? "Available" : "Unavailable"}
              </span>
              {activeArticle?.article_id ? (
                <Link
                  className="button compact-button"
                  href={`/articles/${activeArticle.article_id}`}
                >
                  <MessageCircle size={16} /> Read and discuss
                </Link>
              ) : null}
            </div>
          </div>

          {articleAvailable && live?.article ? (
            <article
              className="rich-article"
              dangerouslySetInnerHTML={{ __html: sanitizeArticleHtml(live.article) }}
            />
          ) : (
            <div className="availability-message">
              <BookOpen size={19} />
              <div>
                <b>Unavailable</b>
                <p>
                  {backendErrorMessage(
                    detailResult.data,
                    `${name} does not currently have an active article.`,
                  )}
                </p>
                <small className="muted">
                  Check again later or explore another category from the learning
                  directory.
                </small>
              </div>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </PublicShell>
  );
}
