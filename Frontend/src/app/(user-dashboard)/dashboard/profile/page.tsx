import { DashboardPage } from "@/components/dashboard-page";
import { ProfileManager } from "@/components/profile-manager";

export default function UserProfilePage() {
  return (
    <DashboardPage
      eyebrow="Account"
      title="Your profile."
      description="Keep your name, username and profile image up to date so the community can recognize your contributions."
    >
      <ProfileManager />
    </DashboardPage>
  );
}
