import Link from "next/link";
import { KeyRound } from "lucide-react";

import { DashboardPage } from "@/components/dashboard-page";
import { ProfileManager } from "@/components/profile-manager";

export default function AdminSettingsPage() {
  return (
    <DashboardPage
      eyebrow="Administration"
      title="Profile and security."
      description="Keep your administrator profile accurate and protect your account with secure password recovery."
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
