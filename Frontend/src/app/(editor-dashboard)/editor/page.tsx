import Link from "next/link";
import { ArrowRight, FilePlus2, FolderKanban, Pencil } from "lucide-react";

import { DashboardPage, Metrics } from "@/components/dashboard-page";
import { requireRole } from "@/lib/auth/guards";

export default async function EditorDashboardPage() {
  const session = await requireRole("EDITOR");
  return (
    <DashboardPage
      eyebrow="Editor workspace"
      title="Publish reliable knowledge."
      description="Create new article versions, update known article IDs and upload media through the exact Editor-compatible backend routes."
    >
      <Metrics
        items={[
          {
            label: "Role",
            value: "EDITOR",
            note: "Editor JWT required for article writes",
          },
          {
            label: "Account",
            value: session.user.isActive ? "Active" : "Suspended",
            note: session.user.email,
          },
          {
            label: "Moderation",
            value: "Admin-only",
            note: "The backend has no Editor moderation route",
          },
        ]}
      />
      <div className="grid-3 dashboard-link-grid">
        <Link className="dashboard-link-card" href="/editor/articles/new">
          <FilePlus2 size={25} />
          <h3>New version</h3>
          <p>Create a new inactive article version.</p>
          <span>
            Write <ArrowRight size={15} />
          </span>
        </Link>
        <Link className="dashboard-link-card" href="/editor/articles">
          <Pencil size={25} />
          <h3>Edit article</h3>
          <p>Load and update an existing article ID.</p>
          <span>
            Edit <ArrowRight size={15} />
          </span>
        </Link>
        <Link className="dashboard-link-card" href="/editor/media">
          <FolderKanban size={25} />
          <h3>Media upload</h3>
          <p>Upload images to Cloudinary through FastAPI.</p>
          <span>
            Upload <ArrowRight size={15} />
          </span>
        </Link>
      </div>
    </DashboardPage>
  );
}
