"use client";

import Link from "next/link";
import {
  ArrowRight,
  Bookmark,
  ExternalLink,
  FileSearch,
  LoaderCircle,
  Trash2,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
} from "react";
import { toast } from "sonner";

import { apiRequest } from "@/lib/api/client";
import { apiPaths } from "@/lib/api/paths";
import type { ApiEnvelope, ArticleRecord } from "@/lib/api/types";
import {
  getSavedArticles,
  removeArticleFromDashboard,
  saveArticleForDashboard,
  SAVED_ARTICLES_EVENT,
  type SavedArticle,
} from "@/lib/saved-articles";
import { useSession } from "@/providers/session-provider";

export function ArticleQuickTools({ mode }: { mode: "bookmark" | "discussion" }) {
  const { session } = useSession();
  const [id, setId] = useState("");
  const [saved, setSaved] = useState<SavedArticle[]>([]);
  const [working, setWorking] = useState<number | "form" | null>(null);

  const refreshSaved = useCallback(() => {
    setSaved(session ? getSavedArticles(session.user.id) : []);
  }, [session]);

  useEffect(() => {
    refreshSaved();
    window.addEventListener(SAVED_ARTICLES_EVENT, refreshSaved);
    return () => window.removeEventListener(SAVED_ARTICLES_EVENT, refreshSaved);
  }, [refreshSaved]);

  async function toggleSavedArticle(articleId: number): Promise<void> {
    if (!session) return;
    setWorking(articleId);
    try {
      const result = await apiRequest<{
        message?: string;
        is_bookmarked?: boolean;
      }>(apiPaths.article.bookmark(articleId), { method: "POST" });

      if (result.is_bookmarked) {
        const articleResponse = await apiRequest<ApiEnvelope<ArticleRecord>>(
          apiPaths.article.detail(articleId),
        );
        saveArticleForDashboard(session.user.id, articleResponse.data);
        toast.success("Saved to dashboard.");
      } else {
        removeArticleFromDashboard(session.user.id, articleId);
        toast.success("Removed from saved articles.");
      }
      refreshSaved();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to update saved article.",
      );
    } finally {
      setWorking(null);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!/^\d+$/.test(id)) return;
    if (mode === "discussion") {
      window.location.assign(`/articles/${id}`);
      return;
    }

    setWorking("form");
    try {
      await toggleSavedArticle(Number(id));
      setId("");
    } finally {
      setWorking(null);
    }
  }

  return (
    <div className="saved-article-dashboard-stack">
      <section className="dashboard-section">
        <div className="toolbar">
          <div>
            <h2>{mode === "bookmark" ? "Save an article" : "Open a discussion"}</h2>
            <p className="muted">
              {mode === "bookmark"
                ? "Enter an article ID to save or remove it from your dashboard."
                : "Open a known article to read the discussion, reply to other learners and share your perspective."}
            </p>
          </div>
          {mode === "bookmark" ? (
            <Bookmark size={28} color="var(--teal)" />
          ) : (
            <FileSearch size={28} color="var(--teal)" />
          )}
        </div>
        <form onSubmit={submit} className="article-id-form">
          <input
            className="input"
            inputMode="numeric"
            pattern="[0-9]+"
            placeholder="Article ID"
            value={id}
            onChange={(event) => setId(event.target.value.replace(/\D/g, ""))}
            required
          />
          <button className="button red" disabled={working !== null}>
            {working === "form" ? (
              <LoaderCircle className="spin" size={17} />
            ) : null}
            {mode === "bookmark" ? "Toggle saved article" : "Open discussion"}{" "}
            <ArrowRight size={17} />
          </button>
        </form>
        <Link href="/articles" className="auth-text-link strong">
          Open the public article library
        </Link>
      </section>

      {mode === "bookmark" ? (
        <section className="dashboard-section">
          <div className="toolbar">
            <div>
              <p className="eyebrow muted">Your learning list</p>
              <h2>Saved articles</h2>
            </div>
            <span className="status aqua">{saved.length} saved</span>
          </div>

          {saved.length > 0 ? (
            <div className="managed-article-list">
              {saved.map((article) => (
                <article className="managed-article-row" key={article.id}>
                  <span className="managed-article-id">#{article.id}</span>
                  <div className="managed-article-copy">
                    <h3>{article.title}</h3>
                    <p className="muted">
                      Saved {new Date(article.savedAt).toLocaleString()} · @{article.author}
                    </p>
                  </div>
                  <div className="actions compact managed-article-actions">
                    <Link
                      className="button compact-button"
                      href={`/articles/${article.id}`}
                    >
                      <ExternalLink size={16} /> Open
                    </Link>
                    <button
                      className="icon-button danger-icon"
                      title="Remove from saved articles"
                      disabled={working !== null}
                      onClick={() => void toggleSavedArticle(article.id)}
                    >
                      {working === article.id ? (
                        <LoaderCircle className="spin" size={16} />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              Save an article from any article page and it will appear here.
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
}
