"use client";
import { use, useEffect, useState } from "react";
import { Bookmark, ChevronDown, ChevronUp, Flag, Star } from "lucide-react";
import { PublicShell } from "@/components/public-shell";
import { SiteHeader } from "@/components/site-header";
import { Footer } from "@/components/footer";
import { apiPaths } from "@/lib/api/paths";
import { apiRequest, type ApiResult, meaningfulData } from "@/lib/api/client";
import { ApiStatus } from "@/components/api-status";
export default function Article({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [article, setArticle] = useState<ApiResult | null>(null);
  const [comments, setComments] = useState<ApiResult | null>(null);
  const [action, setAction] = useState<ApiResult | null>(null);
  useEffect(() => {
    apiRequest(apiPaths.article.detail(id)).then(setArticle);
    apiRequest(apiPaths.comment.forArticle(id)).then(setComments);
  }, [id]);
  async function run(path: string, body?: unknown) {
    setAction(
      await apiRequest(path, {
        method: "POST",
        body: JSON.stringify(body || {}),
      }),
    );
  }
  return (
    <PublicShell>
      <SiteHeader />
      <article className="article-shell">
        <p className="eyebrow" style={{ color: "var(--red)" }}>
          Article endpoint / {id}
        </p>
        <h1 className="section-title">Peripheral article {id}</h1>
        <p className="muted" style={{ fontSize: 18, lineHeight: 1.8 }}>
          This view is connected to the exact article and comment routes supplied in
          api.zip.
        </p>
        <div className="article-meta">
          <span className="status">
            <Star size={14} />
            1–5 rating
          </span>
          <span className="status">
            <Bookmark size={14} />
            Favourite toggle
          </span>
          <span className="status">Versioned content</span>
        </div>
        <section className="dashboard-section">
          {article && meaningfulData(article.data) ? (
            <pre>{JSON.stringify(article.data, null, 2)}</pre>
          ) : (
            <div className="notice">
              GET /api/v1/article/{id} is present but currently returns “Not implemented
              yet”. The frontend is ready to render title, content, specs, author and
              edit metadata when supplied.
            </div>
          )}
          <ApiStatus result={article} />
        </section>
        <section className="dashboard-section">
          <h2>Reader actions</h2>
          <div className="actions">
            <button
              className="button"
              onClick={() => run(apiPaths.article.vote(id), { rating: 5 })}
            >
              <Star size={16} />
              Rate 5
            </button>
            <button
              className="button aqua"
              onClick={() => run(apiPaths.article.favourite(id))}
            >
              <Bookmark size={16} />
              Toggle favourite
            </button>
          </div>
          <ApiStatus result={action} />
        </section>
        <section className="dashboard-section">
          <h2>Discussion</h2>
          {comments && meaningfulData(comments.data) ? (
            <pre>{JSON.stringify(comments.data, null, 2)}</pre>
          ) : (
            <div className="notice">
              Nested discussion is connected to GET/POST /api/v1/comment/{id}. The
              backend response will replace this message automatically.
            </div>
          )}
          <div className="actions" style={{ marginTop: 16 }}>
            <button
              className="icon-button"
              onClick={() => run(apiPaths.comment.up(id))}
            >
              <ChevronUp size={18} />
            </button>
            <button
              className="icon-button"
              onClick={() => run(apiPaths.comment.down(id))}
            >
              <ChevronDown size={18} />
            </button>
            <button
              className="icon-button"
              onClick={() => run(apiPaths.comment.report(id), { reason: "spam" })}
            >
              <Flag size={18} />
            </button>
          </div>
        </section>
      </article>
      <Footer />
    </PublicShell>
  );
}
