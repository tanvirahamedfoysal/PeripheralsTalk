import Link from "next/link";
import { KeyRound } from "lucide-react";

import { DashboardPage } from "@/components/dashboard-page";
import { ProfileManager } from "@/components/profile-manager";

export default function AdminSettingsPage() {
  return (
    <DashboardPage
      eyebrow="Administration"
      title="Profile and security."
      description="Update the current Admin profile and use the backend-supported OTP password reset process."
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
