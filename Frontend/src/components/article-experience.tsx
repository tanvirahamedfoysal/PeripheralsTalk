"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Bookmark,
  ChevronDown,
  ChevronUp,
  Flag,
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
  CommentNode,
  CommentRecord,
} from "@/lib/api/types";
import { rememberArticle } from "@/lib/recent-articles";
import { sanitizeArticleHtml } from "@/lib/sanitize-html";
import { useSession } from "@/providers/session-provider";

function buildCommentTree(comments: CommentRecord[]): CommentNode[] {
  const map = new Map<number, CommentNode>();
  const roots: CommentNode[] = [];

  for (const comment of comments) {
    map.set(comment.id, { ...comment, replies: [] });
  }

  for (const comment of comments) {
    const node = map.get(comment.id);
    if (!node) continue;
    if (comment.parent_comment_id && map.has(comment.parent_comment_id)) {
      map.get(comment.parent_comment_id)?.replies.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

export function ArticleExperience({ articleId }: { articleId: string }) {
  const { session, loading: sessionLoading } = useSession();
  const [article, setArticle] = useState<ArticleRecord | null>(null);
  const [comments, setComments] = useState<CommentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [working, setWorking] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [articlePayload, commentPayload] = await Promise.all([
        apiRequest<ApiEnvelope<ArticleRecord>>(apiPaths.article.detail(articleId)),
        apiRequest<{ message?: string; data: CommentRecord[] }>(
          apiPaths.comment.list(articleId),
        ),
      ]);
      setArticle(articlePayload.data);
      rememberArticle(articlePayload.data);
      setComments(commentPayload.data ?? []);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load article.");
    } finally {
      setLoading(false);
    }
  }, [articleId]);

  useEffect(() => {
    void load();
  }, [load]);

  const tree = useMemo(() => buildCommentTree(comments), [comments]);

  async function runAction(
    key: string,
    action: () => Promise<unknown>,
    successMessage: string,
  ): Promise<boolean> {
    setWorking(key);
    try {
      await action();
      toast.success(successMessage);
      await load();
      return true;
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "The action failed.");
      return false;
    } finally {
      setWorking(null);
    }
  }

  async function submitComment() {
    if (!commentText.trim()) return;
    const succeeded = await runAction(
      "new-comment",
      () =>
        apiRequest(apiPaths.comment.create(articleId), {
          method: "POST",
          body: { content: commentText.trim() },
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
                {article.author_username?.slice(0, 1).toUpperCase()}
              </span>
            )}
            <div>
              <b>@{article.author_username}</b>
              <small className="muted">
                Version {article.version_number} ·{" "}
                {article.is_active ? "Active" : "Draft"}
              </small>
            </div>
          </div>
          <div className="article-rating-summary">
            <Star size={18} fill="currentColor" />
            <b>{rating.toFixed(1)}</b>
            <span className="muted">({article.total_ratings})</span>
          </div>
        </div>

        <div
          className="rich-article"
          dangerouslySetInnerHTML={{
            __html: sanitizeArticleHtml(article.content || ""),
          }}
        />

        <div className="article-actions-bar">
          <span className="muted">
            Article #{article.id} · Peripheral #{article.peripheral_id}
          </span>
          {session ? (
            <div className="actions compact">
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
              placeholder="Share a useful observation…"
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
  const [text, setText] = useState("");
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
                setReplying((v) => !v);
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
                setEditing((v) => !v);
                setText(comment.content);
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
                setReporting((v) => !v);
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
            initialValue={text}
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
            placeholder="Explain the reason for reporting this comment"
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
