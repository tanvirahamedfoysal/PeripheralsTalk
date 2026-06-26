import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  Brain,
  CheckCircle2,
  Compass,
  MessageCircle,
  MousePointer2,
  Search,
  Sparkles,
} from "lucide-react";

import { CategoryGrid } from "@/components/category-grid";
import { Footer } from "@/components/footer";
import { PublicShell } from "@/components/public-shell";
import { SiteHeader } from "@/components/site-header";
import { fastApi } from "@/lib/api/server";
import type { ApiEnvelope, CategoryRecord } from "@/lib/api/types";

export const dynamic = "force-dynamic";

const learningSteps = [
  {
    title: "Start with the essentials",
    copy: "Choose a peripheral and learn the concepts, vocabulary and decision points that matter most.",
    icon: Compass,
  },
  {
    title: "Compare real specifications",
    copy: "Use practical comparison fields to understand what each device feature actually changes.",
    icon: Search,
  },
  {
    title: "Read structured lessons",
    copy: "Move from quick explanations into longer articles with examples, tables, images and diagrams.",
    icon: BookOpenCheck,
  },
  {
    title: "Discuss and save",
    copy: "Join focused discussions, rate useful explanations and keep favorite articles in your dashboard.",
    icon: MessageCircle,
  },
];

export default async function HomePage(): Promise<React.ReactElement> {
  const result = await fastApi<ApiEnvelope<CategoryRecord[]>>("category/", {
    method: "GET",
  });
  const categories = result.ok ? result.data.data : undefined;
  const categoryCount = categories?.length ?? 14;

  return (
    <PublicShell>
      <SiteHeader />

      <main className="premium-home">
        <section className="premium-hero">
          <div className="premium-hero-copy">
            <p className="eyebrow">Structured hardware learning</p>
            <h1 className="display">Learn peripherals the practical way.</h1>
            <p>
              Build clear understanding through guided categories, comparison
              points, focused articles and community discussion made for computer
              learners.
            </p>
            <div className="hero-actions">
              <Link className="button red" href="/categories">
                Explore categories <ArrowRight size={18} />
              </Link>
              <Link className="button ghost hero-ghost" href="/articles">
                Browse articles
              </Link>
            </div>
          </div>

          <aside className="premium-hero-panel" aria-label="Learning overview">
            <div className="hero-mini-card hero-mini-card-primary">
              <Sparkles size={24} />
              <div>
                <span className="eyebrow">Learning map</span>
                <b>{categoryCount} peripheral categories</b>
              </div>
            </div>
            <div className="hero-insight-grid">
              <div>
                <strong>01</strong>
                <span>Choose a device family</span>
              </div>
              <div>
                <strong>02</strong>
                <span>Compare useful specs</span>
              </div>
              <div>
                <strong>03</strong>
                <span>Read active lessons</span>
              </div>
              <div>
                <strong>04</strong>
                <span>Save and discuss</span>
              </div>
            </div>
            <div className="hero-study-card">
              <Brain size={30} />
              <div>
                <p className="eyebrow muted">For beginners and builders</p>
                <h2>Understand choices before buying or building.</h2>
              </div>
            </div>
          </aside>
        </section>

        <section className="home-learning-strip" aria-label="Learning workflow">
          {learningSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <article className="home-step-card" key={step.title}>
                <span className="home-step-index">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <Icon size={24} />
                <h2>{step.title}</h2>
                <p>{step.copy}</p>
              </article>
            );
          })}
        </section>

        <section className="home-resource-section">
          <div className="home-resource-copy">
            <p className="eyebrow" style={{ color: "var(--sand)" }}>
              Guided resource library
            </p>
            <h2>Move from names to knowledge.</h2>
            <p>
              PeripheralsTalk is organized like a study path: start with a device,
              learn the vocabulary, compare the important fields and then read
              the full lesson when you are ready.
            </p>
            <ul className="home-check-list">
              <li>
                <CheckCircle2 size={18} /> Category-first browsing
              </li>
              <li>
                <CheckCircle2 size={18} /> Structured specification checklists
              </li>
              <li>
                <CheckCircle2 size={18} /> Article discussions and favorites
              </li>
            </ul>
          </div>
          <div className="home-resource-board">
            <div className="resource-line">
              <MousePointer2 size={18} /> Pick a device
            </div>
            <div className="resource-line active">
              <Search size={18} /> Compare specs
            </div>
            <div className="resource-line">
              <BookOpenCheck size={18} /> Read a lesson
            </div>
            <div className="resource-line">
              <MessageCircle size={18} /> Ask, answer, save
            </div>
          </div>
        </section>

        <section className="section home-directory-section">
          <div className="section-head">
            <div>
              <p className="eyebrow" style={{ color: "var(--sand)" }}>
                Peripheral directory
              </p>
              <h2 className="section-title">Choose your learning topic.</h2>
            </div>
            <p>
              Start with the most common device families, then continue into
              focused articles and practical discussions.
            </p>
          </div>

          {!result.ok ? (
            <div className="notice" style={{ marginBottom: 24 }}>
              The live category list is temporarily unavailable. You can still
              browse the default learning directory below.
            </div>
          ) : null}

          <CategoryGrid categories={categories} limit={8} />

          <div className="home-more-link">
            <Link className="button aqua" href="/categories">
              View all categories <ArrowRight size={18} />
            </Link>
          </div>
        </section>

        <section className="home-article-cta">
          <div>
            <p className="eyebrow">Article library</p>
            <h2>Read lessons written for practical understanding.</h2>
          </div>
          <Link className="button red" href="/articles">
            Browse available articles <ArrowRight size={18} />
          </Link>
        </section>
      </main>

      <Footer />
    </PublicShell>
  );
}
