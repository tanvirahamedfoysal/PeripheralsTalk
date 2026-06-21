"use client";

import Link from "next/link";
import {
  CheckCircle2,
  Eye,
  FilePlus2,
  LoaderCircle,
  Pencil,
  RefreshCw,
  Save,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { apiRequest } from "@/lib/api/client";
import { apiPaths } from "@/lib/api/paths";
import type {
  ApiEnvelope,
  ArticleRecord,
  ArticleVersionRecord,
  CategoryRecord,
} from "@/lib/api/types";

export function ArticleWorkspace({
  admin = false,
  createOnly = false,
}: {
  admin?: boolean;
  createOnly?: boolean;
}) {
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [peripheralId, setPeripheralId] = useState("1");
  const [content, setContent] = useState("");
  const [articleId, setArticleId] = useState("");
  const [versions, setVersions] = useState<ArticleVersionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState<string | null>(null);

  const selectedCategory = useMemo(
    () => categories.find((category) => String(category.id) === peripheralId),
    [categories, peripheralId],
  );

  const loadCategories = useCallback(async () => {
    try {
      const response = await apiRequest<ApiEnvelope<CategoryRecord[]>>(
        apiPaths.category.list,
      );
      const records = response.data ?? [];
      setCategories(records);
      if (records.length > 0) {
        setPeripheralId((current) =>
          records.some((item) => String(item.id) === current)
            ? current
            : String(records[0].id),
        );
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to load categories.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const loadVersions = useCallback(async () => {
    if (!admin || !peripheralId) return;
    try {
      const response = await apiRequest<ApiEnvelope<ArticleVersionRecord[]>>(
        apiPaths.article.versions(peripheralId),
      );
      setVersions(response.data ?? []);
    } catch (error) {
      setVersions([]);
      toast.error(error instanceof Error ? error.message : "Unable to load versions.");
    }
  }, [admin, peripheralId]);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);
  useEffect(() => {
    void loadVersions();
  }, [loadVersions]);

  async function createVersion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!content.trim()) return;
    setWorking("create");
    try {
      const response = await apiRequest<{
        message?: string;
        data?: { article_id?: number };
      }>(apiPaths.article.create, {
        method: "POST",
        body: { peripheral_id: Number(peripheralId), content: content.trim() },
      });
      toast.success(response.message ?? "New article version created.");
      if (response.data?.article_id) setArticleId(String(response.data.article_id));
      setContent("");
      await loadVersions();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to create article version.",
      );
    } finally {
      setWorking(null);
    }
  }

  async function loadArticle() {
    if (!/^\d+$/.test(articleId)) return;
    setWorking("load");
    try {
      const response = await apiRequest<ApiEnvelope<ArticleRecord>>(
        apiPaths.article.detail(articleId),
      );
      setContent(response.data.content ?? "");
      setPeripheralId(String(response.data.peripheral_id));
      toast.success(`Loaded article version ${response.data.version_number}.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load article.");
    } finally {
      setWorking(null);
    }
  }

  async function updateArticle() {
    if (!/^\d+$/.test(articleId) || !content.trim()) return;
    setWorking("update");
    try {
      const response = await apiRequest<{ message?: string }>(
        apiPaths.article.update(articleId),
        {
          method: "PUT",
          body: { content: content.trim() },
        },
      );
      toast.success(response.message ?? "Article updated.");
      await loadVersions();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update article.");
    } finally {
      setWorking(null);
    }
  }

  async function activate(version: ArticleVersionRecord) {
    setWorking(`activate-${version.id}`);
    try {
      const response = await apiRequest<{ message?: string }>(
        apiPaths.article.activate(peripheralId, version.id),
        { method: "POST" },
      );
      toast.success(response.message ?? "Article activated.");
      await loadVersions();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to activate article.",
      );
    } finally {
      setWorking(null);
    }
  }

  async function remove(version: ArticleVersionRecord) {
    if (
      !window.confirm(
        `Permanently delete article #${version.id}? This can fail when comments, ratings or bookmarks reference it.`,
      )
    )
      return;
    setWorking(`delete-${version.id}`);
    try {
      const response = await apiRequest<{ message?: string }>(
        apiPaths.article.remove(version.id),
        { method: "DELETE" },
      );
      toast.success(response.message ?? "Article deleted.");
      await loadVersions();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete article.");
    } finally {
      setWorking(null);
    }
  }

  if (loading)
    return (
      <div className="loading-panel">
        <LoaderCircle className="spin" size={24} /> Loading content workspace…
      </div>
    );

  return (
    <div className="workspace-stack">
      <section className="dashboard-section">
        <div className="toolbar">
          <div>
            <p className="eyebrow" style={{ color: "var(--red)" }}>
              {createOnly ? "New version" : "Content editor"}
            </p>
            <h2>
              {createOnly
                ? "Write a new article version"
                : "Create or update article content"}
            </h2>
          </div>
          <FilePlus2 size={28} color="var(--teal)" />
        </div>

        <form onSubmit={createVersion} className="workspace-form">
          <div className="form-grid">
            <div className="field">
              <label className="label" htmlFor="peripheral-select">
                Peripheral category
              </label>
              <select
                id="peripheral-select"
                className="select"
                value={peripheralId}
                onChange={(event) => setPeripheralId(event.target.value)}
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.id}. {category.name}
                  </option>
                ))}
              </select>
            </div>
            {!createOnly ? (
              <div className="field">
                <label className="label" htmlFor="article-id">
                  Existing article ID
                </label>
                <div className="input-action-row">
                  <input
                    id="article-id"
                    className="input"
                    inputMode="numeric"
                    value={articleId}
                    onChange={(event) =>
                      setArticleId(event.target.value.replace(/\D/g, ""))
                    }
                    placeholder="Load for editing"
                  />
                  <button
                    type="button"
                    className="icon-button"
                    onClick={() => void loadArticle()}
                    disabled={working !== null || !articleId}
                  >
                    <RefreshCw size={17} />
                  </button>
                </div>
              </div>
            ) : null}
          </div>
          <div className="field">
            <label className="label" htmlFor="article-content">
              HTML article content
            </label>
            <textarea
              id="article-content"
              className="textarea code-textarea"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder={`Write the ${selectedCategory?.name ?? "peripheral"} article as HTML or plain text.`}
              required
            />
            <small className="muted">
              Write clear, well-structured content with useful headings, examples and
              practical explanations.
            </small>
          </div>
          <div className="actions">
            <button
              className="button red"
              type="submit"
              disabled={working !== null || !content.trim()}
            >
              {working === "create" ? (
                <LoaderCircle className="spin" size={17} />
              ) : (
                <FilePlus2 size={17} />
              )}
              Create new version
            </button>
            {!createOnly ? (
              <button
                className="button"
                type="button"
                disabled={working !== null || !articleId || !content.trim()}
                onClick={() => void updateArticle()}
              >
                {working === "update" ? (
                  <LoaderCircle className="spin" size={17} />
                ) : (
                  <Save size={17} />
                )}
                Update selected article
              </button>
            ) : null}
            {articleId ? (
              <Link
                className="button ghost"
                href={`/articles/${articleId}`}
                target="_blank"
              >
                <Eye size={17} /> Preview
              </Link>
            ) : null}
          </div>
        </form>
      </section>

      {admin && !createOnly ? (
        <section className="dashboard-section">
          <div className="toolbar">
            <div>
              <p className="eyebrow muted">Admin version control</p>
              <h2>{selectedCategory?.name ?? "Peripheral"} versions</h2>
            </div>
            <button
              className="button ghost"
              onClick={() => void loadVersions()}
              disabled={working !== null}
            >
              <RefreshCw size={17} /> Refresh
            </button>
          </div>
          <div className="responsive-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Version</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Creator</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {versions.map((version) => (
                  <tr key={version.id}>
                    <td>#{version.id}</td>
                    <td>v{version.version_number}</td>
                    <td>
                      <span className={`status ${version.is_active ? "aqua" : ""}`}>
                        {version.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>{new Date(version.created_at).toLocaleString()}</td>
                    <td>#{version.created_by}</td>
                    <td>
                      <div className="actions compact">
                        <button
                          className="icon-button"
                          title="Load for editing"
                          onClick={() => {
                            setArticleId(String(version.id));
                            void loadArticleById(
                              version.id,
                              setArticleId,
                              setContent,
                              setPeripheralId,
                              setWorking,
                            );
                          }}
                        >
                          <Pencil size={16} />
                        </button>
                        {!version.is_active ? (
                          <button
                            className="icon-button"
                            title="Make active"
                            disabled={working !== null}
                            onClick={() => void activate(version)}
                          >
                            {working === `activate-${version.id}` ? (
                              <LoaderCircle className="spin" size={16} />
                            ) : (
                              <CheckCircle2 size={16} />
                            )}
                          </button>
                        ) : null}
                        <button
                          className="icon-button danger-icon"
                          title="Delete"
                          disabled={working !== null}
                          onClick={() => void remove(version)}
                        >
                          {working === `delete-${version.id}` ? (
                            <LoaderCircle className="spin" size={16} />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {versions.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <div className="empty-state">
                        No article versions are available for this peripheral.
                      </div>
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  );
}

async function loadArticleById(
  id: number,
  setArticleId: (value: string) => void,
  setContent: (value: string) => void,
  setPeripheralId: (value: string) => void,
  setWorking: (value: string | null) => void,
) {
  setArticleId(String(id));
  setWorking("load");
  try {
    const response = await apiRequest<ApiEnvelope<ArticleRecord>>(
      apiPaths.article.detail(id),
    );
    setContent(response.data.content ?? "");
    setPeripheralId(String(response.data.peripheral_id));
    toast.success(`Loaded article #${id}.`);
  } catch (error) {
    toast.error(error instanceof Error ? error.message : "Unable to load article.");
  } finally {
    setWorking(null);
  }
}
