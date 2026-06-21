import Link from "next/link";
import { KeyRound } from "lucide-react";

import { DashboardPage } from "@/components/dashboard-page";
import { ProfileManager } from "@/components/profile-manager";

export default function UserSettingsPage() {
  return (
    <DashboardPage
      eyebrow="Account settings"
      title="Security and account."
      description="Password changes use the backend's email OTP reset flow. Account deletion is a permanent backend SQL delete attempt."
    >
      <section className="dashboard-section">
        <h2>Password security</h2>
        <p className="muted">
          The backend has no authenticated change-password route, so password changes
          use the supported OTP reset process.
        </p>
        <Link className="button" href="/change-password">
          <KeyRound size={17} /> Change password
        </Link>
      </section>
      <ProfileManager showDangerZone />
    </DashboardPage>
  );
}
