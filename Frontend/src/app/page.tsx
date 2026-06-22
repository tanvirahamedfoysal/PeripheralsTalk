import Link from "next/link";
import { ArrowRight, BookOpenCheck } from "lucide-react";

import { CategoryGrid } from "@/components/category-grid";
import { Footer } from "@/components/footer";
import { PublicShell } from "@/components/public-shell";
import { SiteHeader } from "@/components/site-header";
import { fastApi } from "@/lib/api/server";
import type { ApiEnvelope, CategoryRecord } from "@/lib/api/types";

export const dynamic = "force-dynamic";

export default async function HomePage(): Promise<React.ReactElement> {
  const result = await fastApi<ApiEnvelope<CategoryRecord[]>>("category/", {
    method: "GET",
  });
  const categories = result.ok ? result.data.data : undefined;
  const categoryCount = categories?.length ?? 14;

  return (
    <PublicShell>
      <SiteHeader />
      <section className="hero">
        <div className="hero-copy">
          <div>
            <p className="eyebrow" style={{ color: "var(--sand)" }}>
              Learn computer peripherals with confidence
            </p>
            <h1 className="display">Understand every device.</h1>
            <p>
              Build practical knowledge through clear lessons, focused explanations and
              community discussion designed to make complex hardware easier to
              understand.
            </p>
          </div>
          <div className="hero-actions">
            <Link className="button red" href="/categories">
              Explore {categoryCount} categories <ArrowRight size={18} />
            </Link>
            <Link className="button ghost hero-ghost" href="/register">
              Join the community
            </Link>
          </div>
        </div>

        <div
          className="hero-visual hero-study-image"
          aria-label="Students learning together"
        >
          <div className="floating-label">
            <div>
              <span className="eyebrow muted">Guided learning</span>
              <br />
              <b>Explore. Compare. Discuss.</b>
            </div>
            <BookOpenCheck color="var(--sand)" />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <p className="eyebrow" style={{ color: "var(--sand)" }}>
              Peripheral directory
            </p>
            <h2 className="section-title">{categoryCount} ways to explore.</h2>
          </div>
          <p>
            Start with a category, learn the essential concepts and continue into
            detailed articles and community discussions at your own pace.
          </p>
        </div>

        {!result.ok ? (
          <div className="notice" style={{ marginBottom: 24 }}>
            The category list is temporarily unavailable. You can still browse the
            complete learning directory below.
          </div>
        ) : null}

        <CategoryGrid categories={categories} />
      </section>

      <section className="feature-band">
        <h2>
          Learn the essentials.
          <br />
          Apply them with confidence.
        </h2>
        <Link className="button aqua" href="/about">
          Discover our learning approach <ArrowRight size={18} />
        </Link>
      </section>
      <Footer />
    </PublicShell>
  );
}
