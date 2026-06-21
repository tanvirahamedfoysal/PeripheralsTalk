import { DashboardPage } from "@/components/dashboard-page";
import { MediaUploader } from "@/components/media-uploader";

export default function EditorMediaPage() {
  return (
    <DashboardPage
      eyebrow="Cloud media"
      title="Upload article images."
      description="Uploads are sent as multipart form data to the existing FastAPI Cloudinary endpoint."
    >
      <MediaUploader />
    </DashboardPage>
  );
}
