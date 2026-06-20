"use client";

import { ArrowLeft, ArrowRight, Database, Layers3 } from "lucide-react";
import Link from "next/link";
import { use, useEffect, useState } from "react";

import { Footer } from "@/components/footer";
import { PublicShell } from "@/components/public-shell";
import { SiteHeader } from "@/components/site-header";
import { apiRequest, meaningfulData, type ApiResult } from "@/lib/api/client";
import { apiPaths } from "@/lib/api/paths";
import { getCategory } from "@/lib/constants/categories";

interface CategoryPageProps {
  params: Promise<{ id: string }>;
}

function getUnavailableMessage(
  result: ApiResult | null,
  fallback: string,
): string {
  if (result === null) {
    return "Loading information...";
  }

  const message = result.message.trim();

  if (!message || message === "Request completed") {
    return fallback;
  }

  return message;
}

export default function CategoryPage({
  params,
}: CategoryPageProps): React.ReactElement {
  const { id } = use(params);
  const category = getCategory(id);
  const [categoryResult, setCategoryResult] = useState<ApiResult | null>(null);
  const [articleResult, setArticleResult] = useState<ApiResult | null>(null);

  useEffect(() => {
    let active = true;

    Promise.all([
      apiRequest(apiPaths.category.detail(id)),
      apiRequest(apiPaths.article.byCategory(id)),
    ]).then(([categoryResponse, articleResponse]) => {
      if (active) {
        setCategoryResult(categoryResponse);
        setArticleResult(articleResponse);
      }
    });

    return () => {
      active = false;
    };
  }, [id]);

  if (!category) {
    return (
      <PublicShell>
        <SiteHeader />
        <main className="article-shell">
          <section className="dashboard-section">
            <p className="eyebrow" style={{ color: "var(--red)" }}>
              Unknown category
            </p>
            <h1 className="section-title">Category not found.</h1>
            <p className="muted">
              The requested peripheral category does not exist in the documented
              fourteen-category directory.
            </p>
            <Link className="button" href="/categories">
              <ArrowLeft size={17} aria-hidden="true" />
              Back to categories
            </Link>
          </section>
        </main>
        <Footer />
      </PublicShell>
    );
  }

  const Icon = category.icon;
  const hasCategoryData = Boolean(
    categoryResult?.ok && meaningfulData(categoryResult.data),
  );
  const hasArticleData = Boolean(
    articleResult?.ok && meaningfulData(articleResult.data),
  );

  const categoryStatus =
    categoryResult === null
      ? "Loading"
      : hasCategoryData
        ? "Available"
        : "Unavailable";

  const articleStatus =
    articleResult === null
      ? "Loading"
      : hasArticleData
        ? "Available"
        : "Unavailable";

  return (
    <PublicShell>
      <SiteHeader />

      <header className="category-hero detail">
        <div className="category-hero-copy">
          <Link href="/categories" className="category-back-link">
            <ArrowLeft size={15} aria-hidden="true" />
            All categories
          </Link>

          <p className="eyebrow category-kicker">
            Category {String(category.id).padStart(2, "0")}
          </p>

          <h1 className="display">{category.name}.</h1>
          <p className="category-intro">{category.summary}</p>
        </div>

        <aside className="category-identity-card">
          <div className="category-icon category-detail-icon">
            <Icon size={43} strokeWidth={1.45} aria-hidden="true" />
          </div>

          <div>
            <p className="eyebrow muted">Specification family</p>
            <h2>{category.specs.length} structured fields</h2>
          </div>

          <div className="category-stat-row">
            <span>
              <Layers3 size={17} aria-hidden="true" />
              Documented category
            </span>
            <span>
              <Database size={17} aria-hidden="true" />
              API-ready
            </span>
          </div>
        </aside>
      </header>

      <main className="article-shell category-content">
        <section className="dashboard-section category-spec-section">
          <div className="toolbar">
            <div>
              <p className="eyebrow" style={{ color: "var(--teal)" }}>
                Technical vocabulary
              </p>
              <h2>Structured specifications</h2>
            </div>
            <span className="status aqua">{category.specs.length} fields</span>
          </div>

          <div className="spec-grid">
            {category.specs.map((specification, index) => (
              <div className="spec-row" key={specification}>
                <span className="spec-index">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <b>{specification}</b>
                <span className="muted">Category field</span>
              </div>
            ))}
          </div>
        </section>

        <div className="category-api-grid">
          <section className="dashboard-section">
            <div className="toolbar">
              <div>
                <p className="eyebrow muted">Category information</p>
                <h2>{category.name}</h2>
              </div>
              <span
                className={`status ${
                  categoryResult === null
                    ? ""
                    : hasCategoryData
                      ? "aqua"
                      : "red"
                }`}
              >
                {categoryStatus}
              </span>
            </div>

            {hasCategoryData ? (
              <pre>{JSON.stringify(categoryResult?.data, null, 2)}</pre>
            ) : (
              <div className="availability-message" role="status">
                <b>{categoryStatus}</b>
                <p>
                  {getUnavailableMessage(
                    categoryResult,
                    `${category.name} information is currently unavailable.`,
                  )}
                </p>
              </div>
            )}
          </section>

          <section className="dashboard-section">
            <div className="toolbar">
              <div>
                <p className="eyebrow muted">Content collection</p>
                <h2>Articles in {category.name}</h2>
              </div>
              <span
                className={`status ${
                  articleResult === null
                    ? ""
                    : hasArticleData
                      ? "aqua"
                      : "red"
                }`}
              >
                {articleStatus}
              </span>
            </div>

            {hasArticleData ? (
              <pre>{JSON.stringify(articleResult?.data, null, 2)}</pre>
            ) : (
              <div className="availability-message" role="status">
                <b>{articleStatus}</b>
                <p>
                  {getUnavailableMessage(
                    articleResult,
                    `Articles for ${category.name} are currently unavailable.`,
                  )}
                </p>
              </div>
            )}

            <Link className="button category-preview-button" href={`/articles/${id}`}>
              Open article preview
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </section>
        </div>
      </main>

      <Footer />
    </PublicShell>
  );
}
