"use client";

import Link from "next/link";
import { ArrowRight, Clock3, FileText, LoaderCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { extractArticleTitle } from "@/lib/article-document";
import { apiRequest } from "@/lib/api/client";
import { apiPaths } from "@/lib/api/paths";
import type {
  ApiEnvelope,
  ArticleRecord,
  ArticleVersionRecord,
  CategoryRecord,
} from "@/lib/api/types";
import { getRecentArticles, type RecentArticle } from "@/lib/recent-articles";
import { useSession } from "@/providers/session-provider";

export function RecentArticles(): React.ReactElement {
  const { session, loading: sessionLoading } = useSession();
  const [articles, setArticles] = useState<RecentArticle[]>([]);
  const [source, setSource] = useState<"platform" | "device">("device");
  const [loading, setLoading] = useState(true);

  const loadDeviceHistory = useCallback(() => {
    setArticles(getRecentArticles());
    setSource("device");
    setLoading(false);
  }, []);

  const loadAdminLatest = useCallback(async () => {
    setLoading(true);
    try {
      const categoryPayload = await apiRequest<ApiEnvelope<CategoryRecord[]>>(
        apiPaths.category.list,
      );
      const categories = categoryPayload.data ?? [];

      const versionResults = await Promise.allSettled(
        categories.map(async (category) => {
          const response = await apiRequest<ApiEnvelope<ArticleVersionRecord[]>>(
            apiPaths.article.versions(category.id),
          );
          return (response.data ?? []).map((version) => ({
            ...version,
            peripheralId: category.id,
          }));
        }),
      );

      const newest = versionResults
        .flatMap((result) => (result.status === "fulfilled" ? result.value : []))
        .filter((version) => version.is_active)
        .sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )
        .slice(0, 6);

      const detailResults = await Promise.allSettled(
        newest.map((version) =>
          apiRequest<ApiEnvelope<ArticleRecord>>(apiPaths.article.detail(version.id)),
        ),
      );

      const records = detailResults.flatMap((result) => {
        if (result.status !== "fulfilled") return [];
        const article = result.value.data;
        return [
          {
            id: article.id,
            peripheralId: article.peripheral_id,
            title: extractArticleTitle(article.content, `Article #${article.id}`),
            author: article.author_username,
            createdAt: article.created_at,
            openedAt: new Date(article.created_at).getTime(),
          } satisfies RecentArticle,
        ];
      });

      if (records.length > 0) {
        setArticles(records);
        setSource("platform");
      } else {
        loadDeviceHistory();
      }
    } catch {
      loadDeviceHistory();
    } finally {
      setLoading(false);
    }
  }, [loadDeviceHistory]);

  useEffect(() => {
    if (sessionLoading) return;

    if (session?.user.role === "ADMIN") {
      void loadAdminLatest();
      return;
    }

    loadDeviceHistory();
  }, [loadAdminLatest, loadDeviceHistory, session, sessionLoading]);

  useEffect(() => {
    if (source !== "device") return;
    const refresh = () => setArticles(getRecentArticles());
    window.addEventListener("storage", refresh);
    window.addEventListener("peripheralstalk:recent-articles-updated", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("peripheralstalk:recent-articles-updated", refresh);
    };
  }, [source]);

  return (
    <section className="recent-articles-section">
      <div className="recent-articles-heading">
        <div>
          <p className="eyebrow" style={{ color: "var(--sand)" }}>
            Continue learning
          </p>
          <h2>
            {source === "platform"
              ? "Latest active articles"
              : "Recently opened articles"}
          </h2>
          <p className="muted">
            {source === "platform"
              ? "The six newest active lessons available in the learning directory."
              : "Return to the six articles you opened most recently on this device."}
          </p>
        </div>
        {loading ? <LoaderCircle className="spin" size={28} /> : <Clock3 size={28} />}
      </div>

      {articles.length > 0 ? (
        <div className="recent-article-grid">
          {articles.map((article, index) => (
            <Link
              href={`/articles/${article.id}`}
              className="recent-article-card"
              key={article.id}
            >
              <span className="recent-article-index">
                {String(index + 1).padStart(2, "0")}
              </span>
              <FileText size={24} />
              <div>
                <h3>{article.title}</h3>
                <p className="muted">
                  Article #{article.id} · @{article.author}
                </p>
              </div>
              <ArrowRight size={18} />
            </Link>
          ))}
        </div>
      ) : (
        <div className="recent-article-empty">
          {loading ? (
            <LoaderCircle className="spin" size={30} />
          ) : (
            <FileText size={30} />
          )}
          <div>
            <b>{loading ? "Loading recent articles" : "No recent articles yet"}</b>
            <p className="muted">
              {loading
                ? "Please wait while the article list is prepared."
                : "Open an article by ID or browse the category directory. Your latest six articles will appear here automatically."}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
