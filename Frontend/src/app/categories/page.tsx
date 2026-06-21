import { CategoryGrid } from "@/components/category-grid";
import { Footer } from "@/components/footer";
import { PublicShell } from "@/components/public-shell";
import { SiteHeader } from "@/components/site-header";
import { fastApi } from "@/lib/api/server";
import type { ApiEnvelope, CategoryRecord } from "@/lib/api/types";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const result = await fastApi<ApiEnvelope<CategoryRecord[]>>("category/", {
    method: "GET",
  });

  return (
    <PublicShell>
      <SiteHeader />
      <header className="category-hero">
        <div>
          <p className="eyebrow" style={{ color: "var(--red)" }}>
            Complete directory
          </p>
          <h1 className="display">All peripherals.</h1>
        </div>
        <p>
          Choose a topic to learn its essential terms, compare important features and
          continue into detailed lessons.
        </p>
      </header>
      <section className="section" style={{ paddingTop: 20 }}>
        {!result.ok ? (
          <div className="availability-message">
            <b>Unavailable</b>
            <p>
              The live category list could not be loaded. The documented directory
              remains visible.
            </p>
          </div>
        ) : null}
        <CategoryGrid categories={result.ok ? result.data.data : undefined} />
      </section>
      <Footer />
    </PublicShell>
  );
}
