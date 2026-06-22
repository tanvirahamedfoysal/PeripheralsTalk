"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Bookmark,
  ChevronDown,
  ChevronUp,
  Flag,
  Hash,
  LoaderCircle,
  MessageCircle,
  Pencil,
  Reply,
  Send,
  Star,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

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
import { sanitizeArticleHtml } from "@/lib/sanitize-html";
import { useSession } from "@/providers/session-provider";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [working, setWorking] = useState<string | null>(null);

  const loadComments = useCallback(async () => {
    try {
      const payload = await apiRequest<{ message?: string; data: CommentApiRecord[] }>(
        apiPaths.comment.list(articleId),
      );
      setComments((payload.data ?? []).map(normalizeComment));
      setCommentError(null);
    } catch (caught) {
      setCommentError(
        caught instanceof Error ? caught.message : "Unable to load the discussion.",
      );
    }
  }, [articleId]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const articlePayload = await apiRequest<ApiEnvelope<ArticleRecord>>(
        apiPaths.article.detail(articleId),
      );
      setArticle(articlePayload.data);
      rememberArticle(articlePayload.data);
      await loadComments();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load article.");
    } finally {
      setLoading(false);
    }
  }, [articleId, loadComments]);

  useEffect(() => {
    void load();
  }, [load]);

  const tree = useMemo(() => buildCommentTree(comments), [comments]);
  const privileged = session?.user.role === "ADMIN" || session?.user.role === "EDITOR";

  async function runAction(
    key: string,
    action: () => Promise<unknown>,
    successMessage: string,
  ): Promise<boolean> {
    setWorking(key);
    try {
      await action();
      toast.success(successMessage);
      await loadComments();
      return true;
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "The action failed.");
      return false;
    } finally {
      setWorking(null);
    }
  }

  async function submitComment(): Promise<void> {
    const content = commentText.trim();
    if (!content) return;
    const succeeded = await runAction(
      "new-comment",
      () =>
        apiRequest(apiPaths.comment.create(articleId), {
          method: "POST",
          body: { content },
        }),
      "Comment added.",
    );
    if (succeeded) setCommentText("");
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
          <div className="article-rating-summary">
            <Star size={18} fill="currentColor" />
            <b>{rating.toFixed(1)}</b>
            <span className="muted">({article.total_ratings})</span>
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

        <div className="article-actions-bar">
          <span className="muted">
            {privileged
              ? `Article #${article.id} · Peripheral #${article.peripheral_id}`
              : "Rate, save, and discuss this lesson."}
          </span>
          {session ? (
            <div className="actions compact wrap">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  className="icon-button rating-button"
                  title={`Rate ${value} stars`}
                  disabled={working !== null}
                  onClick={() =>
                    void runAction(
                      `rate-${value}`,
                      () =>
                        apiRequest(apiPaths.article.rate(article.id), {
                          method: "POST",
                          body: { rating: value },
                        }),
                      `Rated ${value} star${value === 1 ? "" : "s"}.`,
                    )
                  }
                >
                  {value}
                </button>
              ))}
              <button
                className="button aqua"
                disabled={working !== null}
                onClick={() =>
                  void runAction(
                    "bookmark",
                    () =>
                      apiRequest(apiPaths.article.bookmark(article.id), {
                        method: "POST",
                      }),
                    "Bookmark status updated.",
                  )
                }
              >
                <Bookmark size={17} /> Toggle bookmark
              </button>
            </div>
          ) : (
            <Link href="/login" className="button red">
              Sign in to interact
            </Link>
          )}
        </div>
      </article>

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

        {!sessionLoading && session ? (
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
        ) : (
          <div className="notice">
            Sign in to comment, reply, vote, report, rate and bookmark.
          </div>
        )}

        {commentError ? (
          <div className="availability-message">{commentError}</div>
        ) : null}

        <div className="comment-list">
          {tree.length > 0 ? (
            tree.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                currentUserId={session?.user.id ?? null}
                authenticated={Boolean(session)}
                working={working}
                runAction={runAction}
              />
            ))
          ) : (
            <div className="empty-state">No comments yet. Start the discussion.</div>
          )}
        </div>
      </section>
    </>
  );
}

function CommentItem({
  comment,
  currentUserId,
  authenticated,
  working,
  runAction,
}: {
  comment: CommentNode;
  currentUserId: string | null;
  authenticated: boolean;
  working: string | null;
  runAction: (
    key: string,
    action: () => Promise<unknown>,
    success: string,
  ) => Promise<boolean>;
}) {
  const [replying, setReplying] = useState(false);
  const [editing, setEditing] = useState(false);
  const [reporting, setReporting] = useState(false);
  const own =
    currentUserId !== null && String(comment.author_id) === String(currentUserId);

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
            disabled={!authenticated || working !== null}
            onClick={() =>
              void runAction(
                `up-${comment.id}`,
                () => apiRequest(apiPaths.comment.up(comment.id), { method: "POST" }),
                "Vote updated.",
              )
            }
          >
            <ChevronUp size={16} /> {comment.upvotes}
          </button>
          <button
            disabled={!authenticated || working !== null}
            onClick={() =>
              void runAction(
                `down-${comment.id}`,
                () => apiRequest(apiPaths.comment.down(comment.id), { method: "POST" }),
                "Vote updated.",
              )
            }
          >
            <ChevronDown size={16} /> {comment.downvotes}
          </button>
          {authenticated && !comment.is_deleted ? (
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
                void runAction(
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
          {authenticated && !own && !comment.is_deleted ? (
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
              const succeeded = await runAction(
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
              const succeeded = await runAction(
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
              const succeeded = await runAction(
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
              authenticated={authenticated}
              working={working}
              runAction={runAction}
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
