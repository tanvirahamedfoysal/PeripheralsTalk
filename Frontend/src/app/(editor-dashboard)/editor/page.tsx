import Link from "next/link";
import { ArrowRight, FilePlus2, FolderKanban, Pencil } from "lucide-react";

import { DashboardPage, Metrics } from "@/components/dashboard-page";
import { requireRole } from "@/lib/auth/guards";

export default async function EditorDashboardPage(): Promise<React.ReactElement> {
  const session = await requireRole("EDITOR");

  return (
    <DashboardPage
      eyebrow="Editor workspace"
      title="Publish reliable knowledge."
      description="Create clear lessons, refine existing articles and help learners understand technical ideas with confidence."
    >
      <Metrics
        items={[
          {
            label: "Role",
            value: "EDITOR",
            note: "Create and improve learning content",
          },
          {
            label: "Account",
            value: session.user.isActive ? "Active" : "Suspended",
            note: session.user.email,
          },
          {
            label: "Editorial focus",
            value: "Clarity first",
            note: "Make every explanation useful and easy to follow",
          },
        ]}
      />

      <div className="grid-3 dashboard-link-grid">
        <Link className="dashboard-link-card" href="/editor/articles/new">
          <FilePlus2 size={25} />
          <h3>New lesson</h3>
          <p>Draft a focused explanation for a peripheral topic.</p>
          <span>
            Write <ArrowRight size={15} />
          </span>
        </Link>

        <Link className="dashboard-link-card" href="/editor/articles">
          <Pencil size={25} />
          <h3>Improve an article</h3>
          <p>Refine examples, explanations and supporting details.</p>
          <span>
            Edit <ArrowRight size={15} />
          </span>
        </Link>

        <Link className="dashboard-link-card" href="/editor/media">
          <FolderKanban size={25} />
          <h3>Learning media</h3>
          <p>Add helpful visuals that make difficult ideas easier to understand.</p>
          <span>
            Upload <ArrowRight size={15} />
          </span>
        </Link>
      </div>
    </DashboardPage>
  );
}
