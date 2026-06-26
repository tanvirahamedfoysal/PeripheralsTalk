"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Clock3,
  Layers3,
  LoaderCircle,
  Star,
} from "lucide-react";
import { useEffect, useState } from "react";

import { extractArticleTitle } from "@/lib/article-document";
import { apiRequest } from "@/lib/api/client";
import { apiPaths } from "@/lib/api/paths";
import type {
  ActiveArticleRecord,
  ApiEnvelope,
  ArticleRecord,
  CategoryDetailRecord,
  CategoryRecord,
} from "@/lib/api/types";

interface PreviewRecord {
  article: ArticleRecord | null;
  category: CategoryRecord;
  title: string;
  excerpt: string;
}

export function HomePublishedPreview({
  categories,
}: {
  categories: CategoryRecord[];
}): React.ReactElement {
  const [records, setRecords] = useState<PreviewRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load(): Promise<void> {
      setLoading(true);
      const candidates = [...categories].sort((a, b) => a.id - b.id);

      const results = await Promise.allSettled(
        candidates.map((category) => loadPublishedLesson(category)),
      );

      if (!active) return;

      setRecords(
        results
          .flatMap((result) =>
            result.status === "fulfilled" && result.value ? [result.value] : [],
          )
          .sort((a, b) => {
            const aTime = a.article?.created_at
              ? new Date(a.article.created_at).getTime()
              : 0;
            const bTime = b.article?.created_at
              ? new Date(b.article.created_at).getTime()
              : 0;
            return bTime - aTime || a.category.id - b.category.id;
          })
          .slice(0, 6),
      );
      setLoading(false);
    }

    void load().catch(() => {
      if (active) {
        setRecords([]);
        setLoading(false);
      }
    });

    return () => {
      active = false;
    };
  }, [categories]);

  return (
    <section className="home-published-panel">
      <div className="home-panel-heading">
        <div>
          <p className="eyebrow muted">Recently published</p>
          <h2>Active lessons from the knowledge library</h2>
        </div>
        <Link href="/articles" className="home-text-link">
          Full library <ArrowRight size={16} />
        </Link>
      </div>

      {loading ? (
        <div className="home-preview-loading">
          <LoaderCircle className="spin" size={24} /> Preparing the latest lessons…
        </div>
      ) : records.length > 0 ? (
        <div className="home-published-list">
          {records.map((record, index) => (
            <Link
              href={
                record.article
                  ? `/articles/${record.article.id}`
                  : `/categories/${record.category.id}`
              }
              className="home-published-row"
              key={`${record.category.id}-${record.article?.id ?? "category"}`}
            >
              <span className="home-published-index">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="home-published-icon">
                <BookOpen size={18} />
              </div>
              <div className="home-published-copy">
                <span className="home-published-category">
                  <Layers3 size={13} /> {record.category.name}
                </span>
                <h3>{record.title}</h3>
                <p>{record.excerpt}</p>
              </div>
              <div className="home-published-meta">
                <span>
                  <Star size={13} fill="currentColor" />
                  {record.article
                    ? Number(record.article.average_rating || 0).toFixed(1)
                    : "Live"}
                </span>
                <span>
                  <Clock3 size={13} />
                  {record.article ? `v${record.article.version_number}` : "Active"}
                </span>
              </div>
              <ArrowRight className="home-published-arrow" size={17} />
            </Link>
          ))}
        </div>
      ) : (
        <div className="home-preview-empty">
          <BookOpen size={25} />
          <div>
            <b>Published lessons are temporarily unavailable.</b>
            <p>
              The category directory remains available while the article service is
              refreshed.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

async function loadPublishedLesson(
  category: CategoryRecord,
): Promise<PreviewRecord | null> {
  try {
    const activeResponse = await apiRequest<
      ApiEnvelope<ActiveArticleRecord | null>
    >(apiPaths.article.active(category.id));

    if (activeResponse.is_successful && activeResponse.data?.article_id) {
      const detailResponse = await apiRequest<ApiEnvelope<ArticleRecord>>(
        apiPaths.article.detail(activeResponse.data.article_id),
      );
      const article = detailResponse.data;
      return {
        article,
        category,
        title: extractArticleTitle(
          article.content,
          `${category.name} learning article`,
        ),
        excerpt: toExcerpt(article.content),
      };
    }
  } catch {
    // The category endpoint remains a public fallback for deployments where the
    // dynamic article route shadows the active-article route.
  }

  try {
    const categoryResponse = await apiRequest<ApiEnvelope<CategoryDetailRecord>>(
      apiPaths.category.detail(category.id),
    );
    const content = categoryResponse.data?.article?.trim();
    if (!content) return null;

    return {
      article: null,
      category,
      title: extractArticleTitle(content, `${category.name} learning article`),
      excerpt: toExcerpt(content),
    };
  } catch {
    return null;
  }
}

function toExcerpt(html: string): string {
  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return "Open the lesson to read its complete structured explanation.";
  return text.length > 135 ? `${text.slice(0, 132).trim()}…` : text;
}
