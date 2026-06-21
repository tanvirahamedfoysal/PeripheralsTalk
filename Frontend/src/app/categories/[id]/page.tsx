import Link from "next/link";
import { ArrowLeft, BookOpenCheck, Layers3 } from "lucide-react";
import { notFound } from "next/navigation";

import { Footer } from "@/components/footer";
import { PublicShell } from "@/components/public-shell";
import { SiteHeader } from "@/components/site-header";
import { backendErrorMessage, fastApi } from "@/lib/api/server";
import type { ApiEnvelope, CategoryDetailRecord } from "@/lib/api/types";
import { getCategory } from "@/lib/constants/categories";
import { sanitizeArticleHtml } from "@/lib/sanitize-html";

export const dynamic = "force-dynamic";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const documented = getCategory(id);
  if (!documented) notFound();

  const result = await fastApi<ApiEnvelope<CategoryDetailRecord>>(`category/${id}`, {
    method: "GET",
  });
  const live = result.ok ? result.data.data : null;
  const Icon = documented.icon;
  const name = live?.name ?? documented.name;
  const articleAvailable = Boolean(result.ok && live?.article?.trim());

  return (
    <PublicShell>
      <SiteHeader />
      <header className="category-hero detail">
        <div className="category-hero-copy">
          <Link href="/categories" className="category-back-link">
            <ArrowLeft size={15} /> All categories
          </Link>
          <p className="eyebrow category-kicker">
            Category {String(documented.id).padStart(2, "0")}
          </p>
          <h1 className="display">{name}.</h1>
          <p className="category-intro">{documented.summary}</p>
        </div>
        <aside className="category-identity-card">
          <div className="category-icon category-detail-icon">
            <Icon size={43} strokeWidth={1.45} />
          </div>
          <div>
            <p className="eyebrow muted">Specification family</p>
            <h2>{documented.specs.length} structured fields</h2>
          </div>
          <div className="category-stat-row">
            <span>
              <Layers3 size={17} /> Documented category
            </span>
            <span>
              <BookOpenCheck size={17} /> Guided learning content
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
            <span className="status aqua">{documented.specs.length} fields</span>
          </div>
          <div className="spec-grid">
            {documented.specs.map((spec, index) => (
              <div className="spec-row" key={spec}>
                <span className="spec-index">{String(index + 1).padStart(2, "0")}</span>
                <b>{spec}</b>
                <span className="muted">Category field</span>
              </div>
            ))}
          </div>
        </section>

        <section className="dashboard-section">
          <div className="toolbar">
            <div>
              <p className="eyebrow muted">Active knowledge article</p>
              <h2>{name}</h2>
            </div>
            <span className={`status ${articleAvailable ? "aqua" : "red"}`}>
              {articleAvailable ? "Available" : "Unavailable"}
            </span>
          </div>

          {articleAvailable && live?.article ? (
            <article
              className="rich-article"
              dangerouslySetInnerHTML={{ __html: sanitizeArticleHtml(live.article) }}
            />
          ) : (
            <div className="availability-message">
              <b>Unavailable</b>
              <p>
                {backendErrorMessage(
                  result.data,
                  `${name} does not currently have an active article.`,
                )}
              </p>
              <small className="muted">
                Check again later or explore another category from the learning
                directory.
              </small>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </PublicShell>
  );
}
