"use client";

import Link from "next/link";
import { ArrowRight, Bookmark, FileSearch } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { apiRequest } from "@/lib/api/client";
import { apiPaths } from "@/lib/api/paths";

export function ArticleQuickTools({ mode }: { mode: "bookmark" | "discussion" }) {
  const [id, setId] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!/^\d+$/.test(id)) return;
    if (mode === "discussion") {
      window.location.assign(`/articles/${id}`);
      return;
    }
    try {
      const result = await apiRequest<{ message?: string }>(
        apiPaths.article.bookmark(id),
        { method: "POST" },
      );
      toast.success(result.message ?? "Bookmark status updated.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to update bookmark.",
      );
    }
  }

  return (
    <section className="dashboard-section">
      <div className="toolbar">
        <div>
          <h2>{mode === "bookmark" ? "Bookmark an article" : "Open a discussion"}</h2>
          <p className="muted">
            {mode === "bookmark"
              ? "The backend supports toggling a bookmark but has no endpoint for listing a user's saved articles."
              : "The backend has no personal-comment history endpoint. Open a known article to view and join its discussion."}
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
        <button className="button red">
          {mode === "bookmark" ? "Toggle bookmark" : "Open discussion"}{" "}
          <ArrowRight size={17} />
        </button>
      </form>
      <Link href="/articles" className="auth-text-link strong">
        Open the public article finder
      </Link>
    </section>
  );
}
