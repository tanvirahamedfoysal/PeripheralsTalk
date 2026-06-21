import Link from "next/link";
import { ArrowRight, Cpu, Sparkles } from "lucide-react";

import { CategoryGrid } from "@/components/category-grid";
import { Footer } from "@/components/footer";
import { PublicShell } from "@/components/public-shell";
import { SiteHeader } from "@/components/site-header";
import { fastApi } from "@/lib/api/server";
import type { ApiEnvelope, CategoryRecord } from "@/lib/api/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const result = await fastApi<ApiEnvelope<CategoryRecord[]>>("category/", {
    method: "GET",
  });
  const categories = result.ok ? result.data.data : undefined;

  return (
    <PublicShell>
      <SiteHeader />
      <section className="hero">
        <div className="hero-copy">
          <div>
            <p className="eyebrow" style={{ color: "var(--aqua)" }}>
              Structured hardware knowledge
            </p>
            <h1 className="display">Understand every device.</h1>
            <p>
              PeripheralsTalk connects to the deployed FastAPI service and its
              Neon-backed data through a secure server proxy—never directly from the
              browser.
            </p>
          </div>
          <div className="hero-actions">
            <Link className="button red" href="/categories">
              Explore 14 categories <ArrowRight size={18} />
            </Link>
            <Link className="button ghost hero-ghost" href="/register">
              Join the community
            </Link>
          </div>
        </div>
        <div className="hero-visual">
          <div className="orb">
            <Cpu size={92} strokeWidth={1} />
          </div>
          <div className="floating-label">
            <div>
              <span className="eyebrow muted">Live platform</span>
              <br />
              <b>FastAPI + Neon PostgreSQL</b>
            </div>
            <Sparkles color="var(--red)" />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <p className="eyebrow" style={{ color: "var(--red)" }}>
              Peripheral directory
            </p>
            <h2 className="section-title">Fourteen ways to explore.</h2>
          </div>
          <p>
            The compact sidebar shows all fourteen backend category IDs. Expand it to
            reveal their full names.
          </p>
        </div>
        {!result.ok ? (
          <div className="notice" style={{ marginBottom: 24 }}>
            The live category list is temporarily unavailable. The documented
            fourteen-category directory is shown as a safe fallback.
          </div>
        ) : null}
        <CategoryGrid categories={categories} />
      </section>

      <section className="feature-band">
        <h2>
          Useful details.
          <br />
          Human context.
        </h2>
        <Link className="button aqua" href="/about">
          How the platform works <ArrowRight size={18} />
        </Link>
      </section>
      <Footer />
    </PublicShell>
  );
}
