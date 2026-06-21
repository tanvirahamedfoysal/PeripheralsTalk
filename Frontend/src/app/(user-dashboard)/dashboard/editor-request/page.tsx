import { DashboardPage } from "@/components/dashboard-page";
import { EditorRequestForm } from "@/components/editor-request-form";

export default function EditorRequestPage() {
  return (
    <DashboardPage
      eyebrow="Role progression"
      title="Become an Editor."
      description="Tell the review team how you would contribute and submit your application for editorial access."
    >
      <EditorRequestForm />
    </DashboardPage>
  );
}
