import { PublicShell } from "@/components/public-shell";
import { SiteHeader } from "@/components/site-header";
import { Footer } from "@/components/footer";
import { CategoryGrid } from "@/components/category-grid";
export default function Categories() {
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
          Browse the fourteen structured categories defined by the project
          documentation. Each category has its own specification vocabulary and article
          collection.
        </p>
      </header>
      <section className="section" style={{ paddingTop: 20 }}>
        <CategoryGrid />
      </section>
      <Footer />
    </PublicShell>
  );
}
