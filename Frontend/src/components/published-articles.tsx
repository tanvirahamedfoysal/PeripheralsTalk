"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Layers3,
  LoaderCircle,
  SearchX,
  Star,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

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
import { useSession } from "@/providers/session-provider";

interface PublishedArticleCard {
  article: ArticleRecord | null;
  category: CategoryRecord;
  content: string;
  title: string;
}

async function loadPublishedForCategory(
  category: CategoryRecord,
): Promise<PublishedArticleCard | null> {
  try {
    const active = await apiRequest<ApiEnvelope<ActiveArticleRecord | null>>(
      apiPaths.article.active(category.id),
    );

    if (active.is_successful && active.data?.article_id) {
      const detail = await apiRequest<ApiEnvelope<ArticleRecord>>(
        apiPaths.article.detail(active.data.article_id),
      );
      return {
        article: detail.data,
        category,
        content: detail.data.content,
        title: extractArticleTitle(
          detail.data.content,
          `${category.name} learning article`,
        ),
      };
    }
  } catch {
    // Some older deployments place the dynamic /article/{id} route before the
    // active-article route. The category endpoint is the public fallback.
  }

  try {
    const categoryDetail = await apiRequest<ApiEnvelope<CategoryDetailRecord>>(
      apiPaths.category.detail(category.id),
    );
    if (!categoryDetail.data?.article?.trim()) return null;

    return {
      article: null,
      category,
      content: categoryDetail.data.article,
      title: extractArticleTitle(
        categoryDetail.data.article,
        `${category.name} learning article`,
      ),
    };
  } catch {
    return null;
  }
}

export function PublishedArticles(): React.ReactElement {
  const { session } = useSession();
  const [records, setRecords] = useState<PublishedArticleCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const categoriesPayload = await apiRequest<ApiEnvelope<CategoryRecord[]>>(
        apiPaths.category.list,
      );
      const categories = [...(categoriesPayload.data ?? [])].sort(
        (a, b) => a.id - b.id,
      );
      const results = await Promise.allSettled(
        categories.map((category) => loadPublishedForCategory(category)),
      );

      const available = results
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
        });
      setRecords(available);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const privileged = session?.user.role === "ADMIN" || session?.user.role === "EDITOR";
  const normalizedQuery = query.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      records.filter((record) => {
        if (!normalizedQuery) return true;
        return (
          record.title.toLowerCase().includes(normalizedQuery) ||
          record.category.name.toLowerCase().includes(normalizedQuery) ||
          (record.article && String(record.article.id).includes(normalizedQuery))
        );
      }),
    [normalizedQuery, records],
  );

  return (
    <section className="published-articles-section">
      <div className="published-articles-heading">
        <div>
          <p className="eyebrow" style={{ color: "var(--sand)" }}>
            Published library
          </p>
          <h2>Browse every available article.</h2>
          <p className="muted">
            Open the current published lesson for each peripheral, or use the article ID
            finder above when you already know the exact record.
          </p>
        </div>
        {loading ? <LoaderCircle className="spin" size={28} /> : <BookOpen size={28} />}
      </div>

      <label className="article-library-search">
        <span className="sr-only">Filter published articles</span>
        <input
          className="input"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Filter by title, category or article ID"
        />
      </label>

      {filtered.length > 0 ? (
        <div className="published-article-grid">
          {filtered.map((record) => {
            const href = record.article
              ? `/articles/${record.article.id}`
              : `/categories/${record.category.id}`;
            return (
              <Link
                href={href}
                className="published-article-card"
                key={`${record.category.id}-${record.article?.id ?? "category"}`}
              >
                <div className="published-card-topline">
                  <span className="category-pill">
                    <Layers3 size={14} /> {record.category.name}
                  </span>
                  {privileged && record.article ? (
                    <span className="article-id-pill">#{record.article.id}</span>
                  ) : null}
                </div>
                <h3>{record.title}</h3>
                <p className="muted published-article-excerpt">
                  {plainExcerpt(record.content)}
                </p>
                <div className="published-card-footer">
                  <span>
                    {record.article?.author_username
                      ? `@${record.article.author_username}`
                      : "Published learning content"}
                  </span>
                  {session && record.article ? (
                    <span className="published-rating">
                      <Star size={14} fill="currentColor" />
                      {Number(record.article.average_rating || 0).toFixed(1)}
                    </span>
                  ) : null}
                  <ArrowRight size={17} />
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="recent-article-empty">
          {loading ? (
            <LoaderCircle className="spin" size={30} />
          ) : (
            <SearchX size={30} />
          )}
          <div>
            <b>{loading ? "Loading published articles" : "No matching article"}</b>
            <p className="muted">
              {loading
                ? "The published library is being prepared."
                : "Try another title, category, or article ID."}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

function plainExcerpt(html: string): string {
  const plain = html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
  if (!plain) return "Open this lesson to read the full article.";
  return plain.length > 170 ? `${plain.slice(0, 167).trim()}…` : plain;
}
