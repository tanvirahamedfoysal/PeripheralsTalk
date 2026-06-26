"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Braces,
  FilePlus2,
  LibraryBig,
  ServerCog,
  Sparkles,
  UsersRound,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

import { useSession } from "@/providers/session-provider";

interface TeamMember {
  name: string;
  role: string;
  description: string;
  imageSrc: string;
  icon: typeof ServerCog;
}

const TEAM_MEMBERS: TeamMember[] = [
  {
    name: "Tanvir Ahamed",
    role: "Backend Architect & API Engineer",
    description:
      "Built and maintains the complete FastAPI backend, including authentication, role-based authorization, database architecture, business logic, API validation, security controls and production deployment.",
    imageSrc: "/tan.jpeg",
    icon: ServerCog,
  },
  {
    name: "Md Mahruf Alam",
    role: "Frontend Architect & Middleware Developer",
    description:
      "Designed and developed the complete Next.js frontend, including the public learning experience, responsive interface, JWT along with role-based dashboards, API integration, rich-text authoring tools and the platform's full visual system.",
    imageSrc: "/me.jpeg",
    icon: Braces,
  },
  {
    name: "Nazmul Hasan",
    role: "Content Researcher & Knowledge Curator",
    description:
      "Researches, prepares and maintains all educational material across the platform, including peripheral categories, learning resources, article content, explanations and the subject knowledge presented to learners.",
    imageSrc: "/ship.jpeg",
    icon: LibraryBig,
  },
];

export function FloatingActionButtons(): React.ReactElement {
  const { session, loading } = useSession();
  const [teamOpen, setTeamOpen] = useState(false);

  const role = session?.user.role;
  const canCreateArticle = role === "ADMIN" || role === "EDITOR";
  const createArticleHref = role === "ADMIN"
    ? "/admin/articles/new"
    : "/editor/articles/new";

  useEffect(() => {
    if (!teamOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") setTeamOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [teamOpen]);

  return (
    <>
      <div className="pt-floating-actions" aria-label="PeripheralsTalk quick actions">
        {!loading && canCreateArticle ? (
          <div className="pt-floating-action-item pt-create-article-item">
            <span className="pt-floating-tooltip" role="tooltip">
              Create a new article
            </span>
            <Link
              href={createArticleHref}
              className="pt-floating-button pt-create-article-button"
              aria-label="Create a new article"
              title="Create a new article"
            >
              <span className="pt-floating-button-glow" aria-hidden="true" />
              <span className="pt-floating-button-ring" aria-hidden="true" />
              <FilePlus2 size={25} strokeWidth={2} aria-hidden="true" />
              <span className="pt-floating-spark pt-floating-spark-one" aria-hidden="true" />
              <span className="pt-floating-spark pt-floating-spark-two" aria-hidden="true" />
            </Link>
          </div>
        ) : null}

        <div className="pt-floating-action-item pt-team-action-item">
          <span className="pt-floating-tooltip" role="tooltip">
            Meet the Peripherals Talk team
          </span>
          <button
            type="button"
            className="pt-floating-button pt-team-button"
            onClick={() => setTeamOpen(true)}
            aria-label="Meet the Peripherals Talk team"
            aria-haspopup="dialog"
            aria-expanded={teamOpen}
          >
            <span className="pt-floating-button-glow" aria-hidden="true" />
            <span className="pt-floating-button-ring" aria-hidden="true" />
            <UsersRound size={26} strokeWidth={2} aria-hidden="true" />
            <span className="pt-floating-wave" aria-hidden="true" />
          </button>
        </div>
      </div>

      {teamOpen ? (
        <div
          className="pt-team-modal-backdrop"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setTeamOpen(false);
          }}
        >
          <section
            className="pt-team-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pt-team-modal-title"
          >
            <div className="pt-team-modal-orb pt-team-modal-orb-one" aria-hidden="true" />
            <div className="pt-team-modal-orb pt-team-modal-orb-two" aria-hidden="true" />

            <button
              type="button"
              className="pt-team-modal-close"
              onClick={() => setTeamOpen(false)}
              aria-label="Close team dialog"
            >
              <X size={22} />
            </button>

            <header className="pt-team-modal-header">
              <span className="pt-team-modal-kicker">
                The people behind the platform
              </span>
              <h2 id="pt-team-modal-title">Meet the Peripherals Talk team</h2>
              <p>
                The minds behind the foundation of the platform, covering the platform&apos;s complete backend,
                complete frontend and full educational content system.
              </p>
            </header>

            <div className="pt-team-member-grid">
              {TEAM_MEMBERS.map((member, index) => {
                const Icon = member.icon;
                return (
                  <article
                    className="pt-team-member-card"
                    key={member.name}
                    style={{ animationDelay: `${150 + index * 110}ms` }}
                  >
                    <div className="pt-team-member-card-top">
                      <div className="pt-team-member-avatar">
                        <Image
                          src={member.imageSrc}
                          alt={`${member.name}, ${member.role}`}
                          fill
                          sizes="96px"
                          className="pt-team-member-photo"
                        />
                        <span className="pt-team-member-role-icon" aria-hidden="true">
                          <Icon size={21} />
                        </span>
                      </div>
                      <span className="pt-team-member-number">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>

                    <div className="pt-team-member-copy">
                      <h3>{member.name}</h3>
                      <strong>{member.role}</strong>
                      <p>{member.description}</p>
                    </div>

                    <div className="pt-team-member-scope">
                      <span />
                      {index === 0
                        ? "Backend systems"
                        : index === 1
                          ? "Frontend experience"
                          : "Knowledge content"}
                    </div>
                  </article>
                );
              })}
            </div>

            <footer className="pt-team-modal-footer">
              <span>Peripherals Talk</span>
              <p>Built as a structured learning platform for computer peripherals.</p>
            </footer>
          </section>
        </div>
      ) : null}
    </>
  );
}
