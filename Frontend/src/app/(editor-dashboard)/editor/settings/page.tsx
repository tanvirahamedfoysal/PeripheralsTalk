import Link from "next/link";
import { KeyRound } from "lucide-react";

import { DashboardPage } from "@/components/dashboard-page";
import { ProfileManager } from "@/components/profile-manager";

export default function EditorSettingsPage() {
  return (
    <DashboardPage
      eyebrow="Editor settings"
      title="Profile and security."
      description="Update your profile or use the supported email OTP flow to change your password."
    >
      <section className="dashboard-section">
        <h2>Password security</h2>
        <Link className="button" href="/change-password">
          <KeyRound size={17} /> Change password
        </Link>
      </section>
      <ProfileManager />
    </DashboardPage>
  );
}
