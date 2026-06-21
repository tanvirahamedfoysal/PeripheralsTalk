import { DashboardPage } from "@/components/dashboard-page";
import { EditorRequestForm } from "@/components/editor-request-form";

export default function EditorRequestPage() {
  return (
    <DashboardPage
      eyebrow="Role progression"
      title="Become an Editor."
      description="Submit one pending application for Admin review. Role changes require a fresh login because the role is also stored in the JWT."
    >
      <EditorRequestForm />
    </DashboardPage>
  );
}
