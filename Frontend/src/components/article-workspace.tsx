"use client";

import Link from "next/link";
import {
  CheckCircle2,
  Copy,
  Eye,
  FilePlus2,
  Hash,
  LoaderCircle,
  Pencil,
  RefreshCw,
  Save,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { RichTextEditor } from "@/components/rich-text-editor";
import { apiRequest } from "@/lib/api/client";
import { apiPaths } from "@/lib/api/paths";
import type {
  ApiEnvelope,
  ArticleRecord,
  ArticleVersionRecord,
  CategoryRecord,
} from "@/lib/api/types";
import { parseArticleDocument, serializeArticleDocument } from "@/lib/article-document";

interface CreateArticleResponse {
  is_successful?: boolean;
  message?: string;
  data?: {
    article_id?: number;
    version_number?: number;
    peripheral_id?: number;
  };
}

export function ArticleWorkspace({
  admin = false,
  createOnly = false,
}: {
  admin?: boolean;
  createOnly?: boolean;
}) {
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [peripheralId, setPeripheralId] = useState("1");
  const [versionPeripheralId, setVersionPeripheralId] = useState("1");
  const [title, setTitle] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [articleId, setArticleId] = useState("");
  const [createdArticleId, setCreatedArticleId] = useState<number | null>(null);
  const [versions, setVersions] = useState<ArticleVersionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [versionsLoading, setVersionsLoading] = useState(false);
  const [working, setWorking] = useState<string | null>(null);

  const selectedVersionCategory = useMemo(
    () => categories.find((category) => String(category.id) === versionPeripheralId),
    [categories, versionPeripheralId],
  );

  const activeVersion = useMemo(
    () => versions.find((version) => version.is_active),
    [versions],
  );

  const canSubmit = title.trim().length > 0 && hasMeaningfulBody(bodyHtml);

  const loadCategories = useCallback(async () => {
    try {
      const response = await apiRequest<ApiEnvelope<CategoryRecord[]>>(
        apiPaths.category.list,
      );
      const records = [...(response.data ?? [])].sort((a, b) => a.id - b.id);
      setCategories(records);

      if (records.length > 0) {
        const firstId = String(records[0].id);
        setPeripheralId((current) =>
          records.some((item) => String(item.id) === current) ? current : firstId,
        );
        setVersionPeripheralId((current) =>
          records.some((item) => String(item.id) === current) ? current : firstId,
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

  const loadVersions = useCallback(
    async (categoryId: string) => {
      if (!admin || !categoryId) return;

      setVersionsLoading(true);
      try {
        const response = await apiRequest<ApiEnvelope<ArticleVersionRecord[]>>(
          apiPaths.article.versions(categoryId),
        );
        setVersions(response.data ?? []);
      } catch (error) {
        setVersions([]);
        toast.error(
          error instanceof Error ? error.message : "Unable to load versions.",
        );
      } finally {
        setVersionsLoading(false);
      }
    },
    [admin],
  );

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    if (admin && versionPeripheralId) {
      void loadVersions(versionPeripheralId);
    }
  }, [admin, loadVersions, versionPeripheralId]);

  function documentContent(): string {
    return serializeArticleDocument(title, bodyHtml);
  }

  async function createVersion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setWorking("create");
    try {
      const response = await apiRequest<CreateArticleResponse>(
        apiPaths.article.create,
        {
          method: "POST",
          body: {
            peripheral_id: Number(peripheralId),
            content: documentContent(),
          },
        },
      );

      const generatedId = response.data?.article_id;
      toast.success(response.message ?? "New article version created.");

      if (generatedId) {
        setArticleId(String(generatedId));
        setCreatedArticleId(generatedId);

        try {
          await apiRequest(apiPaths.article.activate(peripheralId, generatedId), {
            method: "POST",
          });
          toast.success(`Article #${generatedId} was created and published.`);
        } catch (activationError) {
          toast.warning(
            activationError instanceof Error
              ? `Article #${generatedId} was created, but the live service did not allow it to be activated: ${activationError.message}`
              : `Article #${generatedId} was created but could not be activated.`,
          );
        }
      }

      setVersionPeripheralId(peripheralId);
      setTitle("");
      setBodyHtml("");

      if (admin) {
        await loadVersions(peripheralId);
      }
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
    await loadArticleById(Number(articleId));
  }

  async function loadArticleById(id: number) {
    setArticleId(String(id));
    setCreatedArticleId(null);
    setWorking("load");
    try {
      const response = await apiRequest<ApiEnvelope<ArticleRecord>>(
        apiPaths.article.detail(id),
      );
      const parsed = parseArticleDocument(response.data.content ?? "");
      setTitle(parsed.title || `Article #${id}`);
      setBodyHtml(parsed.bodyHtml);
      setPeripheralId(String(response.data.peripheral_id));
      setVersionPeripheralId(String(response.data.peripheral_id));
      toast.success(`Loaded article #${id}.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load article.");
    } finally {
      setWorking(null);
    }
  }

  async function updateArticle() {
    if (!/^\d+$/.test(articleId) || !canSubmit) return;
    setWorking("update");
    try {
      const response = await apiRequest<{ message?: string }>(
        apiPaths.article.update(articleId),
        {
          method: "PUT",
          body: { content: documentContent() },
        },
      );
      toast.success(response.message ?? "Article updated.");
      if (admin) {
        await loadVersions(versionPeripheralId);
      }
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
        apiPaths.article.activate(versionPeripheralId, version.id),
        { method: "POST" },
      );
      toast.success(response.message ?? "Article activated.");
      await loadVersions(versionPeripheralId);
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
    ) {
      return;
    }

    setWorking(`delete-${version.id}`);
    try {
      const response = await apiRequest<{ message?: string }>(
        apiPaths.article.remove(version.id),
        { method: "DELETE" },
      );
      toast.success(response.message ?? "Article deleted.");
      await loadVersions(versionPeripheralId);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete article.");
    } finally {
      setWorking(null);
    }
  }

  async function copyArticleId(id: number) {
    try {
      await navigator.clipboard.writeText(String(id));
      toast.success(`Article ID #${id} copied.`);
    } catch {
      toast.error("Unable to copy the article ID.");
    }
  }

  if (loading) {
    return (
      <div className="loading-panel">
        <LoaderCircle className="spin" size={24} /> Loading content workspace…
      </div>
    );
  }

  return (
    <div className="workspace-stack">
      <section className="dashboard-section">
        <div className="toolbar">
          <div>
            <p className="eyebrow" style={{ color: "var(--red)" }}>
              {createOnly ? "New article" : "Content editor"}
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
                {categories.map((category, index) => (
                  <option key={category.id} value={category.id}>
                    {index + 1}. {category.name}
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
                    title="Load article"
                    onClick={() => void loadArticle()}
                    disabled={working !== null || !articleId}
                  >
                    {working === "load" ? (
                      <LoaderCircle className="spin" size={17} />
                    ) : (
                      <RefreshCw size={17} />
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="field">
                <label className="label" htmlFor="generated-article-id">
                  Searchable article ID
                </label>
                <div className="input-action-row">
                  <input
                    id="generated-article-id"
                    className="input"
                    value={createdArticleId ? String(createdArticleId) : ""}
                    placeholder="Assigned after the article is saved"
                    readOnly
                  />
                  <button
                    type="button"
                    className="icon-button"
                    title="Copy article ID"
                    disabled={!createdArticleId}
                    onClick={() =>
                      createdArticleId
                        ? void copyArticleId(createdArticleId)
                        : undefined
                    }
                  >
                    <Copy size={17} />
                  </button>
                </div>
              </div>
            )}
          </div>

          <RichTextEditor
            title={title}
            bodyHtml={bodyHtml}
            disabled={working !== null}
            onTitleChange={setTitle}
            onBodyChange={setBodyHtml}
          />

          <div className="actions">
            <button
              className="button red"
              type="submit"
              disabled={working !== null || !canSubmit}
            >
              {working === "create" ? (
                <LoaderCircle className="spin" size={17} />
              ) : (
                <FilePlus2 size={17} />
              )}
              {createOnly ? "Create article" : "Create new version"}
            </button>

            {!createOnly ? (
              <button
                className="button"
                type="button"
                disabled={working !== null || !articleId || !canSubmit}
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

          {createdArticleId ? (
            <div className="created-article-panel" role="status" aria-live="polite">
              <div className="created-article-icon">
                <Hash size={20} />
              </div>
              <div>
                <strong>Article created with ID #{createdArticleId}</strong>
                <p>
                  Use this number in the Articles page search or when loading the
                  article for editing.
                </p>
              </div>
              <button
                type="button"
                className="button ghost compact-button"
                onClick={() => void copyArticleId(createdArticleId)}
              >
                <Copy size={16} /> Copy ID
              </button>
            </div>
          ) : null}
        </form>
      </section>

      {admin && !createOnly ? (
        <section className="dashboard-section">
          <div className="toolbar version-control-toolbar">
            <div>
              <p className="eyebrow muted">Admin version control</p>
              <h2>{selectedVersionCategory?.name ?? "Peripheral"} versions</h2>
              <p className="muted version-control-summary">
                {activeVersion
                  ? `Article #${activeVersion.id} is currently active.`
                  : "No version is active for this category."}
              </p>
            </div>
            <button
              className="button ghost"
              onClick={() => void loadVersions(versionPeripheralId)}
              disabled={working !== null || versionsLoading}
            >
              {versionsLoading ? (
                <LoaderCircle className="spin" size={17} />
              ) : (
                <RefreshCw size={17} />
              )}
              Refresh
            </button>
          </div>

          <div className="version-category-picker">
            <div className="field">
              <label className="label" htmlFor="version-category-select">
                Choose a category to manage
              </label>
              <select
                id="version-category-select"
                className="select"
                value={versionPeripheralId}
                onChange={(event) => setVersionPeripheralId(event.target.value)}
                disabled={versionsLoading || working !== null}
              >
                {categories.map((category, index) => (
                  <option key={category.id} value={category.id}>
                    {index + 1}. {category.name}
                  </option>
                ))}
              </select>
              <small className="muted">
                Select any category to inspect its versions and choose the one shown on
                the public category page.
              </small>
            </div>
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
                          onClick={() => void loadArticleById(version.id)}
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
                {versions.length === 0 && !versionsLoading ? (
                  <tr>
                    <td colSpan={6}>
                      <div className="empty-state">
                        No article versions are available for this category.
                      </div>
                    </td>
                  </tr>
                ) : null}
                {versionsLoading ? (
                  <tr>
                    <td colSpan={6}>
                      <div className="empty-state">
                        <LoaderCircle className="spin" size={18} /> Loading versions…
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

function hasMeaningfulBody(value: string): boolean {
  const plainText = value
    .replace(/<img\b[^>]*>/gi, " image ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  return plainText.length > 0 || /<img\b/i.test(value) || /<table\b/i.test(value);
}
