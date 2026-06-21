import Link from "next/link";
import { KeyRound } from "lucide-react";

import { DashboardPage } from "@/components/dashboard-page";
import { ProfileManager } from "@/components/profile-manager";

export default function UserSettingsPage() {
  return (
    <DashboardPage
      eyebrow="Account settings"
      title="Security and account."
      description="Protect your account, update your password and review permanent account removal carefully."
    >
      <section className="dashboard-section">
        <h2>Password security</h2>
        <p className="muted">
          Verify your email with a six-digit code before choosing a new password.
        </p>
        <Link className="button" href="/change-password">
          <KeyRound size={17} /> Change password
        </Link>
      </section>
      <ProfileManager showDangerZone />
    </DashboardPage>
  );
}
