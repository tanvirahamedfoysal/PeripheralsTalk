import Link from "next/link";
import { ArrowLeft, BookOpenCheck, Layers3 } from "lucide-react";
import { notFound } from "next/navigation";

import { Footer } from "@/components/footer";
import { PublicShell } from "@/components/public-shell";
import { SiteHeader } from "@/components/site-header";
import { backendErrorMessage, fastApi } from "@/lib/api/server";
import type {
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

  const [listResult, detailResult] = await Promise.all([
    fastApi<ApiEnvelope<CategoryRecord[]>>("category/", { method: "GET" }),
    fastApi<ApiEnvelope<CategoryDetailRecord>>(`category/${id}`, {
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
      <header className="category-hero detail">
        <div className="category-hero-copy">
          <Link href="/categories" className="category-back-link">
            <ArrowLeft size={15} /> All categories
          </Link>
          <p className="eyebrow category-kicker">
            Category {String(position).padStart(2, "0")}
          </p>
          <h1 className="display">{name}.</h1>
          <p className="category-intro">{summary}</p>
        </div>
        <aside className="category-identity-card">
          <div className="category-icon category-detail-icon">
            <Icon size={43} strokeWidth={1.45} />
          </div>
          <div>
            <p className="eyebrow muted">Learning topic</p>
            <h2>
              {documented
                ? `${documented.specs.length} structured fields`
                : "Community learning category"}
            </h2>
          </div>
          <div className="category-stat-row">
            <span>
              <Layers3 size={17} /> Organized topic
            </span>
            <span>
              <BookOpenCheck size={17} /> Guided learning content
            </span>
          </div>
        </aside>
      </header>

      <main className="article-shell category-content">
        {documented ? (
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
                  <span className="spec-index">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <b>{spec}</b>
                  <span className="muted">Category field</span>
                </div>
              ))}
            </div>
          </section>
        ) : (
          <section className="dashboard-section category-spec-section">
            <p className="eyebrow" style={{ color: "var(--teal)" }}>
              Learning pathway
            </p>
            <h2>Start with the active article</h2>
            <p className="muted" style={{ marginBottom: 0 }}>
              This newly added category will grow as Editors publish and refine its
              learning material.
            </p>
          </section>
        )}

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
                  detailResult.data,
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
