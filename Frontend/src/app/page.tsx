"use client";
import Link from "next/link";
import { ArrowRight, Cpu, Sparkles } from "lucide-react";
import { PublicShell } from "@/components/public-shell";
import { SiteHeader } from "@/components/site-header";
import { Footer } from "@/components/footer";
import { CategoryGrid } from "@/components/category-grid";
export default function Home() {
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
              PeripheralsTalk brings specifications, expert edits and community
              discussion into one carefully organized archive.
            </p>
          </div>
          <div className="hero-actions">
            <Link className="button red" href="/categories">
              Explore 14 categories <ArrowRight size={18} />
            </Link>
            <Link
              className="button ghost"
              style={{ color: "#fff", borderColor: "rgba(255,255,255,.25)" }}
              href="/register"
            >
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
              <span className="eyebrow muted">Archive system</span>
              <br />
              <b>Specifications + discussion</b>
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
            The home sidebar stays compact with recognizable icons. Expand it whenever
            you need the full category names.
          </p>
        </div>
        <CategoryGrid />
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
