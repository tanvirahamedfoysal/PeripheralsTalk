import { PublicShell } from "@/components/public-shell";
import { SiteHeader } from "@/components/site-header";
import { Footer } from "@/components/footer";
import { BookOpen, ShieldCheck, Users } from "lucide-react";
export default function About() {
  return (
    <PublicShell>
      <SiteHeader />
      <header className="about-hero">
        <div>
          <p className="eyebrow" style={{ color: "var(--red)" }}>
            About the platform
          </p>
          <h1 className="display">Built for clarity.</h1>
        </div>
        <p>
          PeripheralsTalk organizes computer peripheral knowledge into structured
          categories, editable articles and accountable community discussions.
        </p>
      </header>
      <section className="section" style={{ paddingTop: 20 }}>
        <div className="grid-3">
          <div className="card">
            <BookOpen size={32} color="var(--red)" />
            <h2>Structured archive</h2>
            <p className="muted">
              Fourteen peripheral families each expose the specifications that matter
              for that type of device.
            </p>
          </div>
          <div className="card">
            <Users size={32} color="var(--teal)" />
            <h2>Community context</h2>
            <p className="muted">
              Users comment, reply, vote, rate and bookmark while Editors maintain
              content quality.
            </p>
          </div>
          <div className="card">
            <ShieldCheck size={32} color="var(--success)" />
            <h2>Role accountability</h2>
            <p className="muted">
              Clear community roles keep participation, editorial work and platform
              administration organized and accountable.
            </p>
          </div>
        </div>
      </section>
      <section className="section" style={{ background: "#fff" }}>
        <div className="section-head">
          <div>
            <p className="eyebrow" style={{ color: "var(--teal)" }}>
              Our approach
            </p>
            <h2 className="section-title">Design knowledge like a product.</h2>
          </div>
          <p>
            Large typography, restrained color, clear metadata and category-first
            navigation make technical information easier to scan and understand.
          </p>
        </div>
      </section>
      <Footer />
    </PublicShell>
  );
}
