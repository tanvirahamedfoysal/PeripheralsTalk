"use client";

import Link from "next/link";
import { ArrowRight, FileSearch } from "lucide-react";
import { useState, type FormEvent } from "react";

import { Footer } from "@/components/footer";
import { PublicShell } from "@/components/public-shell";
import { PublishedArticles } from "@/components/published-articles";
import { SiteHeader } from "@/components/site-header";

export default function ArticlesIndexPage() {
  const [id, setId] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = id.trim();
    if (/^\d+$/.test(normalized)) window.location.assign(`/articles/${normalized}`);
  }

  return (
    <PublicShell>
      <SiteHeader />
      <main className="article-shell article-directory-page">
        <section className="dashboard-section article-finder">
          <div className="article-finder-icon">
            <FileSearch size={46} />
          </div>
          <p className="eyebrow" style={{ color: "var(--red)" }}>
            Direct article access
          </p>
          <h1 className="section-title">Search any article</h1>
          <p className="muted">
            Enter a known article ID to open it directly or browse the category directory to discover active learning content.
          </p>
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
              Open article <ArrowRight size={17} />
            </button>
          </form>
          <Link href="/categories" className="auth-text-link strong">
            Browse categories instead
          </Link>
        </section>

        <PublishedArticles />
      </main>
      <Footer />
    </PublicShell>
  );
}
