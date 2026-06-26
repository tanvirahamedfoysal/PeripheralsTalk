import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BookMarked,
  BookOpenCheck,
  BrainCircuit,
  CheckCircle2,
  CircleHelp,
  Compass,
  Cpu,
  FileText,
  Gauge,
  GraduationCap,
  Layers3,
  MessageCircle,
  MonitorCog,
  Network,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Wrench,
} from "lucide-react";

import { CategoryGrid } from "@/components/category-grid";
import { Footer } from "@/components/footer";
import { HomePublishedPreview } from "@/components/home-published-preview";
import { HomeTopicFinder } from "@/components/home-topic-finder";
import { PublicShell } from "@/components/public-shell";
import { SiteHeader } from "@/components/site-header";
import { fastApi } from "@/lib/api/server";
import type { ApiEnvelope, CategoryRecord } from "@/lib/api/types";
import { peripheralCategories } from "@/lib/constants/categories";

export const dynamic = "force-dynamic";

const learningMetrics = [
  {
    label: "Learning categories",
    valueKey: "categories",
    note: "Organized by device family",
    icon: Layers3,
  },
  {
    label: "Structured workflow",
    value: "04",
    note: "Discover, compare, study, discuss",
    icon: Compass,
  },
  {
    label: "Article rating scale",
    value: "5★",
    note: "Community usefulness scoring",
    icon: Star,
  },
  {
    label: "Platform roles",
    value: "03",
    note: "Learner, editor and administrator",
    icon: Users,
  },
] as const;

const learningTracks = [
  {
    title: "Build a computer",
    copy: "Understand compatibility, performance trade-offs and the peripherals required for a complete setup.",
    topics: ["Input and output", "Display choices", "Connectivity"],
    icon: MonitorCog,
  },
  {
    title: "Choose before buying",
    copy: "Translate technical specifications into practical differences before spending on a device.",
    topics: ["Specification checks", "Use-case matching", "Value comparison"],
    icon: SearchCheck,
  },
  {
    title: "Troubleshoot devices",
    copy: "Learn the vocabulary and diagnostic sequence used to identify common peripheral problems.",
    topics: ["Signal paths", "Driver checks", "Connection faults"],
    icon: Wrench,
  },
];

const resourceStandards = [
  {
    title: "Concept-first explanations",
    copy: "Every lesson begins with the purpose of the device before introducing technical specifications.",
    icon: BrainCircuit,
  },
  {
    title: "Comparable specification fields",
    copy: "Categories use consistent comparison points so learners can evaluate devices systematically.",
    icon: BarChart3,
  },
  {
    title: "Versioned editorial content",
    copy: "Editors can revise lessons while administrators control which version is actively published.",
    icon: ShieldCheck,
  },
  {
    title: "Community knowledge signals",
    copy: "Ratings, comments, replies, reports and bookmarks help useful explanations remain discoverable.",
    icon: MessageCircle,
  },
];

export default async function HomePage(): Promise<React.ReactElement> {
  const result = await fastApi<ApiEnvelope<CategoryRecord[]>>("category/", {
    method: "GET",
  });

  const fallbackCategories = peripheralCategories.map(({ id, name }) => ({ id, name }));
  const categories = result.ok && result.data.data?.length
    ? [...result.data.data].sort((a, b) => a.id - b.id)
    : fallbackCategories;
  const categoryCount = categories.length;
  const featuredCategories = categories.slice(0, 8);

  return (
    <PublicShell>
      <SiteHeader />

      <main className="premium-home dense-home">
        <section className="home-command-bar" aria-label="Learning search">
          <div className="home-command-label">
            <div>
              <span>PeripheralsTalk learning navigator</span>
              <small>Search the live directory and open a structured topic.</small>
            </div>
          </div>
          <HomeTopicFinder categories={categories} />
        </section>

        <section className="home-dashboard-hero">
          <article className="home-intro-panel">
            <div className="home-intro-topline">
              <span className="home-live-badge">
                <span /> Knowledge platform
              </span>
              <span>{categoryCount} active learning categories</span>
            </div>

            <div className="home-intro-copy">
              <p className="eyebrow">Computer peripheral intelligence</p>
              <h1>Learn what devices do, what specifications mean and what to choose.</h1>
              <p>
                A structured learning platform for understanding computer peripherals
                through category guides, versioned articles, practical comparisons and
                focused community discussion.
              </p>
            </div>

            <div className="hero-actions home-intro-actions">
              <Link className="button red" href="/categories">
                Explore the directory <ArrowRight size={18} />
              </Link>
              <Link className="button ghost hero-ghost" href="/articles">
                Open article library
              </Link>
            </div>

            <div className="home-intro-foot">
              <span>
                <CheckCircle2 size={15} /> Beginner friendly
              </span>
              <span>
                <CheckCircle2 size={15} /> Specification focused
              </span>
              <span>
                <CheckCircle2 size={15} /> Community reviewed
              </span>
            </div>
          </article>

          <aside className="home-category-radar" aria-label="Featured categories">
            <div className="home-panel-heading compact">
              <div>
                <p className="eyebrow muted">Topic radar</p>
                <h2>Start with a device family</h2>
              </div>
              <Cpu size={24} />
            </div>

            <div className="home-radar-list">
              {featuredCategories.slice(0, 6).map((category, index) => (
                <Link href={`/categories/${category.id}`} key={category.id}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <b>{category.name}</b>
                  <ArrowRight size={15} />
                </Link>
              ))}
            </div>

            <Link href="/categories" className="home-radar-footer">
              <span>
                <Layers3 size={16} /> Complete topic directory
              </span>
              <b>{categoryCount}</b>
            </Link>
          </aside>

          <aside className="home-learning-status" aria-label="Platform learning status">
            <div className="home-status-head">
              <div>
                <p className="eyebrow muted">Learning status</p>
                <h2>Resource map</h2>
              </div>
              <Gauge size={23} />
            </div>

            <div className="home-status-score">
              <span>Structured path</span>
              <strong>4 stages</strong>
              <div className="home-progress-track">
                <span />
              </div>
              <small>From first concept to informed discussion</small>
            </div>

            <div className="home-status-list">
              <div>
                <Compass size={17} />
                <span>Discover a category</span>
                <b>01</b>
              </div>
              <div>
                <BarChart3 size={17} />
                <span>Compare key fields</span>
                <b>02</b>
              </div>
              <div>
                <BookOpenCheck size={17} />
                <span>Read the active lesson</span>
                <b>03</b>
              </div>
              <div>
                <MessageCircle size={17} />
                <span>Rate, save and discuss</span>
                <b>04</b>
              </div>
            </div>
          </aside>
        </section>

        <section className="home-metric-strip" aria-label="Platform overview">
          {learningMetrics.map((metric) => {
            const Icon = metric.icon;
            const value = "valueKey" in metric ? categoryCount : metric.value;
            return (
              <article key={metric.label}>
                <div className="home-metric-icon">
                  <Icon size={20} />
                </div>
                <div>
                  <span>{metric.label}</span>
                  <strong>{value}</strong>
                  <small>{metric.note}</small>
                </div>
              </article>
            );
          })}
        </section>

        {!result.ok ? (
          <div className="notice home-api-notice">
            The live category service is temporarily unavailable. The default learning
            directory remains available.
          </div>
        ) : null}

        <section className="home-main-grid">
          <div className="home-directory-panel">
            <div className="home-panel-heading">
              <div>
                <p className="eyebrow" style={{ color: "var(--sand)" }}>
                  Peripheral directory
                </p>
                <h2>Explore the core learning categories</h2>
                <p>
                  Each topic combines a practical overview, specification checklist and
                  its currently active article.
                </p>
              </div>
              <Link href="/categories" className="home-text-link">
                All {categoryCount} topics <ArrowRight size={16} />
              </Link>
            </div>
            <CategoryGrid categories={categories} limit={8} />
          </div>

          <aside className="home-resource-standard-panel">
            <div className="home-panel-heading compact">
              <div>
                <p className="eyebrow muted">Learning architecture</p>
                <h2>How the resource library is organized</h2>
              </div>
              <GraduationCap size={25} />
            </div>

            <div className="home-standard-list">
              {resourceStandards.map((standard, index) => {
                const Icon = standard.icon;
                return (
                  <article key={standard.title}>
                    <span className="home-standard-number">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="home-standard-icon">
                      <Icon size={18} />
                    </div>
                    <div>
                      <h3>{standard.title}</h3>
                      <p>{standard.copy}</p>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="home-standard-summary">
              <BookMarked size={20} />
              <div>
                <b>Save useful lessons to your dashboard</b>
                <p>Authenticated learners can keep a personal reading collection.</p>
              </div>
            </div>
          </aside>
        </section>

        <HomePublishedPreview categories={categories} />

        <section className="home-track-section">
          <div className="home-panel-heading">
            <div>
              <p className="eyebrow muted">Goal-based learning</p>
              <h2>Choose a practical learning track</h2>
              <p>
                Use the directory as a guided reference instead of reading unrelated
                specifications in isolation.
              </p>
            </div>
            <Network size={27} />
          </div>

          <div className="home-track-grid">
            {learningTracks.map((track, index) => {
              const Icon = track.icon;
              return (
                <article key={track.title}>
                  <div className="home-track-topline">
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <Icon size={23} />
                  </div>
                  <h3>{track.title}</h3>
                  <p>{track.copy}</p>
                  <ul>
                    {track.topics.map((topic) => (
                      <li key={topic}>
                        <CheckCircle2 size={14} /> {topic}
                      </li>
                    ))}
                  </ul>
                  <Link href="/categories">
                    Browse relevant topics <ArrowRight size={15} />
                  </Link>
                </article>
              );
            })}
          </div>
        </section>

        <section className="home-utility-grid">
          <article className="home-utility-card">
            <div className="home-utility-icon">
              <FileText size={22} />
            </div>
            <div>
              <p className="eyebrow muted">Article system</p>
              <h3>Versioned lessons with one active publication</h3>
              <p>
                Editors can create revisions while administrators select the article
                version presented to learners.
              </p>
            </div>
            <Link href="/articles">
              Browse articles <ArrowRight size={15} />
            </Link>
          </article>

          <article className="home-utility-card">
            <div className="home-utility-icon">
              <CircleHelp size={22} />
            </div>
            <div>
              <p className="eyebrow muted">Discussion layer</p>
              <h3>Ask questions directly beneath the lesson</h3>
              <p>
                Comments, threaded replies, voting and reporting keep discussion tied to
                the exact learning resource.
              </p>
            </div>
            <Link href="/login">
              Join the community <ArrowRight size={15} />
            </Link>
          </article>

          <article className="home-utility-card home-utility-featured">
            <div className="home-utility-icon">
              <GraduationCap size={22} />
            </div>
            <div>
              <p className="eyebrow">Built for practical understanding</p>
              <h3>Move from unfamiliar terminology to confident hardware decisions.</h3>
              <p>
                Read a topic, inspect its comparison fields, study the active article and
                keep the lesson for later reference.
              </p>
            </div>
            <Link href="/register">
              Create a learner account <ArrowRight size={15} />
            </Link>
          </article>
        </section>

        <section className="home-article-cta dense-cta">
          <div>
            <p className="eyebrow">Complete learning library</p>
            <h2>Use one platform to discover, compare, study and discuss peripherals.</h2>
            <p>
              Start with the category directory or open the article library when you
              already know the lesson you need.
            </p>
          </div>
          <div className="actions wrap">
            <Link className="button red" href="/categories">
              Explore categories <ArrowRight size={18} />
            </Link>
            <Link className="button ghost hero-ghost" href="/articles">
              Browse articles
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </PublicShell>
  );
}
