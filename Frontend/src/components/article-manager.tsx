"use client";

import Link from "next/link";
import {
  CheckCircle2,
  Edit3,
  Eye,
  FilePlus2,
  Hash,
  LoaderCircle,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { RichTextEditor } from "@/components/rich-text-editor";
import {
  extractArticleTitle,
  parseArticleDocument,
  serializeArticleDocument,
} from "@/lib/article-document";
import { apiRequest } from "@/lib/api/client";
import { apiPaths } from "@/lib/api/paths";
import type {
  ActiveArticleRecord,
  ApiEnvelope,
  ArticleRecord,
  ArticleVersionRecord,
  CategoryRecord,
} from "@/lib/api/types";
import { getRecentArticles } from "@/lib/recent-articles";

interface EditorState {
  article: ArticleRecord;
  title: string;
  bodyHtml: string;
}

export function ArticleManager({ admin = false }: { admin?: boolean }) {
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [articles, setArticles] = useState<ArticleRecord[]>([]);
  const [queryId, setQueryId] = useState("");
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [saving, setSaving] = useState(false);
  const [activating, setActivating] = useState<number | null>(null);

  const categoryMap = useMemo(
    () => new Map(categories.map((category) => [category.id, category.name])),
    [categories],
  );

  const addArticles = useCallback((records: ArticleRecord[]) => {
    setArticles((current) => {
      const map = new Map<number, ArticleRecord>();
      [...records, ...current].forEach((record) => map.set(record.id, record));
      return [...map.values()]
        .sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )
        .slice(0, 30);
    });
  }, []);

  const fetchArticle = useCallback(async (id: number): Promise<ArticleRecord> => {
    const response = await apiRequest<ApiEnvelope<ArticleRecord>>(
      apiPaths.article.detail(id),
    );
    return response.data;
  }, []);

  const loadRecent = useCallback(async () => {
    setLoading(true);
    try {
      const categoryResponse = await apiRequest<ApiEnvelope<CategoryRecord[]>>(
        apiPaths.category.list,
      );
      const categoryRecords = [...(categoryResponse.data ?? [])].sort(
        (a, b) => a.id - b.id,
      );
      setCategories(categoryRecords);

      const ids = new Set<number>();

      if (admin) {
        const versionResults = await Promise.allSettled(
          categoryRecords.map((category) =>
            apiRequest<ApiEnvelope<ArticleVersionRecord[]>>(
              apiPaths.article.versions(category.id),
            ),
          ),
        );
        versionResults.forEach((result) => {
          if (result.status !== "fulfilled") return;
          (result.value.data ?? []).forEach((version) => ids.add(version.id));
        });
      } else {
        const activeResults = await Promise.allSettled(
          categoryRecords.map((category) =>
            apiRequest<ApiEnvelope<ActiveArticleRecord | null>>(
              apiPaths.article.active(category.id),
            ),
          ),
        );
        activeResults.forEach((result) => {
          if (
            result.status === "fulfilled" &&
            result.value.is_successful &&
            result.value.data?.article_id
          ) {
            ids.add(result.value.data.article_id);
          }
        });

        getRecentArticles().forEach((article) => ids.add(article.id));
      }

      const newestIds = [...ids].slice(0, admin ? 40 : 20);
      const details = await Promise.allSettled(newestIds.map(fetchArticle));
      const records = details.flatMap((result) =>
        result.status === "fulfilled" ? [result.value] : [],
      );
      setArticles(
        records.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        ),
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to load recent articles.",
      );
    } finally {
      setLoading(false);
    }
  }, [admin, fetchArticle]);

  useEffect(() => {
    void loadRecent();
  }, [loadRecent]);

  async function searchArticle(): Promise<void> {
    if (!/^\d+$/.test(queryId)) return;
    setSearching(true);
    try {
      const article = await fetchArticle(Number(queryId));
      addArticles([article]);
      openEditor(article);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Article not found.");
    } finally {
      setSearching(false);
    }
  }

  function openEditor(article: ArticleRecord): void {
    const parsed = parseArticleDocument(article.content ?? "");
    setEditor({
      article,
      title: parsed.title || `Article #${article.id}`,
      bodyHtml: parsed.bodyHtml,
    });
  }

  async function saveArticle(): Promise<void> {
    if (!editor || !editor.title.trim() || !hasMeaningfulBody(editor.bodyHtml)) return;
    setSaving(true);
    try {
      const content = serializeArticleDocument(editor.title, editor.bodyHtml);
      const response = await apiRequest<{ message?: string }>(
        apiPaths.article.update(editor.article.id),
        { method: "PUT", body: { content } },
      );
      const updated = { ...editor.article, content };
      addArticles([updated]);
      setEditor({ ...editor, article: updated });
      toast.success(response.message ?? `Article #${editor.article.id} updated.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update article.");
    } finally {
      setSaving(false);
    }
  }

  async function activateArticle(article: ArticleRecord): Promise<void> {
    setActivating(article.id);
    try {
      const response = await apiRequest<{ message?: string }>(
        apiPaths.article.activate(article.peripheral_id, article.id),
        { method: "POST" },
      );
      toast.success(response.message ?? `Article #${article.id} activated.`);
      await loadRecent();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to activate article.",
      );
    } finally {
      setActivating(null);
    }
  }

  const createHref = admin ? "/admin/articles/new" : "/editor/articles/new";

  return (
    <div className="article-management-stack">
      <section className="dashboard-section article-manager-search">
        <div className="toolbar">
          <div>
            <p className="eyebrow muted">Find an article</p>
            <h2>Search by article ID</h2>
            <p className="muted">
              Enter the database-assigned ID to open any article and edit its current
              content.
            </p>
          </div>
          <Link className="button" href={createHref}>
            <FilePlus2 size={17} /> Create article
          </Link>
        </div>
        <div className="article-manager-search-row">
          <label className="field" htmlFor="article-manager-id">
            <span className="label">Article ID</span>
            <input
              id="article-manager-id"
              className="input"
              inputMode="numeric"
              value={queryId}
              onChange={(event) => setQueryId(event.target.value.replace(/\D/g, ""))}
              placeholder="For example: 24"
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void searchArticle();
                }
              }}
            />
          </label>
          <button
            className="button red"
            disabled={!queryId || searching}
            onClick={() => void searchArticle()}
          >
            {searching ? (
              <LoaderCircle className="spin" size={17} />
            ) : (
              <Search size={17} />
            )}
            Find and edit
          </button>
        </div>
      </section>

      <section className="dashboard-section">
        <div className="toolbar">
          <div>
            <p className="eyebrow muted">Recent content</p>
            <h2>{admin ? "Recent article versions" : "Recent published articles"}</h2>
            <p className="muted">
              Every card shows its permanent article ID. Select Edit to open the full
              rich-text workspace with the current content already loaded.
            </p>
          </div>
          <button className="button ghost" onClick={() => void loadRecent()}>
            <RefreshCw size={17} /> Refresh
          </button>
        </div>

        {loading ? (
          <div className="loading-panel">
            <LoaderCircle className="spin" size={22} /> Loading recent articles…
          </div>
        ) : articles.length > 0 ? (
          <div className="managed-article-list">
            {articles.map((article) => {
              const title = extractArticleTitle(
                article.content,
                `Article #${article.id}`,
              );
              return (
                <article className="managed-article-row" key={article.id}>
                  <span className="managed-article-id">
                    <Hash size={14} /> {article.id}
                  </span>
                  <div className="managed-article-copy">
                    <h3>{title}</h3>
                    <p className="muted">
                      {categoryMap.get(article.peripheral_id) ??
                        `Peripheral #${article.peripheral_id}`}{" "}
                      · Version {article.version_number} ·{" "}
                      {article.is_active ? "Published" : "Inactive"}
                    </p>
                  </div>
                  <div className="actions compact managed-article-actions">
                    <Link
                      className="icon-button"
                      title="Preview article"
                      href={`/articles/${article.id}`}
                      target="_blank"
                    >
                      <Eye size={16} />
                    </Link>
                    <button
                      className="button compact-button"
                      onClick={() => openEditor(article)}
                    >
                      <Edit3 size={16} /> Edit
                    </button>
                    {admin && !article.is_active ? (
                      <button
                        className="button ghost compact-button"
                        disabled={activating !== null}
                        onClick={() => void activateArticle(article)}
                      >
                        {activating === article.id ? (
                          <LoaderCircle className="spin" size={16} />
                        ) : (
                          <CheckCircle2 size={16} />
                        )}
                        Publish
                      </button>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            No recent article IDs are available through your current role. Search by a
            known ID to load and edit any article permitted by the backend.
          </div>
        )}
      </section>

      {editor ? (
        <div
          className="article-editor-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) setEditor(null);
          }}
        >
          <section
            className="article-editor-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="article-edit-dialog-title"
          >
            <header className="article-editor-modal-header">
              <div>
                <p className="eyebrow muted">Editing article</p>
                <h2 id="article-edit-dialog-title">
                  <span className="modal-article-id">#{editor.article.id}</span>{" "}
                  {editor.title}
                </h2>
                <p className="muted">
                  The article ID is assigned by the database and cannot be changed.
                </p>
              </div>
              <button
                type="button"
                className="icon-button"
                title="Close editor"
                disabled={saving}
                onClick={() => setEditor(null)}
              >
                <X size={19} />
              </button>
            </header>

            <div className="article-editor-modal-body">
              <RichTextEditor
                title={editor.title}
                bodyHtml={editor.bodyHtml}
                disabled={saving}
                onTitleChange={(title) =>
                  setEditor((state) => (state ? { ...state, title } : state))
                }
                onBodyChange={(bodyHtml) =>
                  setEditor((state) => (state ? { ...state, bodyHtml } : state))
                }
              />
            </div>

            <footer className="article-editor-modal-footer">
              <Link
                className="button ghost"
                href={`/articles/${editor.article.id}`}
                target="_blank"
              >
                <Eye size={17} /> Preview
              </Link>
              <button
                className="button red"
                disabled={
                  saving || !editor.title.trim() || !hasMeaningfulBody(editor.bodyHtml)
                }
                onClick={() => void saveArticle()}
              >
                {saving ? (
                  <LoaderCircle className="spin" size={17} />
                ) : (
                  <Edit3 size={17} />
                )}
                Save article changes
              </button>
            </footer>
          </section>
        </div>
      ) : null}
    </div>
  );
}

function hasMeaningfulBody(value: string): boolean {
  const plainText = value
    .replace(/<img\b[^>]*>/gi, " image ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  return plainText.length > 0 || /<img\b/i.test(value) || /<table\b/i.test(value);
}
