import { CheckCircle2, MessageSquareText, ShieldCheck } from "lucide-react";

import { DashboardPage } from "@/components/dashboard-page";

export default function EditorModerationPage(): React.ReactElement {
  return (
    <DashboardPage
      eyebrow="Community standards"
      title="Create a respectful learning space."
      description="Use thoughtful language, explain corrections clearly and keep every discussion focused on helping people learn."
    >
      <section className="dashboard-section">
        <div className="grid-3 dashboard-link-grid standards-grid">
          <article className="dashboard-link-card static-card">
            <MessageSquareText size={25} />
            <h3>Explain with care</h3>
            <p>Correct mistakes without discouraging the learner who made them.</p>
          </article>
          <article className="dashboard-link-card static-card">
            <CheckCircle2 size={25} />
            <h3>Check every claim</h3>
            <p>
              Prefer accurate, specific explanations over vague or promotional language.
            </p>
          </article>
          <article className="dashboard-link-card static-card">
            <ShieldCheck size={25} />
            <h3>Keep it constructive</h3>
            <p>
              Guide conversations back to the topic when discussions become unhelpful.
            </p>
          </article>
        </div>
      </section>
    </DashboardPage>
  );
}
