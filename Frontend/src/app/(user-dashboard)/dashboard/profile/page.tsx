import { DashboardPage } from "@/components/dashboard-page";
import { ProfileManager } from "@/components/profile-manager";

export default function UserProfilePage() {
  return (
    <DashboardPage
      eyebrow="Account"
      title="Your profile."
      description="Profile information is loaded from and saved to the Neon-backed user record through FastAPI."
    >
      <ProfileManager />
    </DashboardPage>
  );
}
