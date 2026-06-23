"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Bookmark,
  Check,
  ChevronDown,
  ChevronUp,
  Edit3,
  Eye,
  Flag,
  Hash,
  LoaderCircle,
  MessageCircle,
  Pencil,
  Reply,
  Send,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";

import { RichTextEditor } from "@/components/rich-text-editor";
import { parseArticleDocument, serializeArticleDocument } from "@/lib/article-document";
import { apiRequest } from "@/lib/api/client";
import { apiPaths } from "@/lib/api/paths";
import type {
  ApiEnvelope,
  ArticleRecord,
  CommentApiRecord,
  CommentNode,
  CommentRecord,
} from "@/lib/api/types";
import { rememberArticle } from "@/lib/recent-articles";
import {
  isArticleSaved,
  removeArticleFromDashboard,
  saveArticleForDashboard,
} from "@/lib/saved-articles";
import { sanitizeArticleHtml } from "@/lib/sanitize-html";
import { useSession } from "@/providers/session-provider";

type VoteType = "UPVOTE" | "DOWNVOTE" | null;

function normalizeComment(comment: CommentApiRecord): CommentRecord {
  return {
    id: Number(comment.comment_id),
    parent_comment_id:
      comment.parent_comment_id === null ? null : Number(comment.parent_comment_id),
    content: comment.content,
    created_at: comment.created_at,
    updated_at: comment.updated_at,
    is_deleted: Boolean(comment.is_deleted),
    author_id: Number(comment.author_id),
    author_username: comment.author_username,
    author_name: comment.author_name,
    upvotes: Number(comment.upvotes || 0),
    downvotes: Number(comment.downvotes || 0),
  };
}

function buildCommentTree(comments: CommentRecord[]): CommentNode[] {
  const map = new Map<number, CommentNode>();
  const roots: CommentNode[] = [];

  comments.forEach((comment) => {
    map.set(comment.id, { ...comment, replies: [] });
  });

  comments.forEach((comment) => {
    const node = map.get(comment.id);
    if (!node) return;
    if (comment.parent_comment_id && map.has(comment.parent_comment_id)) {
      map.get(comment.parent_comment_id)?.replies.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}

export function ArticleExperience({ articleId }: { articleId: string }) {
  const { session, loading: sessionLoading } = useSession();
  const [article, setArticle] = useState<ArticleRecord | null>(null);
  const [comments, setComments] = useState<CommentRecord[]>([]);
  const [commentVotes, setCommentVotes] = useState<Record<number, VoteType>>({});
  const [userRating, setUserRating] = useState<number | null>(null);
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [working, setWorking] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const privileged = session?.user.role === "ADMIN" || session?.user.role === "EDITOR";

  const loadArticle = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const articlePayload = await apiRequest<ApiEnvelope<ArticleRecord>>(
        apiPaths.article.detail(articleId),
      );
      setArticle(articlePayload.data);
      rememberArticle(articlePayload.data);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load article.");
    } finally {
      setLoading(false);
    }
  }, [articleId]);

  const loadRating = useCallback(async () => {
    if (!session) return;
    try {
      const payload = await apiRequest<
        ApiEnvelope<{ is_rated: boolean; rating: number | null }>
      >(apiPaths.article.isRated(articleId));
      setUserRating(payload.data?.is_rated ? Number(payload.data.rating) : null);
    } catch {
      setUserRating(null);
    }
  }, [articleId, session]);

  const loadComments = useCallback(async () => {
    if (!session) {
      setComments([]);
      setCommentVotes({});
      return;
    }

    try {
      const payload = await apiRequest<{ message?: string; data: CommentApiRecord[] }>(
        apiPaths.comment.list(articleId),
      );
      const normalized = (payload.data ?? []).map(normalizeComment);
      setComments(normalized);
      setCommentError(null);

      const results = await Promise.allSettled(
        normalized.map((comment) =>
          apiRequest<ApiEnvelope<{ is_voted: boolean; vote_type: VoteType }>>(
            apiPaths.comment.isVoted(comment.id),
          ),
        ),
      );
      const votes: Record<number, VoteType> = {};
      results.forEach((result, index) => {
        const id = normalized[index]?.id;
        if (!id) return;
        votes[id] =
          result.status === "fulfilled" && result.value.data?.is_voted
            ? result.value.data.vote_type
            : null;
      });
      setCommentVotes(votes);
    } catch (caught) {
      setCommentError(
        caught instanceof Error ? caught.message : "Unable to load the discussion.",
      );
    }
  }, [articleId, session]);

  useEffect(() => {
    void loadArticle();
  }, [loadArticle]);

  useEffect(() => {
    if (sessionLoading) return;
    if (!session) {
      setComments([]);
      setCommentVotes({});
      setUserRating(null);
      return;
    }
    void Promise.all([loadComments(), loadRating()]);
  }, [loadComments, loadRating, session, sessionLoading]);

  useEffect(() => {
    if (article && session) {
      setBookmarked(isArticleSaved(session.user.id, article.id));
    } else {
      setBookmarked(false);
    }
  }, [article, session]);

  useEffect(() => {
    if (!editing) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleEscape(event: globalThis.KeyboardEvent): void {
      if (event.key === "Escape" && !savingEdit) {
        setEditing(false);
      }
    }

    window.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [editing, savingEdit]);

  const tree = useMemo(() => buildCommentTree(comments), [comments]);

  async function submitComment(): Promise<void> {
    const content = commentText.trim();
    if (!content) return;
    setWorking("new-comment");
    try {
      await apiRequest(apiPaths.comment.create(articleId), {
        method: "POST",
        body: { content },
      });
      setCommentText("");
      toast.success("Comment added.");
      await loadComments();
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Unable to add comment.");
    } finally {
      setWorking(null);
    }
  }

  async function rateArticle(value: number): Promise<void> {
    if (!article) return;
    setWorking(`rate-${value}`);
    try {
      await apiRequest(apiPaths.article.rate(article.id), {
        method: "POST",
        body: { rating: value },
      });
      setUserRating(value);
      toast.success(`Rated ${value} star${value === 1 ? "" : "s"}.`);
      await loadArticle();
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Unable to rate article.");
    } finally {
      setWorking(null);
    }
  }

  async function toggleBookmark(): Promise<void> {
    if (!article || !session) return;
    setWorking("bookmark");
    try {
      const response = await apiRequest<{
        message?: string;
        is_bookmarked?: boolean;
      }>(apiPaths.article.bookmark(article.id), { method: "POST" });
      const next =
        typeof response.is_bookmarked === "boolean"
          ? response.is_bookmarked
          : !bookmarked;
      setBookmarked(next);
      if (next) {
        saveArticleForDashboard(session.user.id, article);
        toast.success("Saved to dashboard.");
      } else {
        removeArticleFromDashboard(session.user.id, article.id);
        toast.success("Removed from saved articles.");
      }
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Unable to save article.");
    } finally {
      setWorking(null);
    }
  }

  function openEditor(): void {
    if (!article) return;
    const parsed = parseArticleDocument(article.content ?? "");
    setEditTitle(parsed.title || `Article #${article.id}`);
    setEditBody(parsed.bodyHtml);
    setEditing(true);
  }

  async function saveArticleEdit(): Promise<void> {
    if (!article || !editTitle.trim() || !hasMeaningfulBody(editBody)) return;
    setSavingEdit(true);
    try {
      const content = serializeArticleDocument(editTitle, editBody);
      const response = await apiRequest<{ message?: string }>(
        apiPaths.article.update(article.id),
        { method: "PUT", body: { content } },
      );
      setArticle({ ...article, content });
      setEditing(false);
      toast.success(response.message ?? `Article #${article.id} updated.`);
    } catch (caught) {
      toast.error(
        caught instanceof Error ? caught.message : "Unable to update article.",
      );
    } finally {
      setSavingEdit(false);
    }
  }

  if (loading) {
    return (
      <div className="loading-panel">
        <LoaderCircle className="spin" size={28} /> Loading article…
      </div>
    );
  }

  if (error || !article) {
    return (
      <section className="dashboard-section">
        <span className="status red">Unavailable</span>
        <h1 className="section-title" style={{ marginTop: 18 }}>
          Article could not be loaded.
        </h1>
        <p className="muted">{error ?? "No article content is available right now."}</p>
        <Link className="button" href="/articles">
          Try another article ID
        </Link>
      </section>
    );
  }

  const rating = Number(article.average_rating || 0);

  return (
    <>
      <article className="dashboard-section article-reading-card">
        <div className="article-meta-row">
          <div className="author-chip">
            {article.author_image_url ? (
              <Image
                src={article.author_image_url}
                width={42}
                height={42}
                alt=""
                className="avatar"
              />
            ) : (
              <span className="avatar avatar-fallback">
                {article.author_username?.slice(0, 1).toUpperCase() || "A"}
              </span>
            )}
            <div>
              <b>@{article.author_username}</b>
              <small className="muted">
                Version {article.version_number} ·{" "}
                {article.is_active ? "Published" : "Inactive"}
              </small>
            </div>
          </div>

          <div className="article-top-actions">
            {session ? (
              <div className="article-rating-summary">
                <Star size={18} fill="currentColor" />
                <b>{rating.toFixed(1)}</b>
                <span className="muted">({article.total_ratings})</span>
              </div>
            ) : null}
            {privileged ? (
              <button className="button compact-button" onClick={openEditor}>
                <Edit3 size={16} /> Edit article
              </button>
            ) : null}
          </div>
        </div>

        {privileged ? (
          <div className="privileged-article-id">
            <Hash size={15} /> Article ID {article.id}
          </div>
        ) : null}

        <div
          className="rich-article"
          dangerouslySetInnerHTML={{
            __html: sanitizeArticleHtml(article.content || ""),
          }}
        />

        {session ? (
          <div className="article-actions-bar">
            <span className="muted">
              {privileged
                ? `Article #${article.id} · Peripheral #${article.peripheral_id}`
                : "Rate, save, and discuss this lesson."}
            </span>
            <div className="actions compact wrap">
              <div className="article-star-picker" aria-label="Rate article">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    className={`icon-button rating-button${userRating && value <= userRating ? " selected" : ""}`}
                    title={`Rate ${value} stars`}
                    disabled={working !== null}
                    onClick={() => void rateArticle(value)}
                  >
                    <Star
                      size={16}
                      fill={userRating && value <= userRating ? "currentColor" : "none"}
                    />
                  </button>
                ))}
              </div>
              <button
                className={`button aqua${bookmarked ? " saved" : ""}`}
                disabled={working !== null}
                onClick={() => void toggleBookmark()}
              >
                {bookmarked ? <Check size={17} /> : <Bookmark size={17} />}
                {bookmarked ? "Saved to dashboard" : "Save favorite"}
              </button>
            </div>
          </div>
        ) : (
          <div className="article-actions-bar">
            <span className="muted">Sign in to rate, save, and join discussions.</span>
            <Link href="/login" className="button red">
              Sign in to interact
            </Link>
          </div>
        )}
      </article>

      {!sessionLoading && session ? (
        <section className="dashboard-section discussion-section">
          <div className="toolbar">
            <div>
              <p className="eyebrow" style={{ color: "var(--red)" }}>
                Community discussion
              </p>
              <h2>
                {comments.length} comment{comments.length === 1 ? "" : "s"}
              </h2>
            </div>
            <MessageCircle size={26} color="var(--teal)" />
          </div>

          <div className="comment-composer">
            <textarea
              className="textarea"
              value={commentText}
              onChange={(event) => setCommentText(event.target.value)}
              placeholder="Start a useful discussion…"
              maxLength={3000}
            />
            <button
              className="button red"
              disabled={!commentText.trim() || working !== null}
              onClick={() => void submitComment()}
            >
              {working === "new-comment" ? (
                <LoaderCircle className="spin" size={17} />
              ) : (
                <Send size={17} />
              )}
              Post comment
            </button>
          </div>

          {commentError ? (
            <div className="availability-message">{commentError}</div>
          ) : null}

          <div className="comment-list">
            {tree.length > 0 ? (
              tree.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  currentUserId={session.user.id}
                  working={working}
                  voteMap={commentVotes}
                  setWorking={setWorking}
                  reloadComments={loadComments}
                />
              ))
            ) : (
              <div className="empty-state">No comments yet. Start the discussion.</div>
            )}
          </div>
        </section>
      ) : !sessionLoading ? (
        <section className="dashboard-section discussion-section interaction-signin-panel">
          <MessageCircle size={24} />
          <div>
            <h2>Join the discussion</h2>
            <p className="muted">
              Sign in to view comments, ratings, replies and votes.
            </p>
          </div>
          <Link className="button" href="/login">
            Sign in
          </Link>
        </section>
      ) : null}

      {editing && typeof document !== "undefined"
        ? createPortal(
            <div
              className="article-editor-modal-backdrop"
              role="presentation"
              onMouseDown={(event) => {
                if (event.currentTarget === event.target && !savingEdit)
                  setEditing(false);
              }}
            >
              <section
                className="article-editor-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="public-article-edit-title"
              >
                <header className="article-editor-modal-header">
                  <div>
                    <p className="eyebrow muted">Editing article</p>
                    <h2 id="public-article-edit-title">
                      <span className="modal-article-id">#{article.id}</span>{" "}
                      {editTitle}
                    </h2>
                    <p className="muted">
                      Edit the current content and save it directly.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="icon-button"
                    title="Close editor"
                    disabled={savingEdit}
                    onClick={() => setEditing(false)}
                  >
                    <X size={19} />
                  </button>
                </header>
                <div className="article-editor-modal-body">
                  <RichTextEditor
                    title={editTitle}
                    bodyHtml={editBody}
                    disabled={savingEdit}
                    onTitleChange={setEditTitle}
                    onBodyChange={setEditBody}
                  />
                </div>
                <footer className="article-editor-modal-footer">
                  <Link className="button ghost" href={`/articles/${article.id}`}>
                    <Eye size={17} /> Preview
                  </Link>
                  <button
                    className="button red"
                    disabled={
                      savingEdit || !editTitle.trim() || !hasMeaningfulBody(editBody)
                    }
                    onClick={() => void saveArticleEdit()}
                  >
                    {savingEdit ? (
                      <LoaderCircle className="spin" size={17} />
                    ) : (
                      <Edit3 size={17} />
                    )}
                    Save article changes
                  </button>
                </footer>
              </section>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

function CommentItem({
  comment,
  currentUserId,
  working,
  voteMap,
  setWorking,
  reloadComments,
}: {
  comment: CommentNode;
  currentUserId: string;
  working: string | null;
  voteMap: Record<number, VoteType>;
  setWorking: (value: string | null) => void;
  reloadComments: () => Promise<void>;
}) {
  const [replying, setReplying] = useState(false);
  const [editing, setEditing] = useState(false);
  const [reporting, setReporting] = useState(false);
  const own = String(comment.author_id) === String(currentUserId);

  async function runCommentAction(
    key: string,
    action: () => Promise<unknown>,
    success: string,
  ): Promise<boolean> {
    setWorking(key);
    try {
      await action();
      toast.success(success);
      await reloadComments();
      return true;
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "The action failed.");
      return false;
    } finally {
      setWorking(null);
    }
  }

  return (
    <div className={`comment-node${comment.parent_comment_id ? " nested" : ""}`}>
      <div className="comment-card">
        <div className="comment-head">
          <div>
            <b>{comment.author_name}</b>{" "}
            <span className="muted">@{comment.author_username}</span>
          </div>
          <time className="muted">{new Date(comment.created_at).toLocaleString()}</time>
        </div>
        <p>{comment.content}</p>
        <div className="comment-actions">
          <button
            className={voteMap[comment.id] === "UPVOTE" ? "active" : ""}
            disabled={working !== null}
            onClick={() =>
              void runCommentAction(
                `up-${comment.id}`,
                () => apiRequest(apiPaths.comment.up(comment.id), { method: "POST" }),
                "Vote updated.",
              )
            }
          >
            <ChevronUp size={16} /> {comment.upvotes}
          </button>
          <button
            className={voteMap[comment.id] === "DOWNVOTE" ? "active" : ""}
            disabled={working !== null}
            onClick={() =>
              void runCommentAction(
                `down-${comment.id}`,
                () => apiRequest(apiPaths.comment.down(comment.id), { method: "POST" }),
                "Vote updated.",
              )
            }
          >
            <ChevronDown size={16} /> {comment.downvotes}
          </button>
          {!comment.is_deleted ? (
            <button
              onClick={() => {
                setReplying((value) => !value);
                setEditing(false);
                setReporting(false);
              }}
            >
              <Reply size={15} /> Reply
            </button>
          ) : null}
          {own && !comment.is_deleted ? (
            <button
              onClick={() => {
                setEditing((value) => !value);
                setReplying(false);
                setReporting(false);
              }}
            >
              <Pencil size={15} /> Edit
            </button>
          ) : null}
          {own && !comment.is_deleted ? (
            <button
              onClick={() =>
                void runCommentAction(
                  `delete-${comment.id}`,
                  () =>
                    apiRequest(apiPaths.comment.remove(comment.id), {
                      method: "DELETE",
                    }),
                  "Comment deleted.",
                )
              }
            >
              <Trash2 size={15} /> Delete
            </button>
          ) : null}
          {!own && !comment.is_deleted ? (
            <button
              onClick={() => {
                setReporting((value) => !value);
                setReplying(false);
                setEditing(false);
              }}
            >
              <Flag size={15} /> Report
            </button>
          ) : null}
        </div>

        {replying ? (
          <InlineComposer
            placeholder={`Reply to @${comment.author_username}`}
            submitLabel="Post reply"
            onCancel={() => setReplying(false)}
            onSubmit={async (value) => {
              const succeeded = await runCommentAction(
                `reply-${comment.id}`,
                () =>
                  apiRequest(apiPaths.comment.reply(comment.id), {
                    method: "POST",
                    body: { content: value },
                  }),
                "Reply added.",
              );
              if (succeeded) setReplying(false);
            }}
          />
        ) : null}

        {editing ? (
          <InlineComposer
            initialValue={comment.content}
            submitLabel="Save edit"
            onCancel={() => setEditing(false)}
            onSubmit={async (value) => {
              const succeeded = await runCommentAction(
                `edit-${comment.id}`,
                () =>
                  apiRequest(apiPaths.comment.update(comment.id), {
                    method: "PUT",
                    body: { content: value },
                  }),
                "Comment updated.",
              );
              if (succeeded) setEditing(false);
            }}
          />
        ) : null}

        {reporting ? (
          <InlineComposer
            placeholder="Explain why this comment should be reviewed"
            submitLabel="Submit report"
            onCancel={() => setReporting(false)}
            onSubmit={async (value) => {
              const succeeded = await runCommentAction(
                `report-${comment.id}`,
                () =>
                  apiRequest(apiPaths.comment.report(comment.id), {
                    method: "POST",
                    body: { note: value },
                  }),
                "Report submitted.",
              );
              if (succeeded) setReporting(false);
            }}
          />
        ) : null}
      </div>

      {comment.replies.length > 0 ? (
        <div className="comment-children">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              currentUserId={currentUserId}
              working={working}
              voteMap={voteMap}
              setWorking={setWorking}
              reloadComments={reloadComments}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function InlineComposer({
  initialValue = "",
  placeholder = "Write your response…",
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initialValue?: string;
  placeholder?: string;
  submitLabel: string;
  onSubmit: (value: string) => Promise<void>;
  onCancel: () => void;
}) {
  const [value, setValue] = useState(initialValue);
  const [submitting, setSubmitting] = useState(false);

  return (
    <div className="inline-composer">
      <textarea
        className="textarea"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        maxLength={3000}
      />
      <div className="actions compact">
        <button className="button ghost" onClick={onCancel}>
          Cancel
        </button>
        <button
          className="button"
          disabled={!value.trim() || submitting}
          onClick={async () => {
            setSubmitting(true);
            try {
              await onSubmit(value.trim());
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {submitting ? (
            <LoaderCircle className="spin" size={16} />
          ) : (
            <Send size={16} />
          )}
          {submitLabel}
        </button>
      </div>
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
