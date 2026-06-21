import { DashboardPage } from "@/components/dashboard-page";
import { MediaUploader } from "@/components/media-uploader";

export default function EditorMediaPage() {
  return (
    <DashboardPage
      eyebrow="Learning media"
      title="Upload article images."
      description="Add clear, relevant images that make technical ideas easier for learners to understand."
    >
      <MediaUploader />
    </DashboardPage>
  );
}
