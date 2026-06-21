import Link from "next/link";
import { ArrowRight, BookOpen, MessageSquare, UserCog } from "lucide-react";

import { DashboardPage, Metrics } from "@/components/dashboard-page";
import { requireRole } from "@/lib/auth/guards";

export default async function UserDashboardPage() {
  const session = await requireRole("USER");
  return (
    <DashboardPage
      eyebrow="Community workspace"
      title={`Welcome, ${session.user.name}.`}
      description="Manage your learning profile, participate in discussions and take the next step toward becoming a contributor."
    >
      <Metrics
        items={[
          {
            label: "Role",
            value: session.user.role,
            note: "Your current community access level",
          },
          {
            label: "Account",
            value: session.user.isActive ? "Active" : "Suspended",
            note: session.user.email,
          },
          {
            label: "Username",
            value: `@${session.user.username}`,
            note: `User ID ${session.user.id}`,
          },
        ]}
      />
      <div className="grid-3 dashboard-link-grid">
        <Link className="dashboard-link-card" href="/dashboard/profile">
          <UserCog size={25} />
          <h3>Profile</h3>
          <p>Update your name, username and profile image.</p>
          <span>
            Open <ArrowRight size={15} />
          </span>
        </Link>
        <Link className="dashboard-link-card" href="/dashboard/bookmarks">
          <BookOpen size={25} />
          <h3>Article tools</h3>
          <p>Rate and bookmark a known article ID.</p>
          <span>
            Open <ArrowRight size={15} />
          </span>
        </Link>
        <Link className="dashboard-link-card" href="/dashboard/comments">
          <MessageSquare size={25} />
          <h3>Discussions</h3>
          <p>Open an article and join its nested comment thread.</p>
          <span>
            Open <ArrowRight size={15} />
          </span>
        </Link>
      </div>
    </DashboardPage>
  );
}
